from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Numeric, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import secrets
import urllib

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLAlchemy setup
Base = declarative_base()

params = urllib.parse.quote_plus(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-EF3HO85\\MSSQLSERVER01;"
    "DATABASE=bbpsUserlogin;"
    "Trusted_Connection=yes;"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
SessionLocal = sessionmaker(bind=engine)

# Store logged-in username
current_user = {"username": None}

# Models
class User(Base):
    __tablename__ = "user_info"
    username = Column(String, primary_key=True)
    password = Column(String, nullable=False)
    bear_token = Column(String, nullable=False)

class TopUp(Base):
    __tablename__ = "top_up_details"
    id = Column(Integer, primary_key=True, autoincrement=True)
    top_up_by = Column(String)
    amount = Column(Float)
    recharge_date = Column(DateTime)
    recharge_status = Column(Integer)
    recharge_reference_no = Column(String)
    client_id = Column(String)

class ClientBankDetail(Base):
    __tablename__ = "Client_bank_details"
    Sr_No = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(String)
    bank_name = Column(String)
    virtual_accountNo = Column(String)
    IFSC_code = Column(String)
    Accountholder_name = Column(String)
    Approval_date = Column(DateTime)
    status = Column(Integer)

class BBPSTransaction(Base):
    __tablename__ = "bbps_transactions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    client = Column(String)
    user_mobileno = Column(String)
    user_fullname = Column(String)
    amount = Column(Numeric)
    transaction_date = Column(DateTime)
    transaction_status = Column(Boolean)
    transaction_reference_no = Column(String)
    transaction_xml_response = Column(String)
    approvalRefNumber = Column(String)
    sent_reference_no = Column(String)
    internal_reference_no = Column(String)

# Schemas
class LoginInput(BaseModel):
    username: str
    password: str

class TopUpInput(BaseModel):
    top_up_by: str
    amount: float
    recharge_date: datetime
    recharge_status: int
    recharge_reference_no: str

class BankInput(BaseModel):
    bank_name: str
    virtual_accountNo: str
    IFSC_code: str
    Accountholder_name: str
    Approval_date: datetime
    status: int

# Token Auth Dependency
def get_current_user(token: str = Query(..., alias="bearer_token")):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.bear_token == token).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.username
    finally:
        session.close()

# Routes

@app.post("/login")
def login(data: LoginInput):
    session = SessionLocal()
    try:
        token = secrets.token_hex(16)
        user = User(username=data.username, password=data.password, bear_token=token)
        session.add(user)
        session.commit()
        current_user["username"] = data.username

        topups = session.query(TopUp).filter_by(client_id=data.username).all()
        banks = session.query(ClientBankDetail).filter_by(client_id=data.username).all()

        topup_data = [dict(
            id=t.id, top_up_by=t.top_up_by, amount=t.amount,
            recharge_date=t.recharge_date, recharge_status=t.recharge_status,
            recharge_reference_no=t.recharge_reference_no, client_id=t.client_id
        ) for t in topups]

        bank_data = [dict(
            Sr_No=b.Sr_No, client_id=b.client_id, bank_name=b.bank_name,
            virtual_accountNo=b.virtual_accountNo, IFSC_code=b.IFSC_code,
            Accountholder_name=b.Accountholder_name, Approval_date=b.Approval_date,
            status=b.status
        ) for b in banks]

        return {
            "message": "User logged in",
            "bear_token": token,
            "topups": topup_data,
            "client_banks": bank_data
        }
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        session.close()

@app.get("/login")
def get_login(username: str = Query(...), password: str = Query(...)):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.username == username, User.password == password).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        return {
            "username": user.username,
            "bear_token": user.bear_token
        }
    finally:
        session.close()

@app.post("/topups")
def insert_topup(data: TopUpInput):
    if not current_user["username"]:
        raise HTTPException(status_code=401, detail="Login required")
    session = SessionLocal()
    try:
        record = TopUp(**data.dict(), client_id=current_user["username"])
        session.add(record)
        session.commit()
        return {
            "message": "Top-up inserted",
            "client_id": current_user["username"],
            "topup_id": record.id,
        }
    finally:
        session.close()

@app.post("/client-bank")
def insert_bank(data: BankInput):
    if not current_user["username"]:
        raise HTTPException(status_code=401, detail="Login required")
    session = SessionLocal()
    try:
        record = ClientBankDetail(**data.dict(), client_id=current_user["username"])
        session.add(record)
        session.commit()
        return {
            "message": "Bank detail inserted",
            "client_id": current_user["username"]
        }
    finally:
        session.close()

@app.get("/get")
def get_all():
    session = SessionLocal()
    try:
        users = session.query(User).all()
        topups = session.query(TopUp).all()
        banks = session.query(ClientBankDetail).all()

        return {
            "users": [dict(username=u.username, password=u.password, bear_token=u.bear_token) for u in users],
            "topups": [dict(
                id=t.id, top_up_by=t.top_up_by, amount=t.amount,
                recharge_date=t.recharge_date, recharge_status=t.recharge_status,
                recharge_reference_no=t.recharge_reference_no, client_id=t.client_id
            ) for t in topups],
            "client_banks": [dict(
                Sr_No=b.Sr_No, client_id=b.client_id, bank_name=b.bank_name,
                virtual_accountNo=b.virtual_accountNo, IFSC_code=b.IFSC_code,
                Accountholder_name=b.Accountholder_name, Approval_date=b.Approval_date,
                status=b.status
            ) for b in banks]
        }
    finally:
        session.close()

@app.get("/dashboard")
def dashboard(current_user: str = Depends(get_current_user)):
    client_id = current_user
    conn = engine.raw_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("EXEC dbo.Dashboard_record @client_id = ?", client_id)

        while True:
            try:
                rows = cursor.fetchall()
                if rows:
                    columns = [column[0] for column in cursor.description]
                    data = [dict(zip(columns, row)) for row in rows]
                    cursor.close()
                    conn.commit()
                    return {"dashboard_data": data}
            except Exception:
                pass

            if not cursor.nextset():
                break

        cursor.close()
        conn.commit()
        return {"message": "No dashboard data found for this client_id"}

    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()

@app.get("/transactions")
def get_transactions(current_user: str = Depends(get_current_user)):
    session = SessionLocal()
    try:
        records = session.query(BBPSTransaction).filter(BBPSTransaction.client == current_user).all()
        result = []
        for r in records:
            result.append({
                "id": r.id,
                "client": r.client,
                "user_mobileno": r.user_mobileno,
                "user_fullname": r.user_fullname,
                "amount": float(r.amount) if r.amount else None,
                "transaction_date": r.transaction_date.isoformat() if r.transaction_date else None,
                "transaction_status": r.transaction_status,
                "transaction_reference_no": r.transaction_reference_no,
                "transaction_xml_response": r.transaction_xml_response,
                "approvalRefNumber": r.approvalRefNumber,
                "sent_reference_no": r.sent_reference_no,
                "internal_reference_no": r.internal_reference_no,
            })
        return {"transactions": result}
    finally:
        session.close()

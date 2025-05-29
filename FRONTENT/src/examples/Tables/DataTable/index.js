import React, { useEffect, useState } from "react";

function TransactionsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("bear_token");

    if (!token) {
      setError("No token found, please login.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await fetch(
          `http://127.0.0.1:8001/transactions?bearer_token=${encodeURIComponent(token)}`
        );
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

        const json = await resp.json();
        console.log("API response:", json);

        if (Array.isArray(json.transactions)) {
          setData(json.transactions);
          setError(null);
        } else {
          setData([]);
          setError("No transactions found");
        }
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const style = `
      .styled-table {
        border-collapse: collapse;
        width: max-content;
        min-width: 100%;
        white-space: nowrap;
        margin-top: 20px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        font-size: 13px;
      }
      .styled-table th,
      .styled-table td {
        padding: 10px 40px;
        text-align: left;
        border-bottom: 1px solid #ddd;
        white-space: nowrap;
      }
      .styled-table th {
        background: linear-gradient(to bottom, #3b8dff, #1f70ff);
        color: white;
        font-weight: bold;
      }
      .styled-table tbody tr {
        background: linear-gradient(to bottom, #2e2e2e, #1a1a1a);
        color: white;
      }
      .styled-table tbody tr:hover {
        background-color: #555555;
        cursor: pointer;
      }
      @media screen and (max-width: 768px) {
        .styled-table th,
        .styled-table td {
          padding: 8px 24px;
        }
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (data.length === 0) return <p>No transactions available.</p>;

  const columns = Array.from(
    data.reduce((acc, item) => {
      Object.keys(item).forEach((key) => acc.add(key));
      return acc;
    }, new Set())
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{ overflowX: "auto" }}>
        <table className="styled-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>
                    {row[col] !== undefined
                      ? col.toLowerCase().includes("date")
                        ? new Date(row[col]).toLocaleString()
                        : col.toLowerCase().includes("transaction_xml_response")
                        ? String(row[col]).length > 20
                          ? String(row[col]).substring(0, 20) + "..."
                          : String(row[col])
                        : String(row[col])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;

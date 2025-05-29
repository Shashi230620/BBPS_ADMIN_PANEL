import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function Wallet() {
  const [walletData, setWalletData] = useState([]);
  const [accountDetails, setAccountDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const clientId = localStorage.getItem("client_id");

      if (!clientId) {
        console.warn("Client ID not found in localStorage");
        return;
      }

      try {
        const resp = await fetch("http://127.0.0.1:8001/get");
        const data = await resp.json();
        console.log("API response:", data);

        const filteredTopups = data.topups?.filter((item) => item.client_id === clientId) || [];
        setWalletData(filteredTopups);

        const userBank = data.client_banks?.find((item) => item.client_id === clientId);

        if (userBank) {
          const formattedBank = [
            { field: "Client ID", value: userBank.client_id },
            { field: "Bank Name", value: userBank.bank_name },
            { field: "Virtual Account", value: userBank.virtual_accountNo },
            { field: "IFSC", value: userBank.IFSC_code },
            { field: "Account Holder", value: userBank.Accountholder_name },
            {
              field: "Approval Date",
              value: new Date(userBank.Approval_date).toLocaleString(),
            },
            { field: "Status", value: userBank.status },
          ];
          setAccountDetails(formattedBank);
        } else {
          setAccountDetails([]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        setWalletData([]);
        setAccountDetails([]);
      }
    };

    fetchData();
  }, []);

  // Inject custom styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .styled-table {
        border-collapse: collapse;
        margin-top: 20px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        font-size: 12px;
      }

      .styled-table th,
      .styled-table td {
        padding: 6px 24px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .styled-table th {
        background: linear-gradient(to bottom, #3b8dff, #1f70ff);
        color: white;
        font-weight: bold;
        white-space: nowrap;
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
          padding: 6px 12px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Account Details */}
          <Grid item xs={12} md={4}>
            {/* Increased width from md=3 to md=4 */}
            <Card sx={{ height: "100%", p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Account Details
              </MDTypography>
              <MDBox /* no overflow here to remove scrollbar */>
                <table className="styled-table" style={{ width: "100%" }}>
                  <tbody>
                    {accountDetails.map((row, index) => (
                      <tr key={index}>
                        <td>{row.field}</td>
                        <td>{row.value}</td>
                        <td>
                          <CopyToClipboard text={String(row.value)}>
                            <Icon sx={{ cursor: "pointer", color: "#3b8dff", ml: 1 }}>
                              content_copy
                            </Icon>
                          </CopyToClipboard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </Card>
          </Grid>

          {/* Wallet Transactions */}
          <Grid item xs={12} md={8}>
            {/* Reduced width from md=9 to md=8 */}
            <Card sx={{ height: "100%", p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Wallet Transactions
              </MDTypography>
              <MDBox sx={{ overflowX: "auto" }}>
                <table
                  className="styled-table"
                  style={{ minWidth: "600px", maxWidth: "100%" }}
                  /* reduced minWidth from 800 to 600 */
                >
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Top Up By</th>
                      <th>Amount</th>
                      <th>Recharge Date</th>
                      <th>Recharge Status</th>
                      <th>Recharge Reference No</th>
                      <th>Client ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.top_up_by}</td>
                        <td>{row.amount}</td>
                        <td>{new Date(row.recharge_date).toLocaleString()}</td>
                        <td>{row.recharge_status}</td>
                        <td>{row.recharge_reference_no}</td>
                        <td>{row.client_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Wallet;

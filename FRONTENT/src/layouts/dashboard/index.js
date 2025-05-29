import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

const iconMapping = {
  "Wallet Balance": "account_balance_wallet",
  "Total Credit": "credit_score",
  "Total Debit": "money_off",
  "Success Transaction": "check_circle",
  Processing: "autorenew",
  "Failed Transaction": "cancel",
  "Today Turn over": "today",
  "Monthly Turn Over": "calendar_month",
  "Total Turn Over": "account_balance",
  "Daily Commission": "paid",
  "Monthly Commission": "payments",
  "Total Commission": "attach_money",
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("bear_token");

    function fetchDashboard() {
      fetch(`http://127.0.0.1:8001/dashboard?bearer_token=${token}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch dashboard data");
          return response.json();
        })
        .then((data) => {
          if (isMounted) {
            const dashboardObj = data.dashboard_data?.[0] || {};
            setDashboardData(dashboardObj);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
            setLoading(false);
          }
        });
    }

    if (token) {
      fetchDashboard();
      const intervalId = setInterval(fetchDashboard, 10000); // Fetch every 10 seconds
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    } else {
      setError("User is not authenticated. Token missing.");
      setLoading(false);
    }
  }, []);

  const cards = [
    {
      title: "Wallet Balance",
      count: dashboardData.Wallet_Balance || 0,
      color: "dark",
      percentage: "+55%",
      label: "than last week",
    },
    {
      title: "Total Credit",
      count: dashboardData.Total_Credit || 0,
      color: "info",
      percentage: "+3%",
      label: "than last month",
    },
    {
      title: "Total Debit",
      count: dashboardData.Total_Debit || 0,
      color: "success",
      percentage: "+1%",
      label: "than yesterday",
    },
    {
      title: "Success Transaction",
      count: dashboardData.Success_Trasaction || 0,
      color: "success",
      percentage: "+1%",
      label: "than yesterday",
    },
    {
      title: "Processing",
      count: dashboardData.Processing || 0,
      color: "warning",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Failed Transaction",
      count: dashboardData.Failed_Transaction || 0,
      color: "error",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Today Turn over",
      count: dashboardData.Today_Turnover || 0,
      color: "primary",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Monthly Turn Over",
      count: dashboardData.Monthly_TurnOver || 0,
      color: "secondary",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Total Turn Over",
      count: dashboardData.Total_TurnOver || 0,
      color: "info",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Daily Commission",
      count: dashboardData.Daily_Commision || 0,
      color: "success",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Monthly Commission",
      count: dashboardData.Monthly_Commision || 0,
      color: "warning",
      percentage: "",
      label: "Just updated",
    },
    {
      title: "Total Commission",
      count: dashboardData.Total_Commision || 0,
      color: "error",
      percentage: "",
      label: "Just updated",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center">
          <h3>Loading dashboard data...</h3>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center" color="error.main">
          <h3>Error: {error}</h3>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color={card.color}
                  icon={iconMapping[card.title] || "insert_chart"}
                  title={card.title}
                  count={card.count}
                  percentage={{
                    color: "success",
                    amount: card.percentage,
                    label: card.label,
                  }}
                />
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;

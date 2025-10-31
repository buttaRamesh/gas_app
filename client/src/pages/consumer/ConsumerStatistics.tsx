import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PageHeader } from "../../components/PageHeader";
import { consumersApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { ConsumerStatistics } from "../../types/consumers";

const ConsumerStatisticsPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [statistics, setStatistics] = useState<ConsumerStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      showSnackbar("Failed to fetch statistics", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!statistics) {
    return (
      <Container maxWidth="xl">
        <Typography>No statistics available</Typography>
      </Container>
    );
  }

  // Prepare data for pie charts
  const kycData = [
    { name: "KYC Done", value: statistics.kyc_done, color: "#4caf50" },
    { name: "KYC Pending", value: statistics.kyc_pending, color: "#f44336" },
  ];

  const optingStatusData = [
    { name: "Opt In", value: statistics.by_opting_status["Opt In"] || 0, color: "#4caf50" },
    { name: "Opt Out", value: statistics.by_opting_status["Opt Out"] || 0, color: "#f44336" },
    { name: "Pending", value: statistics.by_opting_status["Pending"] || 0, color: "#ff9800" },
  ];

  const kycCompletionRate = statistics.total_consumers > 0
    ? ((statistics.kyc_done / statistics.total_consumers) * 100).toFixed(1)
    : "0";

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Consumer Statistics"
        description="Overview of consumer data and metrics"
        actions={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/consumers")}
          >
            Back to Consumers
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Consumers
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.total_consumers}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    KYC Done
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.kyc_done}
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    KYC Pending
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.kyc_pending}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    KYC Completion
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {kycCompletionRate}%
                  </Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                KYC Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kycData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {kycData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opting Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={optingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {optingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Opting Status Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Opting Status Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: "2px solid #4caf50",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Opt In
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                      {statistics.by_opting_status["Opt In"] || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: "2px solid #f44336",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Opt Out
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#f44336">
                      {statistics.by_opting_status["Opt Out"] || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: "2px solid #ff9800",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#ff9800">
                      {statistics.by_opting_status["Pending"] || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/consumers/kyc-pending")}
                >
                  View KYC Pending Consumers
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/consumers?opting_status=PENDING")}
                >
                  View Opting Pending
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/consumers/create")}
                >
                  Add New Consumer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConsumerStatisticsPage;

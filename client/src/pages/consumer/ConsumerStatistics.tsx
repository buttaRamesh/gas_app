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
import { LoadingState, ErrorState, EmptyState } from "../../components/common";
import { consumersApi } from "../../services/api";
import type { ConsumerStatistics } from "../../types/consumers";
import { gradients, colors } from "@/theme";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

const ConsumerStatisticsPage = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<ConsumerStatistics | null>(null);

  const { execute: fetchStatistics, loading, error } = useAsyncOperation<{ data: ConsumerStatistics }>({
    errorPrefix: "Failed to load statistics",
    showToast: { error: true, success: false },
    logContext: "ConsumerStatistics.fetchStatistics",
  });

  const loadStatistics = async () => {
    const response = await fetchStatistics(() => consumersApi.getStatistics());
    if (response) {
      setStatistics(response.data);
    }
  };

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !statistics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader
          title="Consumer Statistics"
          description="Overview of consumer data and metrics"
        />
        <LoadingState message="Loading statistics..." />
      </Container>
    );
  }

  if (error && !statistics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader
          title="Consumer Statistics"
          description="Overview of consumer data and metrics"
        />
        <ErrorState
          message={error}
          onRetry={loadStatistics}
        />
      </Container>
    );
  }

  if (!statistics) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PageHeader
          title="Consumer Statistics"
          description="Overview of consumer data and metrics"
        />
        <EmptyState
          message="No statistics available. Please check back later."
        />
      </Container>
    );
  }

  // Prepare data for pie charts
  const kycData = [
    { name: "KYC Done", value: statistics.kyc_done, color: colors.chart.success },
    { name: "KYC Pending", value: statistics.kyc_pending, color: colors.chart.error },
  ];

  const optingStatusData = [
    { name: "Opt In", value: statistics.by_opting_status["Opt In"] || 0, color: colors.chart.success },
    { name: "Opt Out", value: statistics.by_opting_status["Opt Out"] || 0, color: colors.chart.error },
    { name: "Pending", value: statistics.by_opting_status["Pending"] || 0, color: colors.chart.warning },
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
              background: gradients.purple,
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
              background: gradients.pink,
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
              background: gradients.warm,
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
              background: gradients.cyan,
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
                      border: `2px solid ${colors.status.success.main}`,
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Opt In
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={colors.status.success.main}>
                      {statistics.by_opting_status["Opt In"] || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: `2px solid ${colors.status.error.main}`,
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Opt Out
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={colors.status.error.main}>
                      {statistics.by_opting_status["Opt Out"] || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: `2px solid ${colors.status.warning.main}`,
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={colors.status.warning.main}>
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

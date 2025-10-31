import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { addressesApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { AddressStatistics as AddressStatsType } from "../../types/address";

const AddressStatistics = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [stats, setStats] = useState<AddressStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await addressesApi.getStatistics();
      setStats(response.data);
    } catch (error) {
      showSnackbar("Failed to fetch address statistics", "error");
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

  if (!stats) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h6" color="error">
          Failed to load statistics
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Address Statistics"
        description="Overview of address data and distribution"
        actions={
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate("/addresses")}
          >
            Back to Addresses
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Total Addresses Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Addresses
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.total_addresses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* By City */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Cities
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>City/Town/Village</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.by_city && stats.by_city.length > 0 ? (
                      stats.by_city.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.city_town_village || "Unknown"}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* By District */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Districts
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>District</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.by_district && stats.by_district.length > 0 ? (
                      stats.by_district.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.district || "Unknown"}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* By Pin Code */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Pin Codes
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pin Code</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.by_pincode && stats.by_pincode.length > 0 ? (
                      stats.by_pincode.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.pin_code || "Unknown"}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddressStatistics;

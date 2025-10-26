import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { PageHeader } from "../components/PageHeader";
import { consumersApi } from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import type { ConsumerListItem } from "../types/consumers";

const ConsumerKycPending = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [consumers, setConsumers] = useState<ConsumerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKyc, setUpdatingKyc] = useState<number | null>(null);

  useEffect(() => {
    fetchKycPendingConsumers();
  }, []);

  const fetchKycPendingConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getKycPending();
      setConsumers(response.data.results || response.data);
    } catch (error) {
      showSnackbar("Failed to fetch KYC pending consumers", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkKycDone = async (consumerId: number) => {
    try {
      setUpdatingKyc(consumerId);
      await consumersApi.updateKycStatus(consumerId, true);
      showSnackbar("KYC marked as done", "success");
      // Remove from list after successful update
      setConsumers(consumers.filter((c) => c.id !== consumerId));
    } catch (error) {
      showSnackbar("Failed to update KYC status", "error");
      console.error(error);
    } finally {
      setUpdatingKyc(null);
    }
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="KYC Pending Consumers"
        description="Consumers with pending KYC verification"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/consumers/statistics")}
            >
              View Statistics
            </Button>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate("/consumers")}
            >
              Back to Consumers
            </Button>
          </Box>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : consumers.length === 0 ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="h6">All consumers have completed KYC! 🎉</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            There are no consumers with pending KYC verification at this time.
          </Typography>
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Found <strong>{consumers.length}</strong> consumer(s) with pending KYC verification.
            </Typography>
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Consumer Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Opting Status</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumers.map((consumer) => (
                  <TableRow key={consumer.id} hover>
                    <TableCell>{consumer.consumer_number}</TableCell>
                    <TableCell>{consumer.consumer_name}</TableCell>
                    <TableCell>{consumer.category_name || "-"}</TableCell>
                    <TableCell>{consumer.type_name || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={consumer.opting_status_display || consumer.opting_status}
                        color={
                          consumer.opting_status === "OPT_IN"
                            ? "success"
                            : consumer.opting_status === "OPT_OUT"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{consumer.mobile_number || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/consumers/${consumer.id}`)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={
                          updatingKyc === consumer.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CheckIcon />
                          )
                        }
                        onClick={() => handleMarkKycDone(consumer.id)}
                        disabled={updatingKyc === consumer.id}
                        sx={{ ml: 1 }}
                      >
                        Mark Done
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default ConsumerKycPending;

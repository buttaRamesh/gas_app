import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  TextField,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { PageHeader } from "../components/PageHeader";
import { consumersApi, lookupsApi } from "../services/api";
import { useSnackbar } from "../contexts/SnackbarContext";
import type { ConsumerListItem, ConsumerCategory, ConsumerType, OptingStatus } from "../types/consumers";

const Consumers = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [consumers, setConsumers] = useState<ConsumerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consumerToDelete, setConsumerToDelete] = useState<number | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [typeFilter, setTypeFilter] = useState<number | "">("");
  const [optingStatusFilter, setOptingStatusFilter] = useState<OptingStatus | "">("");
  const [kycFilter, setKycFilter] = useState<string>("");

  // Lookups
  const [categories, setCategories] = useState<ConsumerCategory[]>([]);
  const [types, setTypes] = useState<ConsumerType[]>([]);

  useEffect(() => {
    fetchConsumers();
    fetchLookups();
  }, [searchQuery, categoryFilter, typeFilter, optingStatusFilter, kycFilter]);

  const fetchLookups = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        lookupsApi.getConsumerCategories(),
        lookupsApi.getConsumerTypes(),
      ]);
      setCategories(categoriesRes.data);
      setTypes(typesRes.data);
    } catch (error) {
      console.error("Failed to fetch lookups:", error);
    }
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (categoryFilter) filters.category = categoryFilter;
      if (typeFilter) filters.consumer_type = typeFilter;
      if (optingStatusFilter) filters.opting_status = optingStatusFilter;
      if (kycFilter) filters.is_kyc_done = kycFilter === "true";

      const response = await consumersApi.getAll(filters);
      setConsumers(response.data.results || response.data);
    } catch (error) {
      showSnackbar("Failed to fetch consumers", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!consumerToDelete) return;

    try {
      await consumersApi.delete(consumerToDelete);
      showSnackbar("Consumer deleted successfully", "success");
      setDeleteDialogOpen(false);
      setConsumerToDelete(null);
      fetchConsumers();
    } catch (error) {
      showSnackbar("Failed to delete consumer", "error");
      console.error(error);
    }
  };

  const getOptingStatusColor = (status: OptingStatus) => {
    switch (status) {
      case "OPT_IN":
        return "success";
      case "OPT_OUT":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setTypeFilter("");
    setOptingStatusFilter("");
    setKycFilter("");
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Consumers"
        description="Manage gas consumers and their information"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/consumers/kyc-pending")}
            >
              KYC Pending
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/consumers/statistics")}
            >
              Statistics
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/consumers/create")}
            >
              Add Consumer
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Search"
            placeholder="Consumer number, name, ration card, LPG ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value as number | "")}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Consumer Type</InputLabel>
            <Select
              value={typeFilter}
              label="Consumer Type"
              onChange={(e) => setTypeFilter(e.target.value as number | "")}
            >
              <MenuItem value="">All</MenuItem>
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Opting Status</InputLabel>
            <Select
              value={optingStatusFilter}
              label="Opting Status"
              onChange={(e) => setOptingStatusFilter(e.target.value as OptingStatus | "")}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPT_IN">Opt In</MenuItem>
              <MenuItem value="OPT_OUT">Opt Out</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>KYC Status</InputLabel>
            <Select
              value={kycFilter}
              label="KYC Status"
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Done</MenuItem>
              <MenuItem value="false">Pending</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Consumer Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Opting Status</TableCell>
                <TableCell>KYC Status</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consumers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No consumers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                consumers.map((consumer) => (
                  <TableRow key={consumer.id} hover>
                    <TableCell>{consumer.consumer_number}</TableCell>
                    <TableCell>{consumer.consumer_name}</TableCell>
                    <TableCell>{consumer.category_name || "-"}</TableCell>
                    <TableCell>{consumer.type_name || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={consumer.opting_status_display || consumer.opting_status}
                        color={getOptingStatusColor(consumer.opting_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {consumer.is_kyc_done ? (
                        <CheckIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
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
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/consumers/${consumer.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setConsumerToDelete(consumer.id);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this consumer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Consumers;

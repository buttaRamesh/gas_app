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
  Pagination,
} from "@mui/material";
import {
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

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
  }, [searchQuery, categoryFilter, typeFilter, optingStatusFilter, kycFilter, page]);

  const fetchLookups = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        lookupsApi.getConsumerCategories(),
        lookupsApi.getConsumerTypes(),
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setTypes(typesRes.data.results || typesRes.data);
    } catch (error) {
      console.error("Failed to fetch lookups:", error);
    }
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const filters: any = { page };
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (categoryFilter) filters.category = categoryFilter;
      if (typeFilter) filters.consumer_type = typeFilter;
      if (optingStatusFilter) filters.opting_status = optingStatusFilter;
      if (kycFilter) filters.is_kyc_done = kycFilter === "true";

      const response = await consumersApi.getAll(filters);
      const data = response.data;

      setConsumers(data.results || data);

      // Handle pagination data
      if (data.count) {
        setTotalCount(data.count);
        // Assuming page size is 10 (default in Django REST framework)
        setTotalPages(Math.ceil(data.count / 10));
      }
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
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Consumers"
        description="Manage gas consumers and their information"
      />

      {/* Filters */}
      <Paper sx={{ p: 1.5, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Search"
            placeholder="Consumer number, name, ration card, LPG ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              minWidth: 270,
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
          >
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

          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
          >
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

          <FormControl
            size="small"
            sx={{
              minWidth: 162,
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
          >
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

          <FormControl
            size="small"
            sx={{
              minWidth: 135,
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
          >
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

          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ height: 36 }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.main" }}>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Consumer Number
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Opting Status
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    KYC Status
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Mobile
                  </TableCell>
                  <TableCell align="right" sx={{ color: "primary.contrastText", fontWeight: "bold", py: 0.7 }}>
                    Actions
                  </TableCell>
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
                  consumers.map((consumer, index) => (
                    <TableRow
                      key={consumer.id}
                      hover
                      sx={{
                        backgroundColor: index % 2 === 0 ? "action.hover" : "inherit",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      }}
                    >
                      <TableCell sx={{ py: 0.7 }}>{consumer.consumer_number}</TableCell>
                      <TableCell sx={{ py: 0.7 }}>{consumer.consumer_name}</TableCell>
                      <TableCell sx={{ py: 0.7 }}>{consumer.category_name || "-"}</TableCell>
                      <TableCell sx={{ py: 0.7 }}>{consumer.type_name || "-"}</TableCell>
                      <TableCell sx={{ py: 0.7 }}>
                        <Chip
                          label={consumer.opting_status_display || consumer.opting_status}
                          color={getOptingStatusColor(consumer.opting_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.7 }}>
                        {consumer.is_kyc_done ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <CancelIcon color="error" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.7 }}>{consumer.mobile_number || "-"}</TableCell>
                      <TableCell align="right" sx={{ py: 0.7 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/consumers/${consumer.id}`)}
                          title="View Details"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/consumers/${consumer.id}/edit`)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConsumerToDelete(consumer.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
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

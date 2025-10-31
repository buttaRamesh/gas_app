import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { addressesApi } from "../../services/api";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { AddressListItem } from "../../types/address";

const Addresses = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [addresses, setAddresses] = useState<AddressListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [pincodeFilter, setPincodeFilter] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, [searchQuery, cityFilter, districtFilter, pincodeFilter]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (cityFilter.trim()) filters.city_town_village = cityFilter.trim();
      if (districtFilter.trim()) filters.district = districtFilter.trim();
      if (pincodeFilter.trim()) filters.pin_code = pincodeFilter.trim();

      const response = await addressesApi.getAll(filters);
      setAddresses(response.data.results || response.data);
    } catch (error) {
      showSnackbar("Failed to fetch addresses", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;

    try {
      await addressesApi.delete(addressToDelete);
      showSnackbar("Address deleted successfully", "success");
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
      fetchAddresses();
    } catch (error) {
      showSnackbar("Failed to delete address", "error");
      console.error(error);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCityFilter("");
    setDistrictFilter("");
    setPincodeFilter("");
  };

  const openDeleteDialog = (id: number) => {
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Addresses"
        description="Manage addresses for consumers and other entities"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/addresses/statistics")}
            >
              Statistics
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/addresses/create")}
            >
              Add Address
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Search"
            placeholder="Search addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />
          <TextField
            label="City"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="District"
            placeholder="Filter by district..."
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Pin Code"
            placeholder="Filter by pin code..."
            value={pincodeFilter}
            onChange={(e) => setPincodeFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>House No</TableCell>
              <TableCell>Street/Road</TableCell>
              <TableCell>City/Town/Village</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Pin Code</TableCell>
              <TableCell>Content Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : addresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No addresses found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              addresses.map((address) => (
                <TableRow key={address.id} hover>
                  <TableCell>{address.id}</TableCell>
                  <TableCell>{address.house_no || "-"}</TableCell>
                  <TableCell>{address.street_road_name || "-"}</TableCell>
                  <TableCell>{address.city_town_village || "-"}</TableCell>
                  <TableCell>{address.district || "-"}</TableCell>
                  <TableCell>{address.pin_code || "-"}</TableCell>
                  <TableCell>
                    {address.content_type_name ? (
                      <Chip label={address.content_type_name} size="small" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/addresses/${address.id}`)}
                        title="View Details"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/addresses/${address.id}/edit`)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(address.id)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this address? This action cannot be undone.
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

export default Addresses;

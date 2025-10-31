import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  TextField,
  Autocomplete,
} from "@mui/material";
import {
  Person as PersonIcon,
  LocalShipping as RouteIcon,
  People as ConsumersIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { deliveryPersonsApi, routeAssignmentsApi, routesApi } from "@/services/api";
import { DeliveryPerson, Route } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { CustomDataGridToolbar } from "@/components/CustomDataGridToolbar";

interface Consumer {
  consumer_id: number;
  consumer_number: string;
  consumer_name: string;
  mobile: string | null;
  address: string | null;
  route_code: string;
  category: string;
  consumer_type: string;
  cylinders: number;
}

export default function DeliveryPersonDetail() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState<DeliveryPerson | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [consumersRowCount, setConsumersRowCount] = useState(0);
  const [consumersPagination, setConsumersPagination] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      // Reset to first page when search changes
      if (searchInput !== searchQuery) {
        setConsumersPagination(prev => ({ ...prev, page: 0 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (person) {
      fetchConsumers();
    }
  }, [person, consumersPagination, searchQuery]);

  const fetchDeliveryPersons = async () => {
    try {
      const response = await deliveryPersonsApi.getAll();
      const allPersons = Array.isArray(response.data?.results)
        ? response.data.results
        : [];
      setDeliveryPersons(allPersons);

      // If id is in URL, set that person as selected
      if (id && allPersons.length > 0) {
        const selectedPerson = allPersons.find(p => p.id === Number(id));
        if (selectedPerson) {
          setPerson(selectedPerson);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch delivery persons:", err);
      showSnackbar("Failed to load delivery persons", "error");
    }
  };

  const fetchConsumers = async () => {
    if (!person) return;

    try {
      setLoading(true);
      const response = await deliveryPersonsApi.getConsumers(person.id, {
        page: consumersPagination.page + 1,
        page_size: consumersPagination.pageSize,
        search: searchQuery || undefined,
      });

      const data = response.data;
      setConsumers(data.results || []);
      setConsumersRowCount(data.count || 0);
    } catch (err: any) {
      console.error("Failed to fetch consumers:", err);
      showSnackbar("Failed to load consumers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (selectedPerson: DeliveryPerson | null) => {
    setPerson(selectedPerson);
    setConsumersPagination({ page: 0, pageSize: 10 });
    setSearchInput("");
    setSearchQuery("");
  };


  const consumersColumns: GridColDef[] = [
    {
      field: "consumer_number",
      headerName: "Consumer Number",
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: "consumer_name",
      headerName: "Name",
      width: 200,
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      width: 130,
    },
    {
      field: "consumer_type",
      headerName: "Type",
      width: 130,
    },
    {
      field: "route_code",
      headerName: "Route",
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} size="small" />
      ),
    },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 130,
      renderCell: (params) => params.value || "-",
    },
    {
      field: "address",
      headerName: "Address",
      width: 250,
      flex: 1,
      renderCell: (params) => params.value || "-",
    },
    {
      field: "cylinders",
      headerName: "Cylinders",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="info" />
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <Box sx={{ mb: 1.5, width: "40%" }}>
          <Autocomplete
            options={deliveryPersons}
            value={person}
            onChange={(_, value) => handlePersonSelect(value)}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Delivery Person"
                placeholder="Search by name..."
                variant="standard"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Box sx={{ fontWeight: 600 }}>{option.name}</Box>
                  <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {option.assigned_routes_count || 0} routes • {option.total_consumers || 0} consumers
                  </Box>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No delivery persons found"
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 1.5 }}>
          <Card elevation={1} sx={{ bgcolor: "background.paper" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: "info.light",
                    p: 0.75,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RouteIcon color="info" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    {person?.assigned_routes_count || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                    Assigned Routes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={1} sx={{ bgcolor: "background.paper" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    p: 0.75,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConsumersIcon color="success" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    {person?.total_consumers || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                    Total Consumers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card elevation={1} sx={{ bgcolor: "background.paper" }}>
            <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    bgcolor: "primary.light",
                    p: 0.75,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon color="primary" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    {consumersRowCount}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                    Consumers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
          <DataGrid
            rows={consumers}
            columns={consumersColumns}
            getRowId={(row) => row.consumer_id}
            paginationModel={consumersPagination}
            onPaginationModelChange={setConsumersPagination}
            rowCount={consumersRowCount}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            paginationMode="server"
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            disableColumnFilter={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            slots={{
              toolbar: CustomDataGridToolbar,
            }}
            slotProps={{
              toolbar: {
                title: `Consumers for ${person?.name || ""}`,
                onQuickFilterChange: setSearchInput,
                showQuickFilter: true,
                showPrint: true,
                showExport: true,
              } as any,
            }}
            sx={{
              border: 0,
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "action.hover",
              },
              "& .MuiDataGrid-toolbarContainer": {
                display: "flex !important",
              },
            }}
          />
        </Card>
      </Container>
    </Box>
  );
}

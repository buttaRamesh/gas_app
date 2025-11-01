import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  People as ConsumersIcon,
  LocalShipping as RouteIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { consumersApi, routesApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { CustomDataGridToolbar } from "@/components/CustomDataGridToolbar";
import type { Route } from "@/types/routes";

interface ConsumerByRoute {
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

export default function RouteConsumers() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [consumers, setConsumers] = useState<ConsumerByRoute[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      // Reset to first page when search changes
      if (searchInput !== searchQuery) {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (route) {
      fetchConsumers();
    }
  }, [route, paginationModel, searchQuery]);

  const fetchRoutes = async () => {
    try {
      const response = await routesApi.getAll();
      const allRoutes = Array.isArray(response.data?.results)
        ? response.data.results
        : [];
      setRoutes(allRoutes);

      // If id is in URL, set that route as selected
      if (id && allRoutes.length > 0) {
        const selectedRoute = allRoutes.find(r => r.id === Number(id));
        if (selectedRoute) {
          setRoute(selectedRoute);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch routes:", err);
      showSnackbar("Failed to load routes", "error");
    }
  };

  const fetchConsumers = async () => {
    if (!route) return;

    try {
      setLoading(true);
      const response = await consumersApi.getByRoute(route.id, {
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
        search: searchQuery || undefined,
      });

      const data = response.data;
      setConsumers(data.results || []);
      setRowCount(data.count || 0);
    } catch (err: any) {
      console.error("Failed to fetch consumers:", err);
      showSnackbar("Failed to load consumers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (selectedRoute: Route | null) => {
    setRoute(selectedRoute);
    setPaginationModel({ page: 0, pageSize: 10 });
    setSearchInput("");
    setSearchQuery("");
  };

  const columns: GridColDef[] = [
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
        <Box sx={{ mb: 3, width: "40%" }}>
          <Autocomplete
            options={routes}
            value={route}
            onChange={(_, value) => handleRouteSelect(value)}
            getOptionLabel={(option) => option.area_code}
            disableClearable
            popupIcon={null}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Route"
                variant="standard"
                sx={{
                  "& .MuiInputBase-root": {
                    paddingLeft: 2,
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Box sx={{ fontWeight: 600 }}>{option.area_code}</Box>
                  <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {option.area_code_description} • {option.consumer_count || 0} consumers
                  </Box>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No routes found"
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5, mb: 3 }}>
          <Card
            elevation={2}
            sx={{
              bgcolor: "background.paper",
              borderLeft: 4,
              borderColor: "success.main",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Total Consumers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem", mt: 0.5, color: "success.main" }}>
                    {rowCount}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "success.main",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                  }}
                >
                  <ConsumersIcon sx={{ color: "white", fontSize: "2rem" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={2}
            sx={{
              bgcolor: "background.paper",
              borderLeft: 4,
              borderColor: "primary.main",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Route Code
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem", mt: 0.5, color: "primary.main" }}>
                    {route?.area_code || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <PersonIcon sx={{ fontSize: "0.9rem" }} />
                    {route?.delivery_person?.name || "No delivery person"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)",
                  }}
                >
                  <RouteIcon sx={{ color: "white", fontSize: "2rem" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={2}
            sx={{
              bgcolor: "background.paper",
              borderLeft: 4,
              borderColor: "info.main",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Areas Count
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem", mt: 0.5, color: "info.main" }}>
                    {route?.area_count || 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "info.main",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(2, 136, 209, 0.25)",
                  }}
                >
                  <PlaceIcon sx={{ color: "white", fontSize: "2rem" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
          <DataGrid
            rows={consumers}
            columns={columns}
            getRowId={(row) => row.consumer_id}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => {
              console.log('Pagination changed:', newModel);
              setPaginationModel(newModel);
            }}
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            paginationMode="server"
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={40}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{
              toolbar: CustomDataGridToolbar,
            }}
            slotProps={{
              toolbar: {
                title: `Consumers in Route ${route?.area_code || ""}`,
                showQuickFilter: false,
                showPrint: true,
                showExport: true,
              },
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

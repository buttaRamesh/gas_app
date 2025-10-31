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
        <Box sx={{ mb: 1.5, width: "40%" }}>
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
                label="Select Route"
                placeholder="Search by area code..."
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 1.5 }}>
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
                    {rowCount}
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
                    {route?.area_count || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                    Areas
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
                  <RouteIcon color="primary" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    {route?.area_code || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                    {route?.delivery_person?.name ? `${route.delivery_person.name}` : "No delivery"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
          <DataGrid
            rows={consumers}
            columns={columns}
            getRowId={(row) => row.consumer_id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            paginationMode="server"
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            disableColumnFilter={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            showToolbar
            slots={{
              toolbar: CustomDataGridToolbar,
            }}
            slotProps={{
              toolbar: {
                title: `Consumers in Route ${route?.area_code || ""}`,
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

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  People as ConsumersIcon,
  LocalShipping as RouteIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { consumersApi, routesApi } from "@/services/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { PageHeader } from "@/components/PageHeader";
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<Route | null>(null);
  const [consumers, setConsumers] = useState<ConsumerByRoute[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (id) {
      fetchRoute();
    }
  }, [id]);

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
    if (id) {
      fetchConsumers();
    }
  }, [id, paginationModel, searchQuery]);

  const fetchRoute = async () => {
    try {
      const routeRes = await routesApi.getById(Number(id));
      setRoute(routeRes.data);
    } catch (err: any) {
      console.error("Failed to fetch route details:", err);
      showSnackbar("Failed to load route details", "error");
    }
  };

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumersApi.getByRoute(Number(id), {
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

  if (!route && !loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6">Route not found</Typography>
        <IconButton onClick={() => navigate("/routes")} sx={{ mt: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <PageHeader
          title={`Route: ${route?.area_code || "Loading..."}`}
          description={route?.area_code_description || ""}
          actions={
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton
                onClick={() => navigate("/routes")}
                sx={{ bgcolor: "background.paper" }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
          }
        />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 3 }}>
          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "success.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConsumersIcon color="success" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {rowCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Consumers
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Consumers assigned to this route
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "info.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RouteIcon color="info" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {route?.area_count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Areas
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Number of areas in this route
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: "primary.light",
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RouteIcon color="primary" fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {route?.area_code || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Route Code
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {route?.delivery_person_name ? `Delivery: ${route.delivery_person_name}` : "No delivery person assigned"}
              </Typography>
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

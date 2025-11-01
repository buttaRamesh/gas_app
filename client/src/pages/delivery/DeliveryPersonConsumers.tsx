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
  Person as PersonIcon,
  LocalShipping as RouteIcon,
  People as ConsumersIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { deliveryPersonsApi } from "@/services/api";
import type { DeliveryPerson } from "@/types/routes";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { CustomDataGridToolbar } from "@/components/CustomDataGridToolbar";
import { MiniCT } from "@/components/MiniCT";

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

export default function DeliveryPersonConsumers() {
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
  const [exportLoading, setExportLoading] = useState(false);
  

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

    const handleExportCSV = async () => {
      if (!person) return;
  
      try {
        setExportLoading(true);
        // Fetch all data without pagination
        const response = await deliveryPersonsApi.getConsumers(person.id, {
          page: 1,
          page_size: 10000, // Large number to get all records
          search: searchQuery || undefined,
        });
  
        const allConsumers = response.data.results || [];
  
        // Convert to CSV
        const headers = [
          "Consumer Number",
          "Consumer Name",
          "Category",
          "Type",
          "Mobile",
          "Address",
          "Cylinders",
        ];
  
        const csvRows = [
          headers.join(","),
          ...allConsumers.map((consumer: Consumer) =>
            [
              `"${consumer.consumer_number}"`,
              `"${consumer.consumer_name}"`,
              `"${consumer.category}"`,
              `"${consumer.consumer_type}"`,
              `"${consumer.mobile || ""}"`,
              `"${(consumer.address || "").replace(/"/g, '""')}"`,
              consumer.cylinders,
            ].join(",")
          ),
        ];
  
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
  
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `route_${person.name}_consumers_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        showSnackbar(`Exported ${allConsumers.length} consumers successfully`, "success");
      } catch (err: any) {
        console.error("Failed to export consumers:", err);
        showSnackbar("Failed to export consumers", "error");
      } finally {
        setExportLoading(false);
      }
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
        <Box sx={{ mb: 3, width: "40%" }}>
          <Autocomplete
            options={deliveryPersons}
            value={person}
            onChange={(_, value) => handlePersonSelect(value)}
            getOptionLabel={(option) => option.name}
            disableClearable
            popupIcon={null}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Delivery Person"
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5, mb: 3 }}>
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
                    Assigned Routes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem", mt: 0.5, color: "info.main" }}>
                    {person?.assigned_routes_count || 0}
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
                    {person?.total_consumers || 0}
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Delivery Person
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.5rem", mt: 0.5, color: "primary.main", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {person?.name || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary", display: "block", mt: 0.5 }}>
                    {person?.phone_number || "No phone"}
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
                  <PersonIcon sx={{ color: "white", fontSize: "2rem" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Card elevation={3} sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
          <DataGrid
            showToolbar
            rows={consumers}
            columns={consumersColumns}
            getRowId={(row) => row.consumer_id}
            paginationModel={consumersPagination}
            onPaginationModelChange={(newModel) => {
              setConsumersPagination(newModel);
            }}
            rowCount={consumersRowCount}
            pageSizeOptions={[5, 10,15, 20]}
            paginationMode="server"
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={40}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{
              toolbar: MiniCT,
            }}
            slotProps={{
              toolbar: {
                title: `Consumers for ${person?.name || ""}`,
                onExportClick: handleExportCSV,
                exportLoading: exportLoading,
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

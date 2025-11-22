import { useState, useEffect } from "react";
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
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { CustomToolbar } from "@/components/CustomToolbar";
import { entityConfigs, type EntityConfig } from "@/configs/consumerSelectorConfig";

interface ConsumerSelectorProps {
  entityType: "route" | "delivery_person";
  preSelectedId?: string | number;
}

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

export default function ConsumerSelector({ entityType, preSelectedId }: ConsumerSelectorProps) {
  const { showSnackbar } = useSnackbar();
  const config: EntityConfig = entityConfigs[entityType];

  const [loading, setLoading] = useState(false);
  const [entity, setEntity] = useState<any | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      // Reset to first page when search changes
      if (searchInput !== searchQuery) {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (entity) {
      fetchConsumers();
    }
  }, [entity, paginationModel, searchQuery]);

  const fetchEntities = async () => {
    try {
      const response = await config.api.getAll();
      const allEntities = Array.isArray(response.data?.results)
        ? response.data.results
        : response.data || [];
      setEntities(allEntities);

      // If preSelectedId is provided, set that entity as selected
      if (preSelectedId && allEntities.length > 0) {
        const selectedEntity = allEntities.find(
          (e: any) => config.getEntityId(e) === Number(preSelectedId)
        );
        if (selectedEntity) {
          setEntity(selectedEntity);
        }
      }
    } catch (err: any) {
      showSnackbar(`Failed to load ${config.labels.entityPlural.toLowerCase()}`, "error");
    }
  };

  const fetchConsumers = async () => {
    if (!entity) return;

    try {
      setLoading(true);
      const response = await config.api.getConsumers(config.getEntityId(entity), {
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

  const handleEntitySelect = (selectedEntity: any | null) => {
    setEntity(selectedEntity);
    setPaginationModel({ page: 0, pageSize: 10 });
    setSearchInput("");
    setSearchQuery("");
  };

  const handleExportCSV = async () => {
    if (!entity) return;

    try {
      setExportLoading(true);
      // Fetch all data without pagination
      const response = await config.api.getConsumers(config.getEntityId(entity), {
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

      // Add Route column for delivery person view
      if (entityType === "delivery_person") {
        headers.splice(4, 0, "Route");
      }

      const csvRows = [
        headers.join(","),
        ...allConsumers.map((consumer: Consumer) => {
          const row = [
            `"${consumer.consumer_number}"`,
            `"${consumer.consumer_name}"`,
            `"${consumer.category}"`,
            `"${consumer.consumer_type}"`,
            `"${consumer.mobile || ""}"`,
            `"${(consumer.address || "").replace(/"/g, '""')}"`,
            consumer.cylinders,
          ];

          // Add route_code for delivery person view
          if (entityType === "delivery_person") {
            row.splice(4, 0, `"${consumer.route_code}"`);
          }

          return row.join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${config.exportFilenamePrefix}_${config.getDisplayName(entity)}_consumers_${
          new Date().toISOString().split("T")[0]
        }.csv`
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

  // Build columns with custom rendering
  const columns: GridColDef[] = config.columns.map((col) => ({
    ...col,
    renderCell: col.renderCell
      ? col.renderCell
      : (params) => {
          if (col.field === "consumer_number") {
            return <Chip label={params.value} size="small" color="primary" variant="outlined" />;
          }
          if (col.field === "route_code") {
            return <Chip label={params.value} size="small" />;
          }
          if (col.field === "cylinders") {
            return <Chip label={params.value} size="small" color="info" />;
          }
          return params.value;
        },
  }));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: 2 }}>
        <Box sx={{ mb: 3, width: "40%" }}>
          <Autocomplete
            options={entities}
            value={entity}
            onChange={(_, value) => handleEntitySelect(value)}
            getOptionLabel={(option) => config.getDisplayName(option)}
            disableClearable
            popupIcon={null}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={config.labels.selector}
                variant="standard"
                sx={{
                  "& .MuiInputBase-root": {
                    paddingLeft: 2,
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={config.getEntityId(option)}>
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Box sx={{ fontWeight: 600 }}>{config.getDisplayName(option)}</Box>
                  <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {config.getDescription(option)}
                  </Box>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) =>
              config.getEntityId(option) === config.getEntityId(value)
            }
            noOptionsText={`No ${config.labels.entityPlural.toLowerCase()} found`}
          />
        </Box>

        {/* Summary Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2.5,
            mb: 3,
          }}
        >
          {config.summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                elevation={2}
                sx={{
                  bgcolor: "background.paper",
                  borderLeft: 4,
                  borderColor: `${card.color}.main`,
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ py: 2.5, px: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {card.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          fontSize: "2rem",
                          mt: 0.5,
                          color: `${card.color}.main`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {card.getValue(entity, rowCount)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: `${card.color}.main`,
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.25)`,
                      }}
                    >
                      <Icon sx={{ color: "white", fontSize: "2rem" }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Data Grid */}
        <Card elevation={3} sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
          <DataGrid
            showToolbar
            rows={consumers}
            columns={columns}
            getRowId={(row) => row.consumer_id}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => {
              setPaginationModel(newModel);
            }}
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 15, 20]}
            paginationMode="server"
            loading={loading}
            disableRowSelectionOnClick
            autoHeight
            rowHeight={40}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                title: `Consumers for ${entity ? config.getDisplayName(entity) : ""}`,
                searchValue: searchInput,
                onSearchChange: setSearchInput,
                onExportClick: handleExportCSV,
                exportLoading: exportLoading,
                showExport: true,
                showPrint: true,
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

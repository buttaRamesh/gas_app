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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { SearchBar } from "../../components/SearchBar";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface LookupConfig {
  title: string;
  description: string;
  api: {
    getAll: (search?: string) => Promise<any>;
    getById: (id: number) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  fields: {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    multiline?: boolean;
  }[];
  detailRoute?: string;
}

interface GenericLookupListProps {
  config: LookupConfig;
}

export const GenericLookupList = ({ config }: GenericLookupListProps) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [searchQuery]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await config.api.getAll(searchQuery);
      const data = response.data.results || response.data;
      setItems(data);
    } catch (error) {
      showSnackbar(`Failed to fetch ${config.title.toLowerCase()}`, "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdd = () => {
    setEditingItem(null);
    const initialData: any = {};
    config.fields.forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const data: any = {};
    config.fields.forEach((field) => {
      data[field.name] = item[field.name] || "";
    });
    setFormData(data);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await config.api.delete(id);
      showSnackbar(`${config.title} deleted successfully`, "success");
      fetchItems();
    } catch (error) {
      showSnackbar(`Failed to delete ${config.title.toLowerCase()}`, "error");
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);

      if (editingItem) {
        await config.api.update(editingItem.id, formData);
        showSnackbar(`${config.title} updated successfully`, "success");
      } else {
        await config.api.create(formData);
        showSnackbar(`${config.title} created successfully`, "success");
      }

      setDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.name?.[0] ||
        error.response?.data?.message ||
        `Failed to save ${config.title.toLowerCase()}`;
      showSnackbar(errorMessage, "error");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  if (loading && items.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add {config.title}
          </Button>
        }
      />

      <Box sx={{ mb: 3 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              {config.fields.map((field) => (
                <TableCell key={field.name}>{field.label}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.fields.length + 2} align="center">
                  No {config.title.toLowerCase()} found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  {config.fields.map((field) => (
                    <TableCell key={field.name}>
                      {item[field.name] || "-"}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {config.detailRoute && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`${config.detailRoute}/${item.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id, item.name)}
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

      {/* Edit/Create Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? `Edit ${config.title}` : `Add ${config.title}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {config.fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  multiline={field.multiline}
                  rows={field.multiline ? 3 : 1}
                  disabled={submitting}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

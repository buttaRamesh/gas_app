import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { unitsApi } from '../services/api';
import { Unit } from '../types/products';
import { useSnackbar } from '../contexts/SnackbarContext';

export default function Units() {
  const { showSnackbar } = useSnackbar();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    short_name: '',
    description: '',
  });

  useEffect(() => {
    fetchUnits();
  }, [searchQuery]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await unitsApi.getAll(searchQuery);
      setUnits(response.data.results || response.data);
    } catch (err: any) {
      console.error('Failed to fetch units:', err);
      showSnackbar('Failed to load units', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (unit?: Unit) => {
    if (unit) {
      setSelectedUnit(unit);
      setFormData({
        short_name: unit.short_name,
        description: unit.description,
      });
    } else {
      setSelectedUnit(null);
      setFormData({ short_name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedUnit) {
        await unitsApi.update(selectedUnit.id, formData);
        showSnackbar('Unit updated successfully', 'success');
      } else {
        await unitsApi.create(formData);
        showSnackbar('Unit created successfully', 'success');
      }
      setDialogOpen(false);
      fetchUnits();
    } catch (err: any) {
      console.error('Failed to save unit:', err);
      showSnackbar('Failed to save unit', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;

    try {
      await unitsApi.delete(selectedUnit.id);
      showSnackbar('Unit deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedUnit(null);
      fetchUnits();
    } catch (err: any) {
      console.error('Failed to delete unit:', err);
      showSnackbar('Failed to delete unit', 'error');
    }
  };

  return (
    <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Units"
          description="Manage measurement units"
          showSearch
          searchValue={searchQuery}
          searchPlaceholder="Search units..."
          onSearchChange={(e: any) => setSearchQuery(e.target.value)}
          actions={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Unit
            </Button>
          }
        />

        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/.95) 100%)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Short Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography>Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : units.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">No units found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    units.map((unit) => (
                      <TableRow key={unit.id} hover>
                        <TableCell>{unit.id}</TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {unit.short_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {unit.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(unit)}
                            sx={{ mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedUnit(unit);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUnit ? 'Edit Unit' : 'Create Unit'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Short Name"
              value={formData.short_name}
              onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
              placeholder="e.g., kg"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Kilogram"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedUnit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Unit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedUnit?.short_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

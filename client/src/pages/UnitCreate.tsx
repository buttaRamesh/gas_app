import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { unitsApi } from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

export default function UnitCreate() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    short_name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.short_name.trim()) {
      newErrors.short_name = 'Short name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await unitsApi.create(formData);
      showSnackbar('Unit created successfully', 'success');
      navigate('/units');
    } catch (error) {
      showSnackbar('Failed to create unit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Unit"
        description="Add a new measurement unit to the system"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/units')}
          >
            Back to Units
          </Button>
        }
      />

      <Box sx={{ maxWidth: '80%', mx: 'auto', mt: 4 }}>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Short Name"
                  placeholder="e.g., kg, L, m"
                  value={formData.short_name}
                  onChange={(e) => {
                    setFormData({ ...formData, short_name: e.target.value });
                    setErrors({ ...errors, short_name: '' });
                  }}
                  error={!!errors.short_name}
                  helperText={errors.short_name}
                  required
                  fullWidth
                />

                <TextField
                  label="Description"
                  placeholder="Enter unit description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setErrors({ ...errors, description: '' });
                  }}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  multiline
                  rows={3}
                  fullWidth
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/units')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Unit'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  PersonOutline as PersonIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// Mock data
const mockRoutes = [
  {
    id: 1,
    area_code: 'R001',
    area_code_description: 'Downtown Commercial District',
    area_count: 5,
    consumer_count: 234,
    delivery_person_name: 'John Smith',
  },
  {
    id: 2,
    area_code: 'R002',
    area_code_description: 'North Residential Area',
    area_count: 8,
    consumer_count: 456,
    delivery_person_name: 'Sarah Johnson',
  },
  {
    id: 3,
    area_code: 'R003',
    area_code_description: 'East Industrial Zone',
    area_count: 3,
    consumer_count: 123,
    delivery_person_name: null,
  },
  {
    id: 4,
    area_code: 'R004',
    area_code_description: 'West Suburban Region',
    area_count: 12,
    consumer_count: 567,
    delivery_person_name: 'Mike Williams',
  },
];

export default function LayoutDemo() {
  const [view, setView] = useState<'table' | 'cards'>('table');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Choose Your Layout
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Here's how your Routes data will look in different layouts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant={view === 'table' ? 'contained' : 'outlined'}
            onClick={() => setView('table')}
            size="large"
          >
            Table View
          </Button>
          <Button
            variant={view === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setView('cards')}
            size="large"
          >
            Card Grid
          </Button>
        </Box>
      </Box>

      {view === 'table' && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
            📊 Table View - Traditional & Data-Dense
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Route Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Areas</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Consumers</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Delivery Person</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockRoutes.map((route) => (
                  <TableRow
                    key={route.id}
                    hover
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {route.area_code}
                      </Typography>
                    </TableCell>
                    <TableCell>{route.area_code_description}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<LocationIcon />}
                        label={route.area_count}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<GroupIcon />}
                        label={route.consumer_count}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      {route.delivery_person_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">{route.delivery_person_name}</Typography>
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ✅ <strong>Best for:</strong> Viewing lots of data at once, sorting, comparing values
              <br />
              📊 <strong>Use case:</strong> Admin dashboards, data analysis, desktop-first apps
            </Typography>
          </Box>
        </Box>
      )}

      {view === 'cards' && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
            🎴 Card Grid - Modern & Visual
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {mockRoutes.map((route) => (
              <Card
                key={route.id}
                elevation={3}
                sx={{
                  height: '100%',
                  bgcolor: 'grey.200',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {route.area_code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {route.area_code_description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
                      <LocationIcon color="info" sx={{ mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {route.area_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Areas
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                      <GroupIcon color="success" sx={{ mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {route.consumer_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Consumers
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: route.delivery_person_name ? 'grey.100' : 'warning.light',
                      borderRadius: 1,
                    }}
                  >
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {route.delivery_person_name || 'Unassigned'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ✅ <strong>Best for:</strong> Visual appeal, mobile-friendly, easier to scan
              <br />
              🎨 <strong>Use case:</strong> Modern apps, mobile devices, consumer-facing interfaces
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
    </Box>
  );
}

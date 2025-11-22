import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { areasApi } from '@/services/api';
import { Area } from '@/types/routes';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { PageHeader } from '@/components/PageHeader';

type SortField = 'area_name' | 'consumer_count' | 'route';
type SortOrder = 'asc' | 'desc';

const RouteAreas = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sortField, setSortField] = useState<SortField>('area_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAreas();
  }, [filterStatus, searchQuery]);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      let response;
      let data: Area[] = [];

      if (filterStatus === 'assigned') {
        response = await areasApi.getAll();
        const allAreas = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        data = allAreas.filter((area: Area) => area.route);
      } else if (filterStatus === 'unassigned') {
        response = await areasApi.getAvailable();
        data = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
      } else {
        response = await areasApi.getAll();
        data = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
      }

      setAreas(data);
    } catch (error: any) {
      console.error('Error fetching areas:', error);
      setAreas([]);
      showSnackbar('Failed to fetch route areas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedAreas = [...areas].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortField === 'consumer_count') {
      aVal = a.consumer_count || 0;
      bVal = b.consumer_count || 0;
    } else if (sortField === 'route') {
      aVal = a.route_code || a.route || '';
      bVal = b.route_code || b.route || '';
    } else {
      aVal = String(a[sortField] || '').toLowerCase();
      bVal = String(b[sortField] || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAreas = sortedAreas.filter(area =>
    area.area_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedAreas = filteredAreas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (area: Area, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete area "${area.area_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await areasApi.delete(area.id);
      showSnackbar("Area deleted successfully", "success");
      fetchAreas();
    } catch (err: any) {
      console.error("Failed to delete area:", err);
      showSnackbar(err.response?.data?.message || "Failed to delete area", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
      <Container maxWidth="xl">
        <PageHeader
          title="Route Areas"
          showSearch
          searchValue={searchQuery}
          searchPlaceholder="Search by area name..."
          onSearchChange={setSearchQuery}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              displayEmpty
              sx={{
                height: '38px',
              }}
            >
              <MenuItem value="all">All Areas</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="unassigned">Unassigned</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, bgcolor: "background.paper" }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  height: '38px',
                  bgcolor: 'primary.main',
                  '& .MuiTableCell-root': {
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    borderBottom: 'none',
                    padding: '8px 16px',
                  },
                }}
              >
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'area_name'}
                    direction={sortField === 'area_name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('area_name')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: 'white !important',
                      },
                      '&:hover': {
                        color: 'white',
                      },
                      '&.Mui-active': {
                        color: 'white',
                      },
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700 }}>Area Name</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'consumer_count'}
                    direction={sortField === 'consumer_count' ? sortOrder : 'asc'}
                    onClick={() => handleSort('consumer_count')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: 'white !important',
                      },
                      '&:hover': {
                        color: 'white',
                      },
                      '&.Mui-active': {
                        color: 'white',
                      },
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700 }}>Consumer Count</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'route'}
                    direction={sortField === 'route' ? sortOrder : 'asc'}
                    onClick={() => handleSort('route')}
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        color: 'white !important',
                      },
                      '&:hover': {
                        color: 'white',
                      },
                      '&.Mui-active': {
                        color: 'white',
                      },
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700 }}>Route</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ color: 'white', fontWeight: 700 }}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAreas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No areas found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAreas.map((area, index) => (
                  <TableRow
                    key={area.id}
                    sx={{
                      height: '38px',
                      bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                        '& .MuiTableCell-root': {
                          color: 'text.primary',
                        },
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '& .MuiTableCell-root': {
                        padding: '8px 16px',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                      {area.area_name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                      {area.consumer_count ? area.consumer_count.toLocaleString() : '0'}
                    </TableCell>
                    <TableCell>
                      {area.route ? (
                        <Typography
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/routes/${area.route}`, { state: { from: 'route-areas' } });
                          }}
                          sx={{
                            fontWeight: 500,
                            color: 'info.main',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: 'info.dark',
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          {area.route_code || `Route #${area.route}`}
                        </Typography>
                      ) : (
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                          }}
                        >
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(area, e)}
                        sx={{
                          color: 'error.main',
                          bgcolor: 'error.light',
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredAreas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Container>
    </Box>
  );
};

export default RouteAreas;

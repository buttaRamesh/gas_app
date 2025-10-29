import React, { useState, useMemo } from 'react';
import { 
  DataGrid, 
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger
} from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Chip,
  InputAdornment,
  Tooltip,
  Badge,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Custom Toolbar Component
function CustomToolbar({ onRefresh, onAdd, statusFilter, onStatusFilterChange }) {
  const handleStatusClick = (status) => {
    onStatusFilterChange(status);
  };

  return (
    <Toolbar sx={{ 
      p: 2, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      minHeight: '64px',
      flexWrap: 'nowrap'
    }}>
      <Box>
        <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 500 }}>
          Student Management
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <QuickFilter
          render={(props, state) => (
            <Box
              sx={{
                display: 'grid',
                alignItems: 'center',
                width: state.expanded ? '375px' : '40px',
                transition: 'width 0.3s',
              }}
            >
              <QuickFilterTrigger
                render={(triggerProps) => (
                  <Tooltip title="Search" arrow>
                    <ToolbarButton
                      {...triggerProps}
                      sx={{
                        gridArea: '1 / 1',
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        zIndex: 1,
                        opacity: state.expanded ? 0 : 1,
                        pointerEvents: state.expanded ? 'none' : 'auto',
                        transition: 'opacity 0.3s',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                      }}
                      aria-disabled={state.expanded}
                    >
                      <SearchIcon sx={{ fontSize: '20px' }} />
                    </ToolbarButton>
                  </Tooltip>
                )}
              />
              <QuickFilterControl
                render={({ ref, ...controlProps }) => (
                  <TextField
                    {...controlProps}
                    inputRef={ref}
                    variant="standard"
                    aria-label="Search"
                    placeholder="Search..."
                    size="small"
                    sx={{
                      gridArea: '1 / 1',
                      width: '100%',
                      opacity: state.expanded ? 1 : 0,
                      transition: 'opacity 0.3s',
                      pointerEvents: state.expanded ? 'auto' : 'none',
                      '& .MuiInput-root': {
                        height: '40px',
                      },
                      '& .MuiInput-input': {
                        padding: '8px 0 8px 0',
                      }
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: '20px' }} />
                          </InputAdornment>
                        ),
                        endAdornment: state.value ? (
                          <InputAdornment position="end">
                            <QuickFilterClear
                              edge="end"
                              size="small"
                              aria-label="Clear search"
                              sx={{ marginRight: -0.75 }}
                            >
                              <CloseIcon sx={{ fontSize: '20px' }} />
                            </QuickFilterClear>
                          </InputAdornment>
                        ) : null,
                        ...controlProps.slotProps?.input,
                      },
                      ...controlProps.slotProps,
                    }}
                  />
                )}
              />
            </Box>
          )}
        />

        <Box 
          component="fieldset"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            padding: '4px 8px',
            height: '40px',
            backgroundColor: 'background.default',
            margin: 0,
            position: 'relative'
          }}
        >
          <Box
            component="legend"
            sx={{
              fontSize: '11px',
              color: 'text.secondary',
              padding: '0 4px',
              fontWeight: 500
            }}
          >
            Status
          </Box>
          <Tooltip title="All Students" arrow>
            <IconButton
              size="small"
              onClick={() => handleStatusClick('all')}
              aria-label="All Students"
              sx={{
                width: '28px',
                height: '28px',
                padding: 0,
                backgroundColor: statusFilter === 'all' ? 'warning.main' : 'transparent',
                border: statusFilter === 'all' ? 'none' : '2px solid',
                borderColor: statusFilter === 'all' ? 'transparent' : 'divider',
                borderRadius: '50%',
                boxShadow: statusFilter === 'all' ? (theme) => `0 0 12px 3px ${theme.palette.warning.main}40, inset 0 0 8px rgba(255, 255, 255, 0.3)` : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: statusFilter === 'all' ? 'warning.dark' : 'action.hover',
                  transform: 'scale(1.1)',
                }
              }}
            >
              {statusFilter === 'all' && (
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Active Students" arrow>
            <IconButton
              size="small"
              onClick={() => handleStatusClick('Active')}
              aria-label="Active Students"
              sx={{
                width: '28px',
                height: '28px',
                padding: 0,
                backgroundColor: statusFilter === 'Active' ? 'success.main' : 'transparent',
                border: statusFilter === 'Active' ? 'none' : '2px solid',
                borderColor: statusFilter === 'Active' ? 'transparent' : 'divider',
                borderRadius: '50%',
                boxShadow: statusFilter === 'Active' ? (theme) => `0 0 12px 3px ${theme.palette.success.main}40, inset 0 0 8px rgba(255, 255, 255, 0.3)` : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: statusFilter === 'Active' ? 'success.dark' : 'action.hover',
                  transform: 'scale(1.1)',
                }
              }}
            >
              {statusFilter === 'Active' && (
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Inactive Students" arrow>
            <IconButton
              size="small"
              onClick={() => handleStatusClick('Inactive')}
              aria-label="Inactive Students"
              sx={{
                width: '28px',
                height: '28px',
                padding: 0,
                backgroundColor: statusFilter === 'Inactive' ? 'error.main' : 'transparent',
                border: statusFilter === 'Inactive' ? 'none' : '2px solid',
                borderColor: statusFilter === 'Inactive' ? 'transparent' : 'divider',
                borderRadius: '50%',
                boxShadow: statusFilter === 'Inactive' ? (theme) => `0 0 12px 3px ${theme.palette.error.main}40, inset 0 0 8px rgba(255, 255, 255, 0.3)` : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: statusFilter === 'Inactive' ? 'error.dark' : 'action.hover',
                  transform: 'scale(1.1)',
                }
              }}
            >
              {statusFilter === 'Inactive' && (
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                  }}
                />
              )}
            </IconButton>
          </Tooltip>
        </Box>
          
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          '& .MuiButtonBase-root': {
            color: 'primary.main',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover'
            }
          }
        }}>
          <Tooltip title="Columns" arrow>
            <ColumnsPanelTrigger render={<ToolbarButton />}>
              <ViewColumnIcon sx={{ fontSize: '20px' }} />
            </ColumnsPanelTrigger>
          </Tooltip>

          <Tooltip title="Filters" arrow>
            <FilterPanelTrigger
              render={(props, state) => (
                <ToolbarButton {...props}>
                  <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                    <FilterListIcon sx={{ fontSize: '20px' }} />
                  </Badge>
                </ToolbarButton>
              )}
            />
          </Tooltip>

          <Tooltip title="Download as CSV" arrow>
            <ExportCsv render={<ToolbarButton />}>
              <FileDownloadIcon sx={{ fontSize: '20px' }} />
            </ExportCsv>
          </Tooltip>

          <Tooltip title="Print" arrow>
            <ExportPrint render={<ToolbarButton />}>
              <PrintIcon sx={{ fontSize: '20px' }} />
            </ExportPrint>
          </Tooltip>
        </Box>

        <Tooltip title="Refresh" arrow>
          <IconButton 
            size="medium" 
            onClick={onRefresh} 
            color="primary"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              height: '40px',
              width: '40px'
            }}
          >
            <RefreshIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Student" arrow>
          <IconButton
            size="medium"
            onClick={onAdd}
            sx={{
              border: '1px solid',
              borderColor: 'success.dark',
              borderRadius: '20px',
              height: '40px',
              width: '56px',
              backgroundColor: 'success.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'success.dark',
                borderColor: 'success.darker',
              }
            }}
          >
            <PersonAddIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );
}

export default function StudentDashboard() {
  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      grade: 'A', 
      status: 'Active', 
      enrollmentDate: '2024-01-15',
      courses: [
        { name: 'Mathematics', fee: 1200 },
        { name: 'Physics', fee: 1500 },
        { name: 'Chemistry', fee: 1300 }
      ]
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      grade: 'B+', 
      status: 'Active', 
      enrollmentDate: '2024-02-20',
      courses: [
        { name: 'English', fee: 1000 },
        { name: 'History', fee: 900 }
      ]
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      grade: 'A-', 
      status: 'Inactive', 
      enrollmentDate: '2023-09-10',
      courses: [
        { name: 'Biology', fee: 1400 },
        { name: 'Mathematics', fee: 1200 },
        { name: 'Computer Science', fee: 1800 }
      ]
    },
    { 
      id: 4, 
      name: 'Sarah Williams', 
      email: 'sarah@example.com', 
      grade: 'B', 
      status: 'Active', 
      enrollmentDate: '2024-03-05',
      courses: [
        { name: 'Art', fee: 800 },
        { name: 'Music', fee: 950 }
      ]
    },
    { 
      id: 5, 
      name: 'Tom Brown', 
      email: 'tom@example.com', 
      grade: 'C+', 
      status: 'Active', 
      enrollmentDate: '2024-01-28',
      courses: [
        { name: 'Geography', fee: 850 }
      ]
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    status: 'Active',
    enrollmentDate: '',
    courses: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleViewCourses = (student) => {
    setSelectedStudent(student);
    setOpenCourseDialog(true);
  };

  const columns = useMemo(() => [
    {
      field: 'info',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="View Courses" arrow>
          <IconButton
            size="small"
            onClick={() => handleViewCourses(params.row)}
            color="info"
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    { 
      field: 'name', 
      headerName: 'Student Name', 
      flex: 1, 
      minWidth: 180
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1, 
      minWidth: 200
    },
    { 
      field: 'grade', 
      headerName: 'Grade', 
      width: 100
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={params.value === 'Active' ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      field: 'enrollmentDate', 
      headerName: 'Enrollment Date', 
      width: 150 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.grade.trim()) errors.grade = 'Grade is required';
    if (!formData.enrollmentDate) errors.enrollmentDate = 'Enrollment date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      grade: student.grade,
      status: student.status,
      enrollmentDate: student.enrollmentDate,
      courses: student.courses || []
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== id));
      setSnackbar({
        open: true,
        message: 'Student deleted successfully',
        severity: 'success'
      });
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      grade: '',
      status: 'Active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      courses: []
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error'
      });
      return;
    }

    if (editingStudent) {
      setStudents(students.map(student =>
        student.id === editingStudent.id
          ? { ...student, ...formData }
          : student
      ));
      setSnackbar({
        open: true,
        message: 'Student updated successfully',
        severity: 'success'
      });
    } else {
      const newStudent = {
        id: Math.max(...students.map(s => s.id), 0) + 1,
        ...formData
      };
      setStudents([...students, newStudent]);
      setSnackbar({
        open: true,
        message: 'Student added successfully',
        severity: 'success'
      });
    }
    setOpenDialog(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      return statusFilter === 'all' || student.status === statusFilter;
    });
  }, [students, statusFilter]);

  const handleRefresh = () => {
    console.log('Refreshing data...');
    setSnackbar({
      open: true,
      message: 'Data refreshed',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const totalCourseFee = selectedStudent?.courses.reduce((sum, course) => sum + course.fee, 0) || 0;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredStudents}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 }
            }
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            toolbar: { 
              onRefresh: handleRefresh,
              onAdd: handleAdd,
              statusFilter: statusFilter,
              onStatusFilterChange: setStatusFilter
            },
          }}
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-main': {
              width: 'fit-content',
              minWidth: '100%'
            },
            '& .MuiDataGrid-virtualScroller': {
              minWidth: '100%'
            }
          }}
        />
      </Box>

      {/* Course Details Dialog */}
      <Dialog 
        open={openCourseDialog} 
        onClose={() => setOpenCourseDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              Course Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudent?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Course Fee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedStudent?.courses.map((course, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="right">${course.fee.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    Total
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      color: 'primary.main' 
                    }}
                  >
                    ${totalCourseFee.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
              fullWidth
            />
            <TextField
              label="Grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              error={!!formErrors.grade}
              helperText={formErrors.grade}
              required
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </TextField>
            <TextField
              label="Enrollment Date"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              error={!!formErrors.enrollmentDate}
              helperText={formErrors.enrollmentDate}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { rolesApi, permissionsApi } from '@/services/api';
import type { Role, Permission } from '@/types/auth';

interface RoleComparisonDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function RoleComparisonDialog({ open, onClose }: RoleComparisonDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  // Fetch all roles
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(),
    enabled: open,
  });

  const roles = Array.isArray(rolesData?.data) ? rolesData.data : rolesData?.data?.results || [];

  // Fetch all permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(),
    enabled: open,
  });

  const permissions = Array.isArray(permissionsData?.data)
    ? permissionsData.data
    : permissionsData?.data?.results || [];

  // Get detailed data for selected roles
  const roleQueries = selectedRoles.map((roleId) =>
    useQuery({
      queryKey: ['role', roleId],
      queryFn: () => rolesApi.getById(roleId),
      enabled: open && selectedRoles.includes(roleId),
    })
  );

  const selectedRoleData = roleQueries.map((q) => q.data?.data);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const resources = Object.keys(groupedPermissions).sort();

  // Check if a role has a specific permission
  const hasPermission = (roleData: any, permissionCodename: string): boolean => {
    if (!roleData) return false;
    const permList = roleData.permissions_list || [];
    return permList.includes(permissionCodename);
  };

  // Calculate permission overlap
  const getOverlapStats = () => {
    if (selectedRoles.length !== 2 || !selectedRoleData[0] || !selectedRoleData[1]) {
      return { shared: 0, unique1: 0, unique2: 0 };
    }

    const perms1 = new Set(selectedRoleData[0].permissions_list || []);
    const perms2 = new Set(selectedRoleData[1].permissions_list || []);

    const shared = [...perms1].filter((p) => perms2.has(p)).length;
    const unique1 = [...perms1].filter((p) => !perms2.has(p)).length;
    const unique2 = [...perms2].filter((p) => !perms1.has(p)).length;

    return { shared, unique1, unique2 };
  };

  const overlapStats = getOverlapStats();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Compare Roles
          </Typography>
          <Button onClick={onClose} size="small" startIcon={<CloseIcon />}>
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Role Selection */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>First Role</InputLabel>
              <Select
                value={selectedRoles[0] || ''}
                label="First Role"
                onChange={(e) => setSelectedRoles([e.target.value as number, selectedRoles[1]])}
              >
                <MenuItem value="">
                  <em>Select a role</em>
                </MenuItem>
                {roles.map((role: any) => (
                  <MenuItem key={role.id} value={role.id} disabled={selectedRoles[1] === role.id}>
                    {role.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Second Role</InputLabel>
              <Select
                value={selectedRoles[1] || ''}
                label="Second Role"
                onChange={(e) => setSelectedRoles([selectedRoles[0], e.target.value as number])}
              >
                <MenuItem value="">
                  <em>Select a role</em>
                </MenuItem>
                {roles.map((role: any) => (
                  <MenuItem key={role.id} value={role.id} disabled={selectedRoles[0] === role.id}>
                    {role.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {selectedRoles.length === 2 && selectedRoleData[0] && selectedRoleData[1] && (
          <>
            {/* Statistics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: '#DBEAFE', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {overlapStats.shared}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shared Permissions
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: '#FEF3C7', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {overlapStats.unique1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique to {selectedRoleData[0].display_name}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: '#D1FAE5', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {overlapStats.unique2}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique to {selectedRoleData[1].display_name}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Comparison Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Resource</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Permission</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, minWidth: 150 }}>
                      {selectedRoleData[0].display_name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, minWidth: 150 }}>
                      {selectedRoleData[1].display_name}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => {
                    const resourcePerms = groupedPermissions[resource];
                    return resourcePerms.map((perm: Permission, index: number) => {
                      const has1 = hasPermission(selectedRoleData[0], perm.codename);
                      const has2 = hasPermission(selectedRoleData[1], perm.codename);
                      const isDifferent = has1 !== has2;

                      return (
                        <TableRow
                          key={perm.id}
                          sx={{
                            bgcolor: isDifferent ? '#FEF3C7' : 'transparent',
                          }}
                        >
                          {index === 0 ? (
                            <TableCell
                              rowSpan={resourcePerms.length}
                              sx={{
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                borderRight: '2px solid',
                                borderColor: 'divider',
                              }}
                            >
                              {resource.replace(/_/g, ' ')}
                            </TableCell>
                          ) : null}
                          <TableCell>{perm.action}</TableCell>
                          <TableCell align="center">
                            {has1 ? (
                              <Tooltip title="Has permission">
                                <CheckIcon color="success" fontSize="small" />
                              </Tooltip>
                            ) : (
                              <Tooltip title="No permission">
                                <CancelIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {has2 ? (
                              <Tooltip title="Has permission">
                                <CheckIcon color="success" fontSize="small" />
                              </Tooltip>
                            ) : (
                              <Tooltip title="No permission">
                                <CancelIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {selectedRoles.length < 2 && (
          <Alert severity="info">Select two roles to compare their permissions</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

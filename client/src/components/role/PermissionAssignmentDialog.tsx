import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Help as HelpIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi, permissionsApi } from '@/services/api';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getPermissionDescription, getPermissionIcon } from '@/utils/permissionDescriptions';
import { useResources } from '@/hooks/useResources';
import type { Role, Permission } from '@/types/auth';

interface PermissionAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function PermissionAssignmentDialog({
  open,
  onClose,
  role,
}: PermissionAssignmentDialogProps) {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  // Fetch available resources
  const { resources, loading: resourcesLoading } = useResources(true);

  // Fetch available permissions (fetch all by setting large page_size)
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(undefined, undefined, 1000),
    enabled: open,
  });

  const permissions = Array.isArray(permissionsData?.data)
    ? permissionsData.data
    : permissionsData?.data?.results || [];

  // Fetch role details to get current permissions
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => rolesApi.getById(role!.id),
    enabled: open && !!role?.id,
  });

  // Initialize selected permissions when role data loads
  useEffect(() => {
    if (roleData?.data && permissions.length > 0) {
      const rolePermCodenames = roleData.data.permissions_list || [];
      const permIds = permissions
        .filter((perm: Permission) => rolePermCodenames.includes(perm.codename))
        .map((perm: Permission) => perm.id);
      setSelectedPermissionIds(permIds);
    }
  }, [roleData, permissions]);

  const assignPermissionsMutation = useMutation({
    mutationFn: (permissionIds: number[]) =>
      rolesApi.assignPermissions(role!.id, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', role?.id] });
      showSnackbar('Permissions assigned successfully', 'success');
      onClose();
    },
    onError: (error: any) => {
      showSnackbar(
        error.response?.data?.error || 'Failed to assign permissions',
        'error'
      );
    },
  });

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllForResource = (resourceName: string) => {
    const resourcePerms = permissions.filter((p: Permission) => p.resource_name === resourceName);
    const allSelected = resourcePerms.every((p: Permission) =>
      selectedPermissionIds.includes(p.id)
    );

    if (allSelected) {
      // Deselect all for this resource
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !resourcePerms.find((p: Permission) => p.id === id))
      );
    } else {
      // Select all for this resource
      const newIds = resourcePerms.map((p: Permission) => p.id);
      setSelectedPermissionIds((prev) => [
        ...prev.filter((id) => !resourcePerms.find((p: Permission) => p.id === id)),
        ...newIds,
      ]);
    }
  };

  const handleSave = () => {
    assignPermissionsMutation.mutate(selectedPermissionIds);
  };

  const handleClose = () => {
    if (!assignPermissionsMutation.isPending) {
      onClose();
    }
  };

  const isLoading = permissionsLoading || roleLoading || resourcesLoading;

  // Group permissions by resource_name
  const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
    const resourceName = perm.resource_name || 'unknown';
    if (!acc[resourceName]) {
      acc[resourceName] = [];
    }
    acc[resourceName].push(perm);
    return acc;
  }, {});

  // Sort resources by display name using fetched resource data
  const sortedResourceNames = Object.keys(groupedPermissions).sort((a, b) => {
    const resourceA = resources.find(r => r.name === a);
    const resourceB = resources.find(r => r.name === b);
    const nameA = resourceA?.display_name || a;
    const nameB = resourceB?.display_name || b;
    return nameA.localeCompare(nameB);
  });

  const actionColors: Record<string, string> = {
    view: '#3B82F6',
    create: '#10B981',
    edit: '#F59E0B',
    delete: '#EF4444',
    export: '#8B5CF6',
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Assign Permissions
        {role && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Role: {role.display_name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : permissions.length === 0 ? (
          <Alert severity="warning">No permissions available</Alert>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Selected: <strong>{selectedPermissionIds.length}</strong> of {permissions.length} permissions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="View" size="small" sx={{ bgcolor: '#3B82F6', color: 'white' }} />
                <Chip label="Create" size="small" sx={{ bgcolor: '#10B981', color: 'white' }} />
                <Chip label="Edit" size="small" sx={{ bgcolor: '#F59E0B', color: 'white' }} />
                <Chip label="Delete" size="small" sx={{ bgcolor: '#EF4444', color: 'white' }} />
                <Chip label="Export" size="small" sx={{ bgcolor: '#8B5CF6', color: 'white' }} />
              </Box>
            </Box>

            {sortedResourceNames.map((resourceName) => {
              const resourcePerms = groupedPermissions[resourceName];
              const allSelected = resourcePerms.every((p: Permission) =>
                selectedPermissionIds.includes(p.id)
              );
              const someSelected = resourcePerms.some((p: Permission) =>
                selectedPermissionIds.includes(p.id)
              );

              // Find resource details from fetched resources
              const resourceDetail = resources.find(r => r.name === resourceName);
              const displayName = resourceDetail?.display_name || resourceName.replace(/_/g, ' ');

              return (
                <Accordion key={resourceName} defaultExpanded={someSelected} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: 'grey.50',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onChange={() => handleSelectAllForResource(resourceName)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label={
                          <Typography variant="body1" fontWeight={600}>
                            {displayName}
                          </Typography>
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Chip
                        label={`${resourcePerms.filter((p: Permission) => selectedPermissionIds.includes(p.id)).length}/${resourcePerms.length}`}
                        size="small"
                        color={allSelected ? 'success' : someSelected ? 'warning' : 'default'}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {resourcePerms.map((perm: Permission) => (
                        <Grid item xs={6} sm={4} key={perm.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedPermissionIds.includes(perm.id)}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  disabled={assignPermissionsMutation.isPending}
                                  size="small"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: actionColors[perm.action] || '#9CA3AF',
                                    }}
                                  />
                                  <Typography variant="body2">
                                    {getPermissionIcon(perm.action)} {perm.action}
                                  </Typography>
                                </Box>
                              }
                              sx={{ flex: 1 }}
                            />
                            <Tooltip title={getPermissionDescription(perm.resource_name || '', perm.action)} arrow placement="top">
                              <IconButton size="small" sx={{ p: 0.5 }}>
                                <HelpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={assignPermissionsMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={assignPermissionsMutation.isPending || isLoading}
          sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
        >
          {assignPermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

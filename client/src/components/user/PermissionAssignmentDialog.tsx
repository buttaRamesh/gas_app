import { useEffect, useState, useMemo } from 'react';
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
  Chip,
  IconButton,
  Stack,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tooltip,
  FormGroup,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Lock as LockIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi, permissionsApi } from '@/services/api';
import type { Role, Permission } from '@/types/auth';
import { toast } from 'sonner';
import { colors } from '@/theme';

interface PermissionAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

/**
 * Extract unique resource names from permission codenames
 * Example: ["consumers.view", "consumers.create"] → ["consumers"]
 */
const extractResources = (permissions: Permission[]): string[] => {
  const resources = permissions
    .map((p) => {
      // Try to extract from codename first (e.g., "consumers.view" → "consumers")
      if (p.codename && p.codename.includes('.')) {
        return p.codename.split('.')[0];
      }
      // Fallback to resource_name or resource_display_name
      return p.resource_name || p.resource_display_name || '';
    })
    .filter(Boolean);

  return [...new Set(resources)];
};

/**
 * Format resource name to friendly display
 * Examples: "consumers" → "Consumers", "delivery_persons" → "Delivery Persons"
 */
const formatResourceName = (resource: string): string => {
  return resource
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format permission action for display
 * "consumers.view" → "View"
 */
const formatPermissionAction = (codename: string): string => {
  if (!codename || !codename.includes('.')) return codename;
  const action = codename.split('.')[1];
  return action.charAt(0).toUpperCase() + action.slice(1);
};

/**
 * Get resource name from permission
 */
const getResourceFromPermission = (perm: Permission): string => {
  if (perm.codename && perm.codename.includes('.')) {
    return perm.codename.split('.')[0];
  }
  return perm.resource_name || perm.resource_display_name || '';
};

export default function PermissionAssignmentDialog({
  open,
  onOpenChange,
  role,
}: PermissionAssignmentDialogProps) {
  const onClose = () => onOpenChange(false);
  const queryClient = useQueryClient();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [activeResources, setActiveResources] = useState<string[]>([]);
  const [newlyAddedResources, setNewlyAddedResources] = useState<string[]>([]);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [selectedResourcesToAdd, setSelectedResourcesToAdd] = useState<string[]>([]);
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(undefined, undefined, 1000),
    enabled: open,
  });

  const permissions = permissionsData?.data?.results || permissionsData?.data || [];

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => rolesApi.getById(role!.id),
    enabled: open && !!role?.id,
  });

  // Initialize active resources and selected permissions when dialog opens
  useEffect(() => {
    if (open && roleData?.data && permissions.length > 0) {
      const rolePermCodenames = roleData.data.permissions_list || [];

      // Get permission IDs
      const permIds = permissions
        .filter((perm: Permission) => rolePermCodenames.includes(perm.codename))
        .map((perm: Permission) => perm.id);

      setSelectedPermissionIds(permIds);

      // Get resources from assigned permissions
      const assignedPerms = permissions.filter((p: Permission) =>
        rolePermCodenames.includes(p.codename)
      );
      const resources = extractResources(assignedPerms);

      setActiveResources(resources.length > 0 ? resources : []);
      setNewlyAddedResources([]); // Reset newly added
    }
  }, [open, roleData, permissions]);

  // Compute resource sections with sorting
  const resourceSections = useMemo(() => {
    // Separate new and old resources, then sort alphabetically
    const newResources = newlyAddedResources
      .filter((r) => activeResources.includes(r))
      .sort();

    const oldResources = activeResources
      .filter((r) => !newlyAddedResources.includes(r))
      .sort();

    return { newResources, oldResources };
  }, [activeResources, newlyAddedResources]);

  // Get available resources (not yet added)
  const availableResources = useMemo(() => {
    const allResources = extractResources(permissions);
    return allResources
      .filter((r) => !activeResources.includes(r))
      .sort();
  }, [permissions, activeResources]);

  // Filter available resources by search term
  const filteredAvailableResources = useMemo(() => {
    if (!resourceSearchTerm.trim()) {
      return availableResources;
    }
    const searchLower = resourceSearchTerm.toLowerCase();
    return availableResources.filter((resource) =>
      formatResourceName(resource).toLowerCase().includes(searchLower)
    );
  }, [availableResources, resourceSearchTerm]);

  const assignPermissionsMutation = useMutation({
    mutationFn: (permissionIds: number[]) =>
      rolesApi.assignPermissions(role!.id, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', role?.id] });
      toast.success('Permissions assigned successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to assign permissions');
    },
  });

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (resourceName: string) => {
    const resourcePerms = permissions.filter(
      (p: Permission) => getResourceFromPermission(p) === resourceName
    );
    const resourcePermIds = resourcePerms.map((p: Permission) => p.id);

    setSelectedPermissionIds((prev) => [...new Set([...prev, ...resourcePermIds])]);
  };

  const handleDeselectAll = (resourceName: string) => {
    const resourcePerms = permissions.filter(
      (p: Permission) => getResourceFromPermission(p) === resourceName
    );
    const resourcePermIds = resourcePerms.map((p: Permission) => p.id);

    setSelectedPermissionIds((prev) => prev.filter((id) => !resourcePermIds.includes(id)));
  };

  const handleToggleResourceSelection = (resourceName: string) => {
    setSelectedResourcesToAdd((prev) =>
      prev.includes(resourceName)
        ? prev.filter((r) => r !== resourceName)
        : [...prev, resourceName]
    );
  };

  const handleAddSelectedResources = () => {
    if (selectedResourcesToAdd.length === 0) return;

    setActiveResources([...activeResources, ...selectedResourcesToAdd]);
    setNewlyAddedResources([...newlyAddedResources, ...selectedResourcesToAdd]);
    setSelectedResourcesToAdd([]);
    setResourceSearchTerm('');
    setAddResourceDialogOpen(false);
  };

  const handleCancelResourceDialog = () => {
    setSelectedResourcesToAdd([]);
    setResourceSearchTerm('');
    setAddResourceDialogOpen(false);
  };

  const handleRemoveResource = (resourceName: string) => {
    // Remove from active
    setActiveResources(activeResources.filter((r) => r !== resourceName));

    // Remove from newly added if it was new
    setNewlyAddedResources(newlyAddedResources.filter((r) => r !== resourceName));

    // Uncheck all permissions for this resource
    const resourcePerms = permissions.filter(
      (p: Permission) => getResourceFromPermission(p) === resourceName
    );
    const resourcePermIds = resourcePerms.map((p: Permission) => p.id);
    setSelectedPermissionIds((prev) => prev.filter((id) => !resourcePermIds.includes(id)));
  };

  const handleSubmit = () => {
    // Clean up: remove resources with zero permissions
    const selectedPerms = permissions.filter((p: Permission) =>
      selectedPermissionIds.includes(p.id)
    );
    const resourcesWithPerms = extractResources(selectedPerms);

    // Update active resources
    setActiveResources(resourcesWithPerms);

    // Clear newly added (after save they become "old")
    setNewlyAddedResources([]);

    // Save
    assignPermissionsMutation.mutate(selectedPermissionIds);
  };

  const isLoading = permissionsLoading || roleLoading;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--card))',
            borderRadius: 3,
            border: '1px solid hsl(var(--border))',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: 'hsl(var(--primary))' }} />
            <Typography variant="h6" fontWeight={700}>
              Manage Permissions - {role?.display_name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Add Resource Button Section */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {activeResources.length} {activeResources.length === 1 ? 'Resource' : 'Resources'} Assigned
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAddResourceDialogOpen(true)}
              variant="outlined"
              disabled={availableResources.length === 0}
              size="small"
              sx={{
                borderColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary))',
                '&:hover': {
                  borderColor: 'hsl(var(--primary))',
                  bgcolor: 'hsl(var(--primary) / 0.1)',
                },
              }}
            >
              Add Resource
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : permissions.length === 0 ? (
            <Alert severity="warning">No permissions available</Alert>
          ) : activeResources.length === 0 ? (
            // Empty State
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                bgcolor: 'hsl(var(--muted) / 0.3)',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <LockIcon sx={{ fontSize: 64, color: 'hsl(var(--muted-foreground))', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                No Resources Assigned
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Add resources to assign permissions for this role
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddResourceDialogOpen(true)}
                sx={{
                  bgcolor: 'hsl(var(--primary))',
                  '&:hover': { bgcolor: 'hsl(var(--primary) / 0.9)' },
                }}
              >
                Add Your First Resource
              </Button>
            </Box>
          ) : (
            <Box>
              {/* NEWLY ADDED RESOURCES SECTION */}
              {resourceSections.newResources.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'hsl(var(--muted-foreground))',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Recently Added ({resourceSections.newResources.length})
                  </Typography>

                  {resourceSections.newResources.map((resourceName, index) => (
                    <ResourceAccordion
                      key={resourceName}
                      resourceName={resourceName}
                      permissions={permissions}
                      selectedPermissionIds={selectedPermissionIds}
                      onTogglePermission={handleTogglePermission}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                      onRemove={handleRemoveResource}
                      defaultExpanded={index === 0}
                      isNew={true}
                    />
                  ))}
                </Box>
              )}

              {/* DIVIDER */}
              {resourceSections.newResources.length > 0 && resourceSections.oldResources.length > 0 && (
                <Divider sx={{ my: 3 }}>
                  <Chip
                    label="Existing Resources"
                    size="small"
                    sx={{
                      bgcolor: 'hsl(var(--muted))',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  />
                </Divider>
              )}

              {/* EXISTING RESOURCES SECTION */}
              {resourceSections.oldResources.length > 0 && (
                <Box>
                  {resourceSections.oldResources.map((resourceName) => (
                    <ResourceAccordion
                      key={resourceName}
                      resourceName={resourceName}
                      permissions={permissions}
                      selectedPermissionIds={selectedPermissionIds}
                      onTogglePermission={handleTogglePermission}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                      onRemove={handleRemoveResource}
                      defaultExpanded={false}
                      isNew={false}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: 'none',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading || assignPermissionsMutation.isPending}
            sx={{
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: 'hsl(var(--primary) / 0.9)' },
            }}
          >
            {assignPermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resource Picker Dialog */}
      <Dialog
        open={addResourceDialogOpen}
        onClose={handleCancelResourceDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            height: '600px', // Fixed height for consistent dialog size
            maxHeight: '90vh', // But respect viewport height on small screens
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Add Resources
            </Typography>
            <IconButton size="small" onClick={handleCancelResourceDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexShrink: 0 }}>
            Select one or more resources to assign permissions
          </Typography>

          {availableResources.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">All resources have been added</Typography>
            </Box>
          ) : (
            <>
              {/* Search Field */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search resources..."
                value={resourceSearchTerm}
                onChange={(e) => setResourceSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, flexShrink: 0 }}
              />

              {/* Select All / Deselect All */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1, flexShrink: 0 }}>
                <Button
                  size="small"
                  onClick={() => setSelectedResourcesToAdd([
                    ...new Set([...selectedResourcesToAdd, ...filteredAvailableResources])
                  ])}
                  disabled={
                    filteredAvailableResources.length === 0 ||
                    filteredAvailableResources.every(r => selectedResourcesToAdd.includes(r))
                  }
                  sx={{ textTransform: 'none' }}
                >
                  Select All ({filteredAvailableResources.length})
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedResourcesToAdd([])}
                  disabled={selectedResourcesToAdd.length === 0}
                  sx={{ textTransform: 'none' }}
                >
                  Deselect All
                </Button>
              </Box>

              {/* Scrollable Resource List */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  minHeight: 0, // Important for flexbox scroll
                  pr: 1, // Padding for scrollbar
                }}
              >
                {filteredAvailableResources.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No resources found matching "{resourceSearchTerm}"</Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                  {filteredAvailableResources.map((resource) => {
                const resourcePerms = permissions.filter(
                  (p: Permission) => getResourceFromPermission(p) === resource
                );
                const isSelected = selectedResourcesToAdd.includes(resource);

                return (
                  <ListItemButton
                    key={resource}
                    onClick={() => handleToggleResourceSelection(resource)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      border: isSelected
                        ? '2px solid hsl(var(--primary))'
                        : '1px solid hsl(var(--border))',
                      bgcolor: isSelected ? 'hsl(var(--primary) / 0.05)' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected
                          ? 'hsl(var(--primary) / 0.1)'
                          : 'hsl(var(--muted))',
                        borderColor: 'hsl(var(--primary))',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={isSelected}
                        edge="start"
                        tabIndex={-1}
                        disableRipple
                        sx={{
                          color: 'hsl(var(--primary))',
                          '&.Mui-checked': {
                            color: 'hsl(var(--primary))',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <FolderIcon sx={{ color: 'hsl(var(--primary))' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={formatResourceName(resource)}
                      secondary={`${resourcePerms.length} permissions available`}
                    />
                  </ListItemButton>
                );
              })}
                  </List>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCancelResourceDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAddSelectedResources}
            variant="contained"
            disabled={selectedResourcesToAdd.length === 0}
            sx={{
              bgcolor: 'hsl(var(--primary))',
              '&:hover': { bgcolor: 'hsl(var(--primary) / 0.9)' },
            }}
          >
            Add {selectedResourcesToAdd.length > 0 ? `(${selectedResourcesToAdd.length})` : 'Selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Resource Accordion Component
interface ResourceAccordionProps {
  resourceName: string;
  permissions: Permission[];
  selectedPermissionIds: number[];
  onTogglePermission: (id: number) => void;
  onSelectAll: (resource: string) => void;
  onDeselectAll: (resource: string) => void;
  onRemove: (resource: string) => void;
  defaultExpanded: boolean;
  isNew: boolean;
}

function ResourceAccordion({
  resourceName,
  permissions,
  selectedPermissionIds,
  onTogglePermission,
  onSelectAll,
  onDeselectAll,
  onRemove,
  defaultExpanded,
  isNew,
}: ResourceAccordionProps) {
  const resourcePerms = permissions.filter((p: Permission) => getResourceFromPermission(p) === resourceName);

  const selectedCount = resourcePerms.filter((p: Permission) => selectedPermissionIds.includes(p.id)).length;

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        mb: 1.5,
        border: isNew ? `2px solid hsl(var(--primary))` : '1px solid hsl(var(--border))',
        '&:before': { display: 'none' },
        borderRadius: '8px !important',
        overflow: 'hidden',
        bgcolor: isNew ? 'hsl(var(--primary) / 0.02)' : 'transparent',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FolderIcon sx={{ color: 'hsl(var(--primary))' }} />
            <Typography fontWeight={600}>{formatResourceName(resourceName)}</Typography>
            {isNew && (
              <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
            <Chip
              label={`${selectedCount}/${resourcePerms.length}`}
              size="small"
              color={selectedCount > 0 ? 'primary' : 'default'}
              variant={selectedCount > 0 ? 'filled' : 'outlined'}
            />
          </Box>

          <Tooltip title="Remove Resource">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(resourceName);
              }}
              sx={{
                ml: 'auto',
                color: colors.priority.critical.main,
                '&:hover': {
                  bgcolor: colors.priority.critical.light + '20',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 2 }}>
        {/* Select All / Deselect All buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            size="small"
            onClick={() => onSelectAll(resourceName)}
            disabled={selectedCount === resourcePerms.length}
          >
            Select All
          </Button>
          <Button size="small" onClick={() => onDeselectAll(resourceName)} disabled={selectedCount === 0}>
            Deselect All
          </Button>
        </Box>

        {/* Permission checkboxes */}
        <FormGroup>
          {resourcePerms.map((permission: Permission) => {
            const isSelected = selectedPermissionIds.includes(permission.id);

            return (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onTogglePermission(permission.id)}
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {permission.name || formatPermissionAction(permission.codename)}
                    </Typography>
                    {permission.description && (
                      <Typography variant="caption" color="text.secondary">
                        {permission.description}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{ py: 0.5 }}
              />
            );
          })}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );
}

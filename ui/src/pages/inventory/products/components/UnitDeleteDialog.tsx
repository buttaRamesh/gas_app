import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    IconButton,
    useTheme,
} from '@mui/material';
import { Warning, Close } from '@mui/icons-material';
import { useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

interface UnitDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    unitId: number;
    unitName: string;
    onSuccess?: () => void;
}

const UnitDeleteDialog = ({
    open,
    onClose,
    unitId,
    unitName,
    onSuccess,
}: UnitDeleteDialogProps) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/inventory/units/${unitId}/`);
            toast.success(`Unit "${unitName}" deleted successfully`);
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to delete unit. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    py: 1.5,
                    px: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Delete Unit
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    disabled={loading}
                    sx={{ color: 'inherit', p: 0.5 }}
                    size="small"
                >
                    <Close fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 700,
                        color: 'error.main',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                    }}
                >
                    {unitName}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, fontSize: '0.85rem' }}
                >
                    This action cannot be undone. All data associated with this unit will be
                    permanently removed.
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: theme.palette.background.default,
                    justifyContent: 'center',
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        minWidth: 100,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleConfirm}
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        minWidth: 100,
                    }}
                >
                    {loading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Delete'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnitDeleteDialog;

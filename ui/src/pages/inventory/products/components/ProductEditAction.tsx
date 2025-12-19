import { useState } from 'react';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import ProductDialog from './ProductDialog';

interface ProductEditActionProps {
  productId: number;
  productData: any;
  onSuccess?: () => void;
}

const ProductEditAction = ({ productId, productData, onSuccess }: ProductEditActionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <IconButton
        size="small"
        color="primary"
        onClick={handleOpenDialog}
        sx={{
          '&:hover': {
            backgroundColor: 'primary.light',
          },
        }}
      >
        <Edit fontSize="small" />
      </IconButton>

      <ProductDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        product={productData}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default ProductEditAction;

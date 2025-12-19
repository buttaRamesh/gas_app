import { Box, Typography, Divider } from '@mui/material';

interface DetailRowProps {
  label: string;
  value: string | number | null | undefined;
  showDivider?: boolean;
}

export function DetailRow({ label, value, showDivider = false }: DetailRowProps) {
  const displayValue = value || '-';

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 3,
          alignItems: 'center',
          py: 1.5,
          px: 0.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {displayValue}
        </Typography>
      </Box>
      {showDivider && (
        <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.1)' }} />
      )}
    </>
  );
}

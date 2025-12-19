import { Box, Typography, Chip, IconButton, alpha, useTheme } from '@mui/material';
import { ArrowBack as BackIcon, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ConsumerHeaderProps {
  consumerName: string;
  consumerNumber: string;
  isKycDone: boolean;
}

export function ConsumerHeader({ consumerName, consumerNumber, isKycDone }: ConsumerHeaderProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: '#ffffff',
        p: 1.5,
        borderRadius: '12px 12px 0 0',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.secondary.main, 0.3)}, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Row with Back Button, Consumer Info, and KYC Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          {/* Left Side: Back Button + Consumer Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/consumers')}
              sx={{
                color: '#ffffff',
                bgcolor: alpha('#ffffff', 0.1),
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.2),
                  transform: 'translateX(-4px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <BackIcon />
            </IconButton>

            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.25, letterSpacing: '-0.02em' }}>
                {consumerName}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                Consumer #
                <Box
                  component="span"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  {consumerNumber}
                </Box>
              </Typography>
            </Box>
          </Box>

          {/* Right Side: KYC Status */}
          <Chip
            icon={isKycDone ? <CheckCircle /> : <Cancel />}
            label={isKycDone ? 'KYC Done' : 'KYC Pending'}
            sx={{
              bgcolor: isKycDone ? alpha('#4CAF50', 0.2) : alpha('#FF9800', 0.2),
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 36,
              border: `2px solid ${alpha('#ffffff', 0.3)}`,
              '& .MuiChip-icon': {
                color: '#ffffff',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

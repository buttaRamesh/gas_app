import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { CheckCircle, HourglassEmpty } from '@mui/icons-material';

interface StatusToggleProps {
  status: 'done' | 'pending';
  onChange: (newStatus: 'done' | 'pending') => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

const ToggleContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: 'small' | 'medium' }>(({ theme, size }) => ({
  display: 'inline-flex',
  position: 'relative',
  backgroundColor: theme.palette.grey[800],
  borderRadius: 30,
  padding: size === 'small' ? 3 : 4,
  cursor: 'pointer',
  userSelect: 'none',
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
  border: `1px solid ${theme.palette.grey[700]}`,
}));

const Slider = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status' && prop !== 'size',
})<{ status: 'done' | 'pending'; size: 'small' | 'medium' }>(({ theme, status, size }) => ({
  position: 'absolute',
  top: size === 'small' ? 3 : 4,
  left: status === 'done' ? (size === 'small' ? 3 : 4) : '50%',
  width: 'calc(50% - 3px)',
  height: size === 'small' ? 26 : 32,
  borderRadius: 25,
  background: status === 'done' 
    ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
    : `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
  boxShadow: status === 'done'
    ? `0 2px 12px ${theme.palette.success.main}80`
    : `0 2px 12px ${theme.palette.warning.main}80`,
  transition: 'all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  zIndex: 0,
}));

const OptionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'size',
})<{ active: boolean; size: 'small' | 'medium' }>(({ theme, active, size }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: size === 'small' ? 4 : 6,
  padding: size === 'small' ? '4px 12px' : '6px 16px',
  minWidth: size === 'small' ? 70 : 85,
  height: size === 'small' ? 26 : 32,
  borderRadius: 25,
  zIndex: 1,
  position: 'relative',
  transition: 'all 0.3s ease',
  color: active ? '#fff' : theme.palette.grey[500],
  fontWeight: active ? 600 : 400,
  fontSize: size === 'small' ? '0.7rem' : '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  
  '& svg': {
    fontSize: size === 'small' ? 14 : 16,
    transition: 'transform 0.3s ease',
    transform: active ? 'scale(1.1)' : 'scale(0.9)',
  },
  
  '&:hover': {
    color: active ? '#fff' : theme.palette.grey[300],
  },
}));

const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  onChange,
  disabled = false,
  size = 'medium',
  showLabel = true,
}) => {
  const handleToggle = (newStatus: 'done' | 'pending') => {
    if (!disabled && newStatus !== status) {
      onChange(newStatus);
    }
  };

  return (
    <ToggleContainer
      size={size}
      onClick={(e) => e.stopPropagation()}
      sx={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      role="radiogroup"
      aria-label="Status toggle"
    >
      <Slider status={status} size={size} />
      
      <OptionButton
        active={status === 'done'}
        size={size}
        onClick={() => handleToggle('done')}
        role="radio"
        aria-checked={status === 'done'}
      >
        <CheckCircle />
        {showLabel && <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>Done</Typography>}
      </OptionButton>
      
      <OptionButton
        active={status === 'pending'}
        size={size}
        onClick={() => handleToggle('pending')}
        role="radio"
        aria-checked={status === 'pending'}
      >
        <HourglassEmpty />
        {showLabel && <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>Pending</Typography>}
      </OptionButton>
    </ToggleContainer>
  );
};

export default StatusToggle;

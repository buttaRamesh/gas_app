import { ReactNode } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  description?: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  actions,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsla(var(--card-gradient-end), 0.03) 100%)',
        border: '2px solid',
        borderColor: 'hsla(var(--primary), 0.3)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px hsla(var(--primary), 0.12)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, hsla(var(--primary), 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 30%, hsl(var(--primary)) 70%, transparent 100%)',
        },
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left: Title */}
        <Box sx={{ flex: showSearch ? 0 : 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, hsl(var(--primary-dark)) 0%, hsl(var(--primary)) 50%, hsl(var(--primary-dark)) 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              fontSize: { xs: '1.5rem', md: '2rem' },
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                mt: 1,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* Right: Search Bar */}
        {showSearch && (
          <TextField
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{
              width: { xs: '100%', md: '400px' },
              '& .MuiOutlinedInput-root': {
                background: 'hsl(var(--card))',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: 'hsla(var(--primary), 0.25)',
                  borderWidth: '2px',
                },
                '&:hover': {
                  background: 'hsl(var(--card))',
                  boxShadow: '0 4px 12px hsla(var(--primary), 0.1)',
                  '& fieldset': {
                    borderColor: 'hsla(var(--primary), 0.5)',
                  },
                },
                '&.Mui-focused': {
                  background: 'hsl(var(--card))',
                  boxShadow: '0 0 0 3px hsla(var(--primary), 0.12), 0 4px 12px hsla(var(--primary), 0.15)',
                  '& fieldset': {
                    borderColor: 'hsl(var(--primary))',
                  },
                },
                '& input': {
                  fontWeight: 500,
                  color: 'hsl(var(--foreground))',
                  '&::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                    opacity: 0.6,
                  },
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'hsla(var(--primary), 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1,
                    }}
                  >
                    <SearchIcon sx={{ color: 'hsl(var(--primary))', fontSize: 20 }} />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Actions */}
        {actions && <Box sx={{ ml: { md: 2 } }}>{actions}</Box>}
      </Box>
    </Box>
  );
}

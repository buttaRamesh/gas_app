import { ReactNode } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { spacing, fontWeights } from '@/theme';

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
        mb: spacing.sm,
        pb: 1.5,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: spacing.sm,
        }}
      >
        {/* Left: Title */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: fontWeights.bold,
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                mt: 0.5,
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
            size="small"
            sx={{
              width: { xs: '100%', sm: '300px' },
              '& .MuiInputBase-root': {
                height: 36,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Actions */}
        {actions && <Box>{actions}</Box>}
      </Box>
    </Box>
  );
}

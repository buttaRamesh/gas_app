import { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { FilterToggleProps } from './FilterToggle.types';
import { SHADOWS, getFilterColors } from './FilterToggle.constants';

export const FilterToggle = ({
  label = 'Filter', 
  options,
  value, 
  onChange 
}: FilterToggleProps) => {
  const [filter, setFilter] = useState<string>(value || options[0]?.value || '');

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string | null
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      onChange(newFilter);
    }
  };

  const getButtonSx = (filterValue: string, isSelected: boolean) => {
    const colors = getFilterColors(options, filterValue);
    if (!colors) return {};

    const bg = isSelected ? colors.selected : colors.unselected;
    const shadow = isSelected ? SHADOWS.selected : SHADOWS.unselected;

    return {
      backgroundColor: `${bg} !important`,
      boxShadow: `${shadow} !important`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: isSelected 
        ? '1px solid rgba(255, 255, 255, 0.5) !important' 
        : '1px solid rgba(255, 255, 255, 0.2) !important',
      borderRadius: '50% !important',
      width: 24,
      height: 24,
      minWidth: 24,
      padding: 0,
      transition: 'none !important',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
      '&.Mui-selected': {
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
      '&.Mui-selected:hover': {
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
      '&:focus-visible': {
        outline: 'none',
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
      '&.Mui-focusVisible': {
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
      '&:active': {
        backgroundColor: `${bg} !important`,
        boxShadow: `${shadow} !important`,
      },
    };
  };

  return (
    <Box
      component="fieldset"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        padding: '6px 10px',
        margin: 0,
        width: 'fit-content',
      }}
    >
      <Typography
        component="legend"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          paddingX: '6px',
          textAlign: 'left',
          marginLeft: 0,
        }}
      >
        {label}
      </Typography>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleChange}
        aria-label={`${label.toLowerCase()} filter`}
        sx={{
          gap: '6px',
          '& .MuiToggleButtonGroup-grouped': {
            marginLeft: 0,
            '&:not(:first-of-type)': {
              borderLeft: 'none',
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            disableRipple
            disableFocusRipple
            disableTouchRipple
            sx={getButtonSx(option.value, filter === option.value)}
          />
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

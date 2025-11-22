import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { extractResults } from '@/utils/apiHelpers';

export interface LookupOption {
  id: number | string;
  label: string;
  [key: string]: any;
}

export interface LookupSelectProps<T extends LookupOption> {
  /** Label for the field */
  label: string;
  /** Current value (single or multiple) */
  value: T | T[] | null;
  /** Change handler */
  onChange: (value: T | T[] | null) => void;
  /** Function to fetch options from API */
  fetchOptions: () => Promise<{ data: { results?: any[]; data?: any[] } | any[] }>;
  /** Query key for React Query caching */
  queryKey: string[];
  /** Function to map API response to LookupOption */
  mapOption: (item: any) => T;
  /** Whether to allow multiple selection */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text or error message */
  helperText?: string;
  /** Limit the number of tags shown (for multiple select) */
  limitTags?: number;
  /** Enable free-form text input */
  freeSolo?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Custom no options text */
  noOptionsText?: string;
  /** Callback when search text changes */
  onInputChange?: (value: string) => void;
  /** Filter function for client-side filtering */
  filterOptions?: (options: T[], inputValue: string) => T[];
}

/**
 * LookupSelect - Autocomplete component for selecting entities from API
 *
 * @example
 * ```tsx
 * // Single selection
 * <Controller
 *   name="user_id"
 *   control={control}
 *   render={({ field }) => (
 *     <LookupSelect
 *       label="Select User"
 *       value={selectedUser}
 *       onChange={(value) => {
 *         field.onChange(value?.id);
 *         setSelectedUser(value);
 *       }}
 *       fetchOptions={() => usersApi.getAll()}
 *       queryKey={['users']}
 *       mapOption={(user) => ({
 *         id: user.id,
 *         label: user.full_name,
 *         ...user,
 *       })}
 *       required
 *     />
 *   )}
 * />
 *
 * // Multiple selection
 * <LookupSelect
 *   label="Select Roles"
 *   value={selectedRoles}
 *   onChange={setSelectedRoles}
 *   fetchOptions={() => rolesApi.getAll()}
 *   queryKey={['roles']}
 *   mapOption={(role) => ({
 *     id: role.id,
 *     label: role.display_name,
 *   })}
 *   multiple
 *   limitTags={3}
 * />
 * ```
 */
export function LookupSelect<T extends LookupOption>({
  label,
  value,
  onChange,
  fetchOptions,
  queryKey,
  mapOption,
  multiple = false,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  limitTags = 2,
  freeSolo = false,
  loadingText = 'Loading...',
  noOptionsText = 'No options',
  onInputChange,
  filterOptions,
}: LookupSelectProps<T>) {
  const [inputValue, setInputValue] = useState('');

  // Fetch options using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract and map options
  const options: T[] = React.useMemo(() => {
    const rawData = extractResults(data);
    return rawData.map(mapOption);
  }, [data, mapOption]);

  // Handle input change
  const handleInputChange = (_event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    onInputChange?.(newInputValue);
  };

  // Custom filter options (client-side filtering)
  const defaultFilterOptions = (opts: T[], state: { inputValue: string }) => {
    const inputLower = state.inputValue.toLowerCase();
    return opts.filter((option) =>
      option.label.toLowerCase().includes(inputLower)
    );
  };

  return (
    <Autocomplete<T, boolean, boolean, boolean>
      multiple={multiple as boolean}
      freeSolo={freeSolo as boolean}
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(newValue as T | T[] | null)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => {
        // Handle both object options and string options (freeSolo)
        if (typeof option === 'string') return option;
        return option.label || '';
      }}
      isOptionEqualToValue={(option, val) => {
        if (typeof val === 'string') return false;
        return option.id === val.id;
      }}
      filterOptions={filterOptions ?
        (opts, state) => filterOptions(opts, state.inputValue) :
        defaultFilterOptions
      }
      loading={isLoading}
      disabled={disabled}
      limitTags={limitTags}
      loadingText={loadingText}
      noOptionsText={isError ? 'Error loading options' : noOptionsText}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as any;
        return (
          <Box component="li" key={key} {...otherProps}>
            <Typography variant="body2">{option.label}</Typography>
          </Box>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={typeof option === 'string' ? option : option.label}
              size="small"
              {...tagProps}
            />
          );
        })
      }
    />
  );
}

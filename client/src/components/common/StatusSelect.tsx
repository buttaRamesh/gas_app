import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

export interface StatusOption {
  value: string | number | boolean;
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface StatusSelectProps {
  /** Label for the field */
  label: string;
  /** Current value */
  value: string | number | boolean;
  /** Change handler */
  onChange: (value: any) => void;
  /** Available options */
  options: StatusOption[];
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text or error message */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Placeholder when no value selected */
  placeholder?: string;
}

/**
 * StatusSelect - Simple select component for predefined options (e.g., status, priority)
 *
 * Commonly used for:
 * - Boolean status fields (Active/Inactive)
 * - Enums (Priority: Low/Medium/High)
 * - Fixed choice fields
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <Controller
 *   name="is_active"
 *   control={control}
 *   render={({ field }) => (
 *     <StatusSelect
 *       label="Status"
 *       value={field.value}
 *       onChange={field.onChange}
 *       options={[
 *         { value: true, label: 'Active', color: 'success' },
 *         { value: false, label: 'Inactive', color: 'error' },
 *       ]}
 *       required
 *     />
 *   )}
 * />
 *
 * // Priority select
 * <StatusSelect
 *   label="Priority"
 *   value={priority}
 *   onChange={setPriority}
 *   options={[
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High', color: 'error' },
 *   ]}
 * />
 *
 * // With placeholder
 * <StatusSelect
 *   label="Select Status"
 *   value={status}
 *   onChange={setStatus}
 *   options={STATUS_OPTIONS}
 *   placeholder="Choose a status..."
 * />
 * ```
 */
export const StatusSelect: React.FC<StatusSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  placeholder,
}) => {
  // Convert value to string for Select component
  const stringValue = value === null || value === undefined ? '' : String(value);

  const handleChange = (event: any) => {
    const selectedValue = event.target.value;

    // Find the original value type from options
    const option = options.find((opt) => String(opt.value) === selectedValue);
    if (option) {
      onChange(option.value);
    } else if (selectedValue === '') {
      onChange(null);
    }
  };

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={stringValue}
        onChange={handleChange}
        label={label}
        displayEmpty={!!placeholder}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

import React from 'react';
import { TextField, Stack } from '@mui/material';

export interface IdentificationData {
  ration_card_num?: string;
  aadhar_num?: string;
  pan_num?: string;
}

export interface IdentificationFieldsProps {
  /** Form data */
  data: IdentificationData;
  /** Change handler */
  onChange: (field: keyof IdentificationData, value: string) => void;
  /** Whether fields are disabled */
  disabled?: boolean;
  /** Whether to show validation errors */
  showValidation?: boolean;
}

/**
 * Reusable identification document form fields
 * Used in ConsumerCreate, ConsumerEdit, ConsumerDetail dialogs
 * Includes validation for Aadhar (12 digits) and PAN (10 alphanumeric)
 */
export const IdentificationFields: React.FC<IdentificationFieldsProps> = ({
  data,
  onChange,
  disabled = false,
  showValidation = true,
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof IdentificationData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    onChange(field, value);

    // Validate on change if showValidation is true
    if (showValidation) {
      validateField(field, value);
    }
  };

  const validateField = (field: keyof IdentificationData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'aadhar_num':
        if (value && !/^\d{12}$/.test(value)) {
          newErrors.aadhar_num = 'Aadhar must be exactly 12 digits';
        } else {
          delete newErrors.aadhar_num;
        }
        break;

      case 'pan_num':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
          newErrors.pan_num = 'PAN must be 10 characters (e.g., ABCDE1234F)';
        } else {
          delete newErrors.pan_num;
        }
        break;

      case 'ration_card_num':
        // No specific validation for ration card
        delete newErrors.ration_card_num;
        break;
    }

    setErrors(newErrors);
  };

  const commonFieldProps = {
    fullWidth: true,
    disabled,
    sx: { '& .MuiOutlinedInput-root': { backgroundColor: disabled ? 'action.disabledBackground' : 'white' } },
  };

  return (
    <Stack spacing={2}>
      <TextField
        {...commonFieldProps}
        label="Ration Card Number"
        value={data.ration_card_num || ''}
        onChange={handleChange('ration_card_num')}
        placeholder="Enter ration card number"
      />

      <TextField
        {...commonFieldProps}
        label="Aadhar Number"
        value={data.aadhar_num || ''}
        onChange={handleChange('aadhar_num')}
        placeholder="Enter 12-digit Aadhar number"
        inputProps={{ maxLength: 12 }}
        error={!!errors.aadhar_num}
        helperText={errors.aadhar_num || 'Enter 12-digit Aadhar number'}
      />

      <TextField
        {...commonFieldProps}
        label="PAN Number"
        value={data.pan_num || ''}
        onChange={handleChange('pan_num')}
        placeholder="Enter PAN (e.g., ABCDE1234F)"
        inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
        error={!!errors.pan_num}
        helperText={errors.pan_num || 'Enter 10-character PAN'}
      />
    </Stack>
  );
};

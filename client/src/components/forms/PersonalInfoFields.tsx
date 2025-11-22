import React from 'react';
import { TextField, Stack, Box } from '@mui/material';

export interface PersonalInfoData {
  consumer_name?: string;
  person_name?: string;
  father_name?: string;
  mother_name?: string;
  spouse_name?: string;
  dob?: string;
}

export interface PersonalInfoFieldsProps {
  /** Form data */
  data: PersonalInfoData;
  /** Change handler */
  onChange: (field: keyof PersonalInfoData, value: string) => void;
  /** Whether name field is required */
  required?: boolean;
  /** Whether to show DOB field */
  showDob?: boolean;
  /** Field name for the person name (consumer_name or person_name) */
  nameField?: 'consumer_name' | 'person_name';
  /** Layout variant */
  layout?: 'stacked' | 'grid';
  /** Whether fields are disabled */
  disabled?: boolean;
}

/**
 * Reusable personal information form fields
 * Used in ConsumerCreate, ConsumerEdit, ConsumerDetail dialogs
 */
export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  data,
  onChange,
  required = false,
  showDob = true,
  nameField = 'consumer_name',
  layout = 'stacked',
  disabled = false,
}) => {
  const nameValue = data[nameField] || '';

  const handleChange = (field: keyof PersonalInfoData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, event.target.value);
  };

  const commonFieldProps = {
    fullWidth: true,
    disabled,
    sx: { '& .MuiOutlinedInput-root': { backgroundColor: disabled ? 'action.disabledBackground' : 'white' } },
  };

  if (layout === 'grid') {
    return (
      <Stack spacing={3}>
        <TextField
          {...commonFieldProps}
          required={required}
          label="Consumer Name"
          value={nameValue}
          onChange={handleChange(nameField)}
        />

        {showDob && (
          <TextField
            {...commonFieldProps}
            label="Date of Birth"
            type="date"
            value={data.dob || ''}
            onChange={handleChange('dob')}
            InputLabelProps={{ shrink: true }}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <TextField
            {...commonFieldProps}
            label="Father's Name"
            value={data.father_name || ''}
            onChange={handleChange('father_name')}
          />
          <TextField
            {...commonFieldProps}
            label="Mother's Name"
            value={data.mother_name || ''}
            onChange={handleChange('mother_name')}
          />
          <TextField
            {...commonFieldProps}
            label="Spouse Name"
            value={data.spouse_name || ''}
            onChange={handleChange('spouse_name')}
          />
        </Box>
      </Stack>
    );
  }

  // Stacked layout
  return (
    <Stack spacing={2}>
      <TextField
        {...commonFieldProps}
        required={required}
        label="Consumer Name"
        value={nameValue}
        onChange={handleChange(nameField)}
      />

      {showDob && (
        <TextField
          {...commonFieldProps}
          label="Date of Birth"
          type="date"
          value={data.dob || ''}
          onChange={handleChange('dob')}
          InputLabelProps={{ shrink: true }}
        />
      )}

      <TextField
        {...commonFieldProps}
        label="Father's Name"
        value={data.father_name || ''}
        onChange={handleChange('father_name')}
      />

      <TextField
        {...commonFieldProps}
        label="Mother's Name"
        value={data.mother_name || ''}
        onChange={handleChange('mother_name')}
      />

      <TextField
        {...commonFieldProps}
        label="Spouse Name"
        value={data.spouse_name || ''}
        onChange={handleChange('spouse_name')}
      />
    </Stack>
  );
};

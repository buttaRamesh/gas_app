import { Grid, TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";

interface ContactFormFieldsProps {
  control: Control<any>;
  errors: any;
  prefix?: string;
}

export const ContactFormFields = ({ control, errors, prefix = "" }: ContactFormFieldsProps) => {
  const getFieldName = (field: string) => prefix ? `${prefix}.${field}` : field;
  const getError = (field: string) => {
    if (!prefix) return errors[field];
    return errors[prefix]?.[field];
  };

  return (
    <>
      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("mobile_number")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Mobile Number"
              placeholder="10-digit mobile number"
              error={!!getError("mobile_number")}
              helperText={getError("mobile_number")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("phone_number")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Landline Number"
              placeholder="Landline with area code"
              error={!!getError("phone_number")}
              helperText={getError("phone_number")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("email")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="email"
              label="Email Address"
              placeholder="example@email.com"
              error={!!getError("email")}
              helperText={getError("email")?.message}
            />
          )}
        />
      </Grid>
    </>
  );
};

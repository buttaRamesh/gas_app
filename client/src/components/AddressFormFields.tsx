import { Grid, TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";

interface AddressFormFieldsProps {
  control: Control<any>;
  errors: any;
  prefix?: string;
}

export const AddressFormFields = ({ control, errors, prefix = "" }: AddressFormFieldsProps) => {
  const getFieldName = (field: string) => prefix ? `${prefix}.${field}` : field;
  const getError = (field: string) => {
    if (!prefix) return errors[field];
    return errors[prefix]?.[field];
  };

  return (
    <>
      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("house_no")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="House Number"
              error={!!getError("house_no")}
              helperText={getError("house_no")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("house_name_flat_number")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Flat or Building Name"
              error={!!getError("house_name_flat_number")}
              helperText={getError("house_name_flat_number")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("housing_complex_building")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Complex Name"
              error={!!getError("housing_complex_building")}
              helperText={getError("housing_complex_building")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("street_road_name")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Street/Road Name"
              error={!!getError("street_road_name")}
              helperText={getError("street_road_name")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("land_mark")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Nearby Landmark"
              error={!!getError("land_mark")}
              helperText={getError("land_mark")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("city_town_village")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="City/Town/Village"
              error={!!getError("city_town_village")}
              helperText={getError("city_town_village")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("district")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="District"
              error={!!getError("district")}
              helperText={getError("district")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name={getFieldName("pin_code")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Pin Code"
              error={!!getError("pin_code")}
              helperText={getError("pin_code")?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name={getFieldName("address_text")}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={2}
              label="Full Address (Optional)"
              placeholder="Complete address as a single text"
              error={!!getError("address_text")}
              helperText={getError("address_text")?.message}
            />
          )}
        />
      </Grid>
    </>
  );
};

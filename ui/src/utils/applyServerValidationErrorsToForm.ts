import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ValidationErrors = Record<string, string[]>;

export const applyServerValidationErrorsToForm = <T extends FieldValues>(
  errors: ValidationErrors | null | undefined,
  setError: UseFormSetError<T>
) => {
  if (!errors) return;

  Object.entries(errors).forEach(([field, messages]) => {
    if (!messages || messages.length === 0) return;

    // Cast field name safely to Path<T>
    const fieldName = field as Path<T>;

    setError(fieldName, {
      type: "server",
      message: messages[0],
    });
  });
};

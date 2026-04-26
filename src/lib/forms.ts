import { UseFormSetError } from "react-hook-form";

/**
 * Handles Laravel validation errors and applies them to React Hook Form.
 */
export const handleApiError = (error: any, setError: UseFormSetError<any>) => {
  if (error.response?.status === 422 && error.response.data.errors) {
    const errors = error.response.data.errors;
    Object.keys(errors).forEach((key) => {
      setError(key, {
        type: "server",
        message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
      });
    });
    return true;
  }
  return false;
};

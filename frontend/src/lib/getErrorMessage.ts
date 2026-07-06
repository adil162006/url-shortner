import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
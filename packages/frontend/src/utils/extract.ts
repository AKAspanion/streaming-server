/* eslint-disable @typescript-eslint/no-explicit-any */
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export function isErrorAPIType(error: unknown): error is APIErrorType {
  return (
    typeof error === 'object' &&
    error != null &&
    'data' in error &&
    typeof (error as any) === 'object' &&
    typeof (error?.data as any)?.message === 'string'
  );
}

export const extractErrorMessage = (
  err?: FetchBaseQueryError | SerializedError,
  fallbackMessage: string = 'Oops! Something went wrong!',
) => {
  if (!err) {
    return fallbackMessage;
  }

  if (isErrorAPIType(err)) {
    return err?.data?.message || fallbackMessage;
  }

  if (isFetchBaseQueryError(err)) {
    const errMsg = 'error' in err ? err.error : JSON.stringify(err.data);
    return errMsg;
  } else if (isErrorWithMessage(err)) {
    return err.message;
  }
};

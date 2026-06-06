/**
 * Client-side React hooks for form state management
 */

"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormAction, FormActionResult, FormState } from "./types.js";

/**
 * Hook to use a form action with React 19's useActionState
 *
 * @example
 * ```tsx
 * const { state, action, pending } = useFormAction(loginAction);
 *
 * return (
 *   <form action={action}>
 *     <input name="email" />
 *     {state.errors?.email && <span>{state.errors.email[0]}</span>}
 *     <button disabled={pending}>Submit</button>
 *   </form>
 * );
 * ```
 */
export function useFormAction<TOutput>(
  formAction: FormAction<TOutput>,
  options?: {
    onSuccess?: (data: TOutput) => void;
    onError?: (errors: FormState<TOutput>["errors"]) => void;
    resetOnSuccess?: boolean;
  },
) {
  const formRef = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  const resetOnSuccessRef = useRef(options?.resetOnSuccess);

  // Keep refs up to date
  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
    onErrorRef.current = options?.onError;
    resetOnSuccessRef.current = options?.resetOnSuccess;
  });

  const [result, action, pending] = useActionState<FormActionResult<TOutput> | null, FormData>(
    formAction,
    null,
  );

  // Convert result to FormState
  const state: FormState<TOutput> = {
    data: result?.success ? result.data : undefined,
    errors: result?.success === false ? result.errors : undefined,
    pending,
    success: result?.success === true,
  };

  // Handle success/error callbacks
  // Only depend on result to avoid re-firing callbacks when options object changes
  useEffect(() => {
    if (result?.success && onSuccessRef.current) {
      onSuccessRef.current(result.data);

      // Reset form if requested
      if (resetOnSuccessRef.current && formRef.current) {
        formRef.current.reset();
      }
    }

    if (result?.success === false && onErrorRef.current) {
      onErrorRef.current(result.errors);
    }
  }, [result]);

  return {
    state,
    action,
    pending,
    formRef,
  };
}

/**
 * Get field props with error state
 */
export function useFieldProps(name: string, errors?: FormState["errors"]) {
  const fieldErrors = errors?.[name];
  const hasError = !!fieldErrors && fieldErrors.length > 0;
  // Sanitize name for use in HTML ID (remove special characters)
  const sanitizedName = name.replace(/[^\w-]/g, "_");

  return {
    name,
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${sanitizedName}-error` : undefined,
  };
}

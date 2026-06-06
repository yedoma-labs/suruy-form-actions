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
  useEffect(() => {
    if (result?.success && options?.onSuccess) {
      options.onSuccess(result.data);

      // Reset form if requested
      if (options.resetOnSuccess && formRef.current) {
        formRef.current.reset();
      }
    }

    if (result?.success === false && options?.onError) {
      options.onError(result.errors);
    }
  }, [result, options]);

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

  return {
    name,
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${name}-error` : undefined,
  };
}

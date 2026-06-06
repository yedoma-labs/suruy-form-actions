/**
 * Core types for suruy-form-actions
 * Zero-dependency form library for React Server Actions
 */

/**
 * Result of a form action - either success with data or error with field errors
 */
export type FormActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; errors: FormErrors };

/**
 * Field-level errors from validation
 */
export type FormErrors = Record<string, string[]>;

/**
 * Raw form data from submission
 */
export type FormData = globalThis.FormData;

/**
 * Validation function - takes FormData and returns validation result
 */
export type Validator<T> = (
  data: FormData,
) => Promise<{ success: true; data: T } | { success: false; errors: FormErrors }>;

/**
 * Form action handler - receives validated data and returns result
 */
export type FormActionHandler<TInput, TOutput> = (
  input: TInput,
) => Promise<FormActionResult<TOutput>>;

/**
 * Complete form action combining validation + handler
 */
export type FormAction<TOutput = unknown> = (
  prevState: FormActionResult<TOutput> | null,
  formData: FormData,
) => Promise<FormActionResult<TOutput>>;

/**
 * Field descriptor for accessing form data
 */
export interface FieldDescriptor {
  name: string;
  defaultValue?: string;
  errors?: string[];
}

/**
 * Form state for client-side hooks
 */
export interface FormState<T = unknown> {
  data?: T;
  errors?: FormErrors;
  pending: boolean;
  success: boolean;
}

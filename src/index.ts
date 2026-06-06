/**
 * @yedoma-labs/suruy-form-actions
 *
 * Type-safe form library for React Server Actions with progressive enhancement.
 * Zero runtime dependencies.
 */

export { createFormAction, createSimpleAction } from "./action.js";
export { useFieldProps, useFormAction } from "./hooks.js";
export type {
  FieldDescriptor,
  FormAction,
  FormActionHandler,
  FormActionResult,
  FormErrors,
  FormState,
  Validator,
} from "./types.js";
export { createValidator, parseFormData, schema } from "./validation.js";

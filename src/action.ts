/**
 * Core form action creation utilities
 */

import type { FormAction, FormActionHandler, FormActionResult, Validator } from "./types.js";

/**
 * Create a type-safe form action with validation
 *
 * @param validator - Validation function that checks FormData and returns typed result
 * @param handler - Business logic handler that receives validated data
 * @returns Form action compatible with React's useActionState
 *
 * @remarks
 * The prevState parameter is intentionally unused in this library's design.
 * Form state is managed client-side via useFormAction hook, not accumulated
 * across submissions. This keeps server actions stateless and cacheable.
 *
 * @example
 * ```ts
 * const loginAction = createFormAction(
 *   loginSchema,
 *   async (data) => {
 *     const user = await db.user.findUnique({ where: { email: data.email } });
 *     // ...
 *     return { success: true, data: user };
 *   }
 * );
 * ```
 */
export function createFormAction<TInput, TOutput>(
  validator: Validator<TInput>,
  handler: FormActionHandler<TInput, TOutput>,
): FormAction<TOutput> {
  return async (
    _prevState: FormActionResult<TOutput> | null,
    formData: FormData,
  ): Promise<FormActionResult<TOutput>> => {
    // Validate input
    const validation = await validator(formData);

    if (!validation.success) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Execute handler with validated data
    try {
      return await handler(validation.data);
    } catch (error) {
      // Handle unexpected errors
      return {
        success: false,
        errors: {
          _form: [error instanceof Error ? error.message : "An unexpected error occurred"],
        },
      };
    }
  };
}

/**
 * Create a form action without validation (useful for simple actions)
 *
 * @param handler - Handler function that processes FormData directly
 * @returns Form action compatible with React's useActionState
 *
 * @remarks
 * The prevState parameter is intentionally unused (see createFormAction for rationale).
 *
 * @example
 * ```ts
 * const simpleAction = createSimpleAction(async (formData) => {
 *   const name = formData.get("name");
 *   return { success: true, data: { message: `Hello ${name}` } };
 * });
 * ```
 */
export function createSimpleAction<TOutput>(
  handler: (formData: FormData) => Promise<FormActionResult<TOutput>>,
): FormAction<TOutput> {
  return async (
    _prevState: FormActionResult<TOutput> | null,
    formData: FormData,
  ): Promise<FormActionResult<TOutput>> => {
    try {
      return await handler(formData);
    } catch (error) {
      return {
        success: false,
        errors: {
          _form: [error instanceof Error ? error.message : "An unexpected error occurred"],
        },
      };
    }
  };
}

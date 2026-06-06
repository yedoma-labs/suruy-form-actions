/**
 * Built-in validation utilities (zero dependencies)
 */

import type { FormErrors, Validator } from "./types.js";

/**
 * Create a validator from a validation function
 */
export function createValidator<T>(
  validate: (
    data: Record<string, unknown>,
  ) => { success: true; data: T } | { success: false; errors: FormErrors },
): Validator<T> {
  return async (formData: FormData) => {
    // Use parseFormData for consistency with array handling
    const data = parseFormData(formData);
    return validate(data);
  };
}

/**
 * Parse FormData into typed object
 */
export function parseFormData(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // Handle array fields (e.g., checkboxes with same name)
    if (key.endsWith("[]")) {
      const arrayKey = key.slice(0, -2);
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }
      (result[arrayKey] as unknown[]).push(value);
    } else if (result[key]) {
      // Convert to array if duplicate keys
      if (Array.isArray(result[key])) {
        (result[key] as unknown[]).push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Simple validator builder (zero-dep alternative to Zod)
 */
export interface Schema<T> {
  parse(data: unknown): T;
  safeParse(data: unknown): { success: true; data: T } | { success: false; errors: FormErrors };
}

type FieldValidator<T> = {
  type: "string" | "number" | "boolean" | "email" | "url";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
};

/**
 * Create a simple schema validator
 */
export function schema<T extends Record<string, unknown>>(
  fields: Record<keyof T, FieldValidator<unknown>>,
): Schema<T> {
  return {
    parse(data: unknown): T {
      const result = this.safeParse(data);
      if (!result.success) {
        throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
      }
      return result.data;
    },

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: validation logic is inherently complex
    safeParse(data: unknown): { success: true; data: T } | { success: false; errors: FormErrors } {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return { success: false, errors: { _form: ["Invalid form data"] } };
      }

      const errors: FormErrors = {};
      const parsed: Record<string, unknown> = {};

      for (const [key, validator] of Object.entries(fields)) {
        const value = (data as Record<string, unknown>)[key];

        // Required validation (trim whitespace for strings)
        const isEmpty =
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "") ||
          value === "";

        if (validator.required && isEmpty) {
          errors[key] = ["This field is required"];
          continue;
        }

        if (isEmpty) {
          // Use undefined for optional fields (not null) to match TypeScript contracts
          continue;
        }

        // Type validation
        let typedValue: unknown = value;

        switch (validator.type) {
          case "string": {
            const strValue = String(value);
            typedValue = strValue;
            const fieldErrors: string[] = [];

            if (validator.min && strValue.length < validator.min) {
              fieldErrors.push(`Minimum length is ${validator.min}`);
            }
            if (validator.max && strValue.length > validator.max) {
              fieldErrors.push(`Maximum length is ${validator.max}`);
            }
            if (validator.pattern && !validator.pattern.test(strValue)) {
              fieldErrors.push("Invalid format");
            }

            if (fieldErrors.length > 0) {
              errors[key] = fieldErrors;
            }
            break;
          }

          case "number": {
            const numValue = Number(value);
            typedValue = numValue;
            if (Number.isNaN(numValue)) {
              errors[key] = ["Must be a number"];
              break;
            }

            const fieldErrors: string[] = [];
            if (validator.min !== undefined && numValue < validator.min) {
              fieldErrors.push(`Minimum value is ${validator.min}`);
            }
            if (validator.max !== undefined && numValue > validator.max) {
              fieldErrors.push(`Maximum value is ${validator.max}`);
            }

            if (fieldErrors.length > 0) {
              errors[key] = fieldErrors;
            }
            break;
          }

          case "boolean":
            typedValue = value === "true" || value === "on" || value === true;
            break;

          case "email": {
            const emailValue = String(value);
            typedValue = emailValue;
            // More robust email validation (basic RFC 5322 compliance)
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
              errors[key] = ["Invalid email address"];
            }
            break;
          }

          case "url": {
            const urlValue = String(value);
            typedValue = urlValue;
            try {
              const url = new URL(urlValue);
              // Block dangerous URL schemes to prevent XSS
              const allowedProtocols = ["http:", "https:"];
              if (!allowedProtocols.includes(url.protocol)) {
                errors[key] = ["Only HTTP and HTTPS URLs are allowed"];
              }
            } catch {
              errors[key] = ["Invalid URL"];
            }
            break;
          }
        }

        // Custom validation
        if (validator.custom && !errors[key]) {
          const customError = validator.custom(typedValue);
          if (customError) {
            errors[key] = [customError];
          }
        }

        if (!errors[key]) {
          parsed[key] = typedValue;
        }
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      return { success: true, data: parsed as T };
    },
  };
}

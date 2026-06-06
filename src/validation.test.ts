import { describe, expect, test } from "vitest";
import { parseFormData, schema } from "./validation.js";

describe("parseFormData", () => {
  test("parses simple form data", () => {
    const formData = new FormData();
    formData.append("name", "John");
    formData.append("email", "john@example.com");

    const result = parseFormData(formData);

    expect(result).toEqual({
      name: "John",
      email: "john@example.com",
    });
  });

  test("handles array fields", () => {
    const formData = new FormData();
    formData.append("tags[]", "javascript");
    formData.append("tags[]", "typescript");

    const result = parseFormData(formData);

    expect(result.tags).toEqual(["javascript", "typescript"]);
  });

  test("handles duplicate form keys", () => {
    const formData = new FormData();
    formData.append("value", "first");
    formData.append("value", "second");

    const result = parseFormData(formData);

    expect(result.value).toEqual(["first", "second"]);
  });
});

describe("schema", () => {
  test("validates required string field", () => {
    const userSchema = schema<{ name: string }>({
      name: { type: "string", required: true },
    });

    const result = userSchema.safeParse({ name: "John" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John");
    }
  });

  test("returns error for missing required field", () => {
    const userSchema = schema<{ name: string }>({
      name: { type: "string", required: true },
    });

    const result = userSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toEqual(["This field is required"]);
    }
  });

  test("validates email format", () => {
    const userSchema = schema<{ email: string }>({
      email: { type: "email", required: true },
    });

    const validResult = userSchema.safeParse({ email: "test@example.com" });
    expect(validResult.success).toBe(true);

    const invalidResult = userSchema.safeParse({ email: "invalid" });
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.errors.email).toEqual(["Invalid email address"]);
    }
  });

  test("validates string length", () => {
    const userSchema = schema<{ password: string }>({
      password: { type: "string", required: true, min: 8, max: 20 },
    });

    const tooShort = userSchema.safeParse({ password: "1234" });
    expect(tooShort.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.errors.password).toEqual(["Minimum length is 8"]);
    }

    const tooLong = userSchema.safeParse({ password: "a".repeat(21) });
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.errors.password).toEqual(["Maximum length is 20"]);
    }

    const valid = userSchema.safeParse({ password: "validpass123" });
    expect(valid.success).toBe(true);
  });

  test("validates numbers", () => {
    const ageSchema = schema<{ age: number }>({
      age: { type: "number", required: true, min: 18, max: 100 },
    });

    const tooYoung = ageSchema.safeParse({ age: "15" });
    expect(tooYoung.success).toBe(false);
    if (!tooYoung.success) {
      expect(tooYoung.errors.age).toEqual(["Minimum value is 18"]);
    }

    const valid = ageSchema.safeParse({ age: "25" });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.age).toBe(25);
    }
  });

  test("custom validation", () => {
    const usernameSchema = schema<{ username: string }>({
      username: {
        type: "string",
        required: true,
        custom: (value) => {
          if (!/^[a-z0-9_]+$/.test(value as string)) {
            return "Username can only contain lowercase letters, numbers, and underscores";
          }
          return null;
        },
      },
    });

    const invalid = usernameSchema.safeParse({ username: "Invalid-User!" });
    expect(invalid.success).toBe(false);

    const valid = usernameSchema.safeParse({ username: "valid_user123" });
    expect(valid.success).toBe(true);
  });

  test("rejects whitespace-only strings for required fields", () => {
    const userSchema = schema<{ name: string }>({
      name: { type: "string", required: true },
    });

    const whitespaceOnly = userSchema.safeParse({ name: "   " });
    expect(whitespaceOnly.success).toBe(false);
    if (!whitespaceOnly.success) {
      expect(whitespaceOnly.errors.name).toEqual(["This field is required"]);
    }
  });

  test("blocks dangerous URL schemes (XSS prevention)", () => {
    const linkSchema = schema<{ url: string }>({
      url: { type: "url", required: true },
    });

    const validUrl = linkSchema.safeParse({ url: "https://example.com" });
    expect(validUrl.success).toBe(true);

    const javascriptUrl = linkSchema.safeParse({ url: "javascript:alert(1)" });
    expect(javascriptUrl.success).toBe(false);
    if (!javascriptUrl.success) {
      expect(javascriptUrl.errors.url).toEqual(["Only HTTP and HTTPS URLs are allowed"]);
    }

    const dataUrl = linkSchema.safeParse({ url: "data:text/html,<script>alert(1)</script>" });
    expect(dataUrl.success).toBe(false);
  });

  test("accumulates multiple validation errors", () => {
    const passwordSchema = schema<{ password: string }>({
      password: {
        type: "string",
        required: true,
        min: 8,
        max: 20,
        pattern: /[A-Z]/,
      },
    });

    const result = passwordSchema.safeParse({ password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should show both min length and pattern errors
      expect(result.errors.password?.length).toBeGreaterThan(0);
      expect(result.errors.password).toContain("Minimum length is 8");
    }
  });

  test("rejects array input to safeParse", () => {
    const userSchema = schema<{ name: string }>({
      name: { type: "string", required: true },
    });

    const result = userSchema.safeParse(["not", "an", "object"]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toEqual(["Invalid form data"]);
    }
  });

  test("handles NaN gracefully for number fields", () => {
    const numberSchema = schema<{ count: number }>({
      count: { type: "number", required: true, min: 1 },
    });

    const result = numberSchema.safeParse({ count: "not-a-number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should only show NaN error, not min value error
      expect(result.errors.count).toEqual(["Must be a number"]);
    }
  });
});

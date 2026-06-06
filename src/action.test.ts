import { describe, expect, test } from "vitest";
import { createFormAction, createSimpleAction } from "./action.js";
import { createValidator, schema } from "./validation.js";

describe("createFormAction", () => {
  test("validates and processes form data successfully", async () => {
    const loginSchema = schema<{ email: string; password: string }>({
      email: { type: "email", required: true },
      password: { type: "string", required: true, min: 8 },
    });

    const validator = createValidator(loginSchema.safeParse.bind(loginSchema));

    const action = createFormAction(validator, async (data) => {
      return {
        success: true,
        data: { userId: "123", email: data.email },
      };
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    const result = await action(null, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ userId: "123", email: "test@example.com" });
    }
  });

  test("returns validation errors", async () => {
    const loginSchema = schema<{ email: string; password: string }>({
      email: { type: "email", required: true },
      password: { type: "string", required: true, min: 8 },
    });

    const validator = createValidator(loginSchema.safeParse.bind(loginSchema));

    const action = createFormAction(validator, async (data) => {
      return { success: true, data: { userId: "123", email: data.email } };
    });

    const formData = new FormData();
    formData.append("email", "invalid-email");
    formData.append("password", "short");

    const result = await action(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    }
  });

  test("catches handler errors", async () => {
    const validator = createValidator(() => ({ success: true, data: {} }));

    const action = createFormAction(validator, async () => {
      throw new Error("Database connection failed");
    });

    const formData = new FormData();
    const result = await action(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toEqual(["Database connection failed"]);
    }
  });
});

describe("createSimpleAction", () => {
  test("processes form data without validation", async () => {
    const action = createSimpleAction(async (formData) => {
      const name = formData.get("name") as string;
      return { success: true, data: { message: `Hello, ${name}!` } };
    });

    const formData = new FormData();
    formData.append("name", "World");

    const result = await action(null, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("Hello, World!");
    }
  });

  test("catches errors in simple actions", async () => {
    const action = createSimpleAction(async () => {
      throw new Error("Something went wrong");
    });

    const formData = new FormData();
    const result = await action(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toEqual(["Something went wrong"]);
    }
  });
});

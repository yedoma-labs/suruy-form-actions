# @yedoma-labs/suruy-form-actions

<picture>
  <source media="(max-width: 640px)" srcset="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized-mobile.png">
  <img src="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized.png" alt="Project Header">
</picture>

[![CI](https://github.com/yedoma-labs/suruy-form-actions/actions/workflows/ci.yml/badge.svg)](https://github.com/yedoma-labs/suruy-form-actions/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@yedoma-labs/suruy-form-actions)](https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions)
[![npm downloads](https://img.shields.io/npm/dm/@yedoma-labs/suruy-form-actions)](https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions)
[![Node.js](https://img.shields.io/node/v/@yedoma-labs/suruy-form-actions)](https://www.npmjs.com/package/@yedoma-labs/suruy-form-actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x+-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![License](https://img.shields.io/npm/l/@yedoma-labs/suruy-form-actions)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@yedoma-labs/suruy-form-actions)](https://bundlephobia.com/package/@yedoma-labs/suruy-form-actions)

> **suruy** (Yakut: суруй) — _verb._ write, inscribe

Type-safe form library for React Server Actions with progressive enhancement

## Features

- ✅ **Zero runtime dependencies** - Lightweight and fast
- 🎯 **Type-safe** - Full TypeScript support with inference
- 🚀 **React 19 ready** - Uses `useActionState` for optimal UX
- 📝 **Progressive enhancement** - Works without JavaScript
- 🎨 **Flexible validation** - Built-in validator or bring your own (Zod, Valibot, etc.)
- 🔒 **Server-first** - Validation runs on the server
- 🪶 **Tiny bundle** - ~3KB gzipped

## Installation

```bash
pnpm add @yedoma-labs/suruy-form-actions
```

## Quick Start

### 1. Create a form action

```tsx
// app/actions.ts
"use server";

import { createFormAction, schema } from "@yedoma-labs/suruy-form-actions";

const loginSchema = schema<{ email: string; password: string }>({
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 8 },
});

export const loginAction = createFormAction(
  (formData) => loginSchema.safeParse(Object.fromEntries(formData)),
  async (data) => {
    // Your business logic here
    const user = await db.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
      return { success: false, errors: { email: ["User not found"] } };
    }

    return { success: true, data: { userId: user.id } };
  }
);
```

### 2. Use in a component

```tsx
// app/login/page.tsx
"use client";

import { useFormAction } from "@yedoma-labs/suruy-form-actions";
import { loginAction } from "./actions";

export default function LoginPage() {
  const { state, action, pending, formRef } = useFormAction(loginAction, {
    onSuccess: (data) => {
      console.log("Logged in as", data.userId);
    },
    resetOnSuccess: true,
  });

  return (
    <form ref={formRef} action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        {state.errors?.email && (
          <span role="alert">{state.errors.email[0]}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        {state.errors?.password && (
          <span role="alert">{state.errors.password[0]}</span>
        )}
      </div>

      <button type="submit" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </button>

      {state.errors?._form && (
        <div role="alert">{state.errors._form[0]}</div>
      )}
    </form>
  );
}
```

## API Reference

### `createFormAction(validator, handler)`

Create a type-safe form action with validation.

```tsx
const action = createFormAction<Input, Output>(
  validator,  // (formData: FormData) => Promise<ValidationResult>
  handler     // (data: Input) => Promise<ActionResult<Output>>
);
```

**Returns:** A form action compatible with React's `useActionState`

### `createSimpleAction(handler)`

Create a form action without validation (for simple use cases).

```tsx
const action = createSimpleAction(async (formData) => {
  const name = formData.get("name");
  return { success: true, data: { message: `Hello ${name}` } };
});
```

### `useFormAction(action, options?)`

React hook to manage form state on the client.

```tsx
const { state, action, pending, formRef } = useFormAction(myAction, {
  onSuccess: (data) => void,
  onError: (errors) => void,
  resetOnSuccess: true,
});
```

**Returns:**
- `state` - Current form state (`data`, `errors`, `pending`, `success`)
- `action` - Function to pass to `<form action={...}>`
- `pending` - Boolean indicating if submission is in progress
- `formRef` - Ref to attach to form element (for auto-reset)

### `schema(fields)`

Built-in zero-dependency validator (alternative to Zod).

```tsx
const userSchema = schema<{ name: string; age: number }>({
  name: {
    type: "string",
    required: true,
    min: 2,
    max: 50,
  },
  age: {
    type: "number",
    required: true,
    min: 18,
    max: 120,
  },
  email: {
    type: "email",
    required: true,
  },
  website: {
    type: "url",
    required: false,
  },
});
```

**Supported types:** `string`, `number`, `boolean`, `email`, `url`

**Constraints:** `required`, `min`, `max`, `pattern` (regex), `custom` (function)

### `parseFormData(formData)`

Parse FormData into a plain object.

```tsx
const data = parseFormData(formData);
// { name: "John", tags: ["a", "b"] }
```

Handles array fields with `[]` suffix automatically.

## Using with Zod

```tsx
import { createFormAction } from "@yedoma-labs/suruy-form-actions";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validator = async (formData: FormData) => {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  return { success: true, data: result.data };
};

export const loginAction = createFormAction(validator, async (data) => {
  // ...
});
```

## Progressive Enhancement

Forms work without JavaScript by default:

```tsx
// This form submits to the server even if JS is disabled
<form action={myAction}>
  <input name="email" type="email" required />
  <button>Submit</button>
</form>
```

The server will:
1. Validate the input
2. Process the action
3. Return errors or redirect

With JavaScript enabled, you get:
- Loading states (`pending`)
- Client-side error display
- No page refresh
- `onSuccess`/`onError` callbacks

## Examples

### Multi-field validation

```tsx
const registerSchema = schema<{
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}>({
  username: {
    type: "string",
    required: true,
    min: 3,
    custom: (value) => {
      if (!/^[a-z0-9_]+$/.test(value)) {
        return "Only lowercase letters, numbers, and underscores";
      }
      return null;
    },
  },
  email: { type: "email", required: true },
  password: { type: "string", required: true, min: 8 },
  confirmPassword: { type: "string", required: true },
});
```

### File uploads

```tsx
const uploadAction = createSimpleAction(async (formData) => {
  const file = formData.get("avatar") as File;
  
  if (file.size > 5_000_000) {
    return { success: false, errors: { avatar: ["File too large"] } };
  }
  
  const url = await uploadToS3(file);
  return { success: true, data: { url } };
});
```

### Optimistic updates

```tsx
const { state, action, pending } = useFormAction(addTodoAction, {
  onSuccess: (data) => {
    // Optimistically add to UI
    setTodos(prev => [...prev, data.todo]);
  },
});
```

## Why suruy-form-actions?

| Feature | suruy-form-actions | React Hook Form | Formik | Conform |
|---------|-----------|----------------|--------|---------|
| Bundle size | ~3KB | 12KB | 44KB | 8KB |
| Server Actions | ✅ | ⚠️ Manual | ❌ | ✅ |
| Zero deps | ✅ | ✅ | ❌ | ✅ |
| Progressive enhancement | ✅ | ❌ | ❌ | ✅ |
| Built-in validator | ✅ | ❌ | ❌ | ❌ |
| TypeScript | ✅ | ✅ | ✅ | ✅ |

## Project Structure

```
suruy-form-actions/
├── src/
│   ├── index.ts          # Public API
│   ├── types.ts          # TypeScript types
│   ├── action.ts         # Form action creators
│   ├── hooks.ts          # React hooks
│   ├── validation.ts     # Built-in validator
│   └── *.test.ts         # Unit tests
├── dist/                 # Build output
├── .github/workflows/
│   ├── ci.yml            # Lint, test, build on push+PR
│   └── release.yml       # Publish to npm on git tag
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint
```

## License

MIT © yedoma-labs

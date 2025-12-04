# Types and Schemas Pattern Guide

This document defines the canonical pattern for organizing types and schemas in this codebase.

## 🏗️ Architecture Overview

```
prisma/schema.prisma          → Source of truth for data models
  ↓ (generates)
app/generated/prisma/          → Generated Prisma types (DO NOT EDIT)
  ↓ (extended by)
lib/{domain}/types.ts          → Domain-specific TypeScript types
lib/{domain}/schemas.ts        → Zod validation schemas
lib/{domain}/index.ts          → Barrel exports for clean imports
```

## 📁 File Organization

### Domain Structure
```
lib/
├── {domain}/               # One folder per domain concept
│   ├── types.ts           # All TypeScript types for this domain
│   ├── schemas.ts         # All Zod schemas for this domain
│   └── index.ts           # Barrel exports
├── shared/
│   ├── types.ts           # Cross-cutting types (ActionResult, etc.)
│   └── schemas.ts         # Shared validation schemas
└── actions/
    └── {domain}.ts        # Server actions (imports from lib/{domain})
```

### Component Structure
```
components/
├── {feature}/
│   ├── Component.tsx      # Component implementations
│   ├── types.ts           # Component-specific types (Props only)
│   └── index.ts           # Barrel exports
```

## 🎯 Naming Conventions

### 1. Prisma Types (Generated - DO NOT manually create)
- **Models**: `User`, `Application`, `Product` (PascalCase, singular)
- **Enums**: `ProductType`, `ApplicationStatus` (PascalCase)
- **Relations**: Exactly as defined in schema

**⚠️ Critical: Client Components & Prisma**

Prisma is a server-only package and **cannot be imported in client components**. This will cause build errors. For enums that need to be used in both server and client code, create client-safe mirrors:

```typescript
// ❌ DON'T: Import Prisma enum directly (breaks in client components)
import { ProductType } from "@/app/generated/prisma/client";

// ✅ DO: Define a client-safe mirror of the enum
export const ProductType = {
  SOLUBLE: "SOLUBLE",
  LIQUID: "LIQUID",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];
```

This pattern allows the same enum to be safely used in both:
- Server actions and API routes (server-side)
- React components with `"use client"` (client-side)

### 2. Domain Types (lib/{domain}/types.ts)

#### Base Types (from Prisma)
```typescript
// ❌ DON'T: Duplicate Prisma model types
export type Application = {
  id: string;
  name: string;
  // ...
};

// ✅ DO: Re-export Prisma types (type-only for models)
export type { Application, ApplicationArea } from "@/app/generated/prisma/client";

// ✅ DO: Create client-safe enum mirrors (value exports)
export const ApplicationStatus = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
```

#### Derived Types (Prisma extensions)
Use `Pick`, `Omit`, `&` to extend Prisma types:

```typescript
import type { Application, ApplicationArea } from "@/app/generated/prisma";

// List view (subset of fields)
export type ApplicationListItem = Pick<
  Application,
  "id" | "name" | "status" | "scheduledDate" | "completedDate" | "createdAt"
> & {
  totalAreaHa: number; // Computed field
};

// Detail view (with relations)
export type ApplicationWithRelations = Application & {
  areas: ApplicationArea[];
  products: ApplicationProductWithProduct[];
};
```

**Naming Pattern**: `{Entity}{Purpose}` or `{Entity}With{Relations}`
- `ApplicationListItem` - For list views
- `ApplicationDetail` - For detail views
- `ApplicationWithAreas` - Includes areas relation
- `ApplicationFormData` - For form submission

#### Form & Input Types
**Always** derive from Zod schemas using `z.infer<>`:

```typescript
import { applicationFormSchema } from "./schemas";
import type { z } from "zod";

// ✅ DO: Infer from schema (single source of truth)
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
export type ScheduleApplicationInput = z.infer<typeof scheduleApplicationSchema>;

// ❌ DON'T: Manually define (creates drift)
export type ApplicationFormInput = {
  name: string;
  // ...
};
```

**Naming Pattern**: `{Action}{Entity}Input`
- `CreateApplicationInput`
- `UpdateProductInput`
- `ScheduleApplicationInput`

#### Computed/Utility Types
```typescript
// Calculation results, metrics, etc.
export type SprayMetrics = {
  flowPerNozzleLMin: number;
  pressureStatus: "ok" | "low" | "high";
  // ...
};

// Literal unions
export type AreaType = "green" | "tee" | "fairway" | "rough" | "other";
```

### 3. Zod Schemas (lib/{domain}/schemas.ts)

**Naming Pattern**: `{purpose}{Entity}Schema` (camelCase)

```typescript
// ✅ Correct naming
export const createProductSchema = z.object({ ... });
export const updateApplicationSchema = z.object({ ... });
export const scheduleApplicationSchema = z.object({ ... });

// ❌ Incorrect
export const formSchema = z.object({ ... }); // Too generic
export const ProductSchema = z.object({ ... }); // PascalCase
```

**Always export inferred types**:
```typescript
export const createProductSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["SOLUBLE", "LIQUID"]),
});

// Export the inferred type
export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### 4. Component Props (components/{feature}/types.ts)

**Naming Pattern**: `{ComponentName}Props`

```typescript
// components/application-form/types.ts
export interface ApplicationFormProps {
  applicationId?: string;
  onSuccess?: (id: string) => void;
}

export interface AreaFieldArrayProps {
  // ...
}
```

**Rule**: Props types stay in component folders, NOT in `lib/`

### 5. Shared/Utility Types (lib/shared/types.ts)

```typescript
// Generic action result wrapper
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Pagination
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

## 🔧 Type vs Interface

**Use `type` for:**
- Unions: `type Status = "draft" | "scheduled" | "completed"`
- Intersections: `type Combined = BaseType & Extension`
- Utility types: `type Readonly<T> = { readonly [P in keyof T]: T[P] }`
- Aliases: `type ID = string`
- Zod inferences: `type Input = z.infer<typeof schema>`

**Use `interface` for:**
- Object shapes (especially component props)
- When you might extend later
- Public APIs

**Consistency rule**: Within a single file, be consistent. Prefer `type` unless you have a specific reason for `interface`.

## 📦 Exports Pattern

### Barrel Exports (lib/{domain}/index.ts)
```typescript
// lib/application/index.ts
export * from "./types";
export * from "./schemas";
export * from "./calculations";

// Named re-exports for clarity (optional)
export type {
  ApplicationFormInput,
  ApplicationListItem,
  ApplicationWithRelations,
} from "./types";

export {
  createApplicationSchema,
  updateApplicationSchema,
  scheduleApplicationSchema,
} from "./schemas";
```

### What NOT to export
- Internal helper types (prefix with `_` if needed)
- Component-specific props (keep in component files)
- Temporary/deprecated types

## 🚫 Anti-Patterns to Avoid

### ❌ DON'T: Duplicate Prisma Types
```typescript
// Bad - duplicates Prisma schema
export type Application = {
  id: string;
  name: string;
  status: ApplicationStatus;
  // ...
};
```

### ❌ DON'T: Define types separately from schemas
```typescript
// Bad - violates DRY
export type CreateProductInput = {
  name: string;
  type: ProductType;
};

export const createProductSchema = z.object({
  name: z.string(),
  type: z.enum(["SOLUBLE", "LIQUID"]),
});
```

### ❌ DON'T: Use generic names in domain files
```typescript
// Bad - what form?
export type FormValues = { ... };

// Good - specific
export type ApplicationFormInput = { ... };
```

### ❌ DON'T: Mix concerns in one file
```typescript
// Bad - mixing domains
// lib/types.ts
export type Application = { ... };
export type Product = { ... };
export type User = { ... };
```

### ❌ DON'T: Put domain types in action files
```typescript
// Bad - types defined in lib/actions/application.ts
type ApplicationListItem = { ... };

// Good - in lib/application/types.ts
export type ApplicationListItem = { ... };
```

## ✅ Complete Example: Application Domain

### lib/application/types.ts
```typescript
import type { Application, ApplicationArea, ApplicationStatus } from "@/app/generated/prisma";
import type { z } from "zod";
import { createApplicationSchema, scheduleApplicationSchema } from "./schemas";

// Re-export Prisma types
export type { Application, ApplicationArea, ApplicationStatus };

// Derived types
export type ApplicationListItem = Pick<
  Application,
  "id" | "name" | "status" | "scheduledDate" | "completedDate" | "createdAt"
> & {
  totalAreaHa: number;
};

export type ApplicationWithRelations = Application & {
  areas: ApplicationArea[];
  products: ApplicationProductWithProduct[];
};

// Form inputs (inferred from schemas)
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ScheduleApplicationInput = z.infer<typeof scheduleApplicationSchema>;

// Utility types
export type AreaType = "green" | "tee" | "fairway" | "rough" | "other";
export type SprayMetrics = {
  flowPerNozzleLMin: number;
  totalAreaHa: number;
  // ...
};
```

### lib/application/schemas.ts
```typescript
import { z } from "zod";

export const areaSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["green", "tee", "fairway", "rough", "other"]),
  sizeHa: z.coerce.number().positive(),
});

export const createApplicationSchema = z.object({
  name: z.string().min(1).max(100),
  nozzleId: z.string().min(1),
  areas: z.array(areaSchema).min(1),
  products: z.array(applicationProductSchema),
  // ...
});

export const scheduleApplicationSchema = z.object({
  scheduledDate: z.string().min(1),
});

// Export inferred types
export type AreaInput = z.infer<typeof areaSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ScheduleApplicationInput = z.infer<typeof scheduleApplicationSchema>;
```

### lib/application/index.ts
```typescript
export * from "./types";
export * from "./schemas";
export * from "./calculations";
```

### lib/actions/application.ts
```typescript
import { createApplicationSchema } from "@/lib/application/schemas";
import type { CreateApplicationInput, ApplicationListItem } from "@/lib/application/types";
import type { ActionResult } from "@/lib/shared/types";

export async function createApplication(
  data: CreateApplicationInput
): Promise<ActionResult<{ id: string }>> {
  // Implementation
}
```

## 🔄 Migration Checklist

When reorganizing types:

- [ ] Create `lib/shared/types.ts` for cross-cutting types
- [ ] Move ActionResult to shared types
- [ ] Remove duplicate enum definitions (use Prisma-generated)
- [ ] Rename generic types (FormValues → specific names)
- [ ] Ensure all schemas export inferred types
- [ ] Create barrel exports for each domain
- [ ] Update all imports to use barrel exports
- [ ] Remove types from action files (move to lib/)
- [ ] Consolidate auth schemas in lib/auth/schemas.ts
- [ ] Document any exceptions to these patterns

## 📚 Additional Resources

- [Prisma Client API](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Zod Schema Validation](https://zod.dev/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

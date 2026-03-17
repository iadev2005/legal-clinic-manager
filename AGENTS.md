# AGENTS.md — Legal Clinic Manager

> Configuration file for AI agents. Activated via `.gga` (Gentleman Guardian Angel).

## 1. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.4 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.1.18 |
| Database | PostgreSQL | — |
| Auth | JWT (jose) + bcryptjs | jose@6.1.3, bcryptjs@3.0.3 |
| Validation | Zod | 4.3.6 |
| Package Manager | pnpm | — |
| Linting | ESLint | 9.39.2 |

### Key Dependencies

- **UI Components**: Radix UI primitives (@radix-ui/react-*), Shadcn UI patterns
- **Charts**: Recharts 2.15.4
- **PDF Generation**: @react-pdf/renderer, jspdf, docx
- **Date Handling**: date-fns 4.1.0, react-day-picker
- **Icons**: lucide-react 0.561.0

---

## 2. Project Structure

```
src/
├── actions/           # Next.js Server Actions (mutations & queries)
│   ├── auth.ts        # Login, logout, session management
│   ├── casos.ts       # Case CRUD operations
│   ├── citas.ts       # Appointment CRUD
│   ├── solicitantes.ts # Applicant CRUD
│   ├── dashboard.ts   # Dashboard data
│   ├── statistics.ts  # Report data
│   └── ...
├── app/               # Next.js App Router pages
│   ├── login/        # Login page
│   ├── dashboard/    # Protected dashboard
│   ├── cases/        # Case management
│   ├── citations/    # Appointments
│   ├── applicants/   # Applicants/solicitantes
│   ├── administration/ # Admin panel
│   └── statistics/   # Reports
├── components/
│   ├── ui/           # Custom UI components
│   │   ├── case-*-modal.tsx
│   │   ├── applicant-*-modal.tsx
│   │   ├── *-chart.tsx
│   │   └── ...
│   └── shadcn/       # Shadcn UI base components
├── lib/
│   ├── repositories/ # Data access layer
│   │   ├── base.repository.ts  # Generic CRUD
│   │   ├── caso.repository.ts
│   │   ├── cita.repository.ts
│   │   ├── solicitante.repository.ts
│   │   └── usuario.repository.ts
│   ├── validation/   # Zod schemas
│   │   └── schemas/
│   ├── db.ts         # PostgreSQL connection (pg)
│   ├── auth-utils.ts # JWT utilities
│   ├── permissions.ts # RBAC rules
│   ├── utils.ts      # Shared utilities
│   └── errors/       # Custom error classes
├── hooks/            # React hooks
└── data/             # Static data
```

---

## 3. Commands

```bash
# Development
pnpm dev              # Start Next.js dev server

# Build
pnpm build            # Production build
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint

# Database (Drizzle ORM assumed)
pnpm db:generate      # Generate Drizzle client
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open DB studio
```

---

## 4. Code Style

### Functional Components
- Use **functional components** with TypeScript
- Use `'use client'` directive ONLY when hooks or browser APIs are needed

### Server Actions
- All mutations (create, update, delete) go in `src/actions/`
- Server Actions return typed results, not raw DB objects
- Use Zod schemas for input validation in actions

### Styling
- Tailwind CSS 4.x with `@tailwindcss/postcss`
- Use `cn()` utility from `lib/utils.ts` for class merging
- Follow Shadcn UI patterns for components

### Database
- **ALWAYS use parameterized queries** (`$1, $2, ...`)
- **NEVER concatenate user input into SQL strings**
- Use Repository Pattern: actions call repositories, repositories handle SQL

### Validation
- All inputs validated with **Zod schemas** in `src/lib/validation/schemas/`
- Use base schemas from `base.schema.ts` for common patterns

---

## 5. Boundaries

### NEVER
- ❌ Modify database schema manually (use migrations)
- ❌ Hardcode secrets in source code (use `.env`)
- ❌ Use `console.log` for production logging (use structured logger)
- ❌ Create new files outside `src/` without approval
- ❌ Bypass Zod validation in actions

### ALWAYS
- ✅ Use TypeScript types, avoid `any`
- ✅ Use Server Actions for mutations, not API routes
- ✅ Use parameterized queries in repositories
- ✅ Return proper error responses in actions
- ✅ Use Zod for input validation

### ASK FIRST
- 🔧 Changes to authentication logic (`src/actions/auth.ts`, `src/lib/auth-utils.ts`)
- 🔧 Changes to database schema or migrations
- 🔧 Changes to RBAC/permissions (`src/lib/permissions.ts`)
- 🔧 Adding new dependencies to `package.json`
- 🔧 Creating new pages/routes

---

## 6. Git Workflow

### Commit Messages
Use **Conventional Commits**:

```
feat: add case export to PDF
fix: resolve validation error in applicant modal
chore: update dependencies
refactor: simplify database query in caso.repository.ts
docs: update AGENTS.md with new boundaries
```

### PR Description
Include:
- Summary of changes
- Testing steps
- Screenshots (if UI changes)

### Branch Naming
```
feature/description
bugfix/description
refactor/description
```

---

## 7. Important Patterns

### Repository Pattern
```typescript
// All DB operations go through repositories
const caso = await CasoRepository.findById(id);
await CasoRepository.update(id, data);
```

### Server Action Pattern
```typescript
'use server'
import { z } from 'zod';
import { casoSchema } from '@/lib/validation/schemas/caso.schema';
import { CasoRepository } from '@/lib/repositories';

export async function createCaso(data: z.infer<typeof casoSchema>) {
  const validated = casoSchema.parse(data);
  return CasoRepository.create(validated);
}
```

### RBAC Permissions
- Check permissions in Server Actions using `permissions.ts`
- Roles: ADMIN, ABOGADO, SECRETARIO

---

*Last updated: 2026-03-17*

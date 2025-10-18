# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.2 frontend application for "Sistema de Ingresos Club La Victoria" - a member management system for a sports club. The application manages members (socios), seasons (temporadas), member-season associations, and entry statistics.

**Tech Stack:**
- Next.js 15.5.2 (App Router)
- TypeScript 5 (strict mode)
- React 19
- TanStack Query (React Query) for data fetching
- React Hook Form + Zod for form validation
- Tailwind CSS 4 + shadcn/ui components
- Axios with interceptors

## Development Commands

### Essential Commands
```bash
# Development server (bound to local network IP)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting (with TypeScript rules)
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### Important Notes
- Development server runs on `192.168.1.2:3000` (configured for local network access)
- Build enforces zero TypeScript and ESLint errors (`ignoreBuildErrors: false`)
- TypeScript is in strict mode

## Architecture Overview

### Directory Structure

```
app/
├── (auth)/          # Protected routes requiring authentication
│   ├── layout.tsx   # Auth layout with DashboardLayout
│   ├── socios/      # Member management pages
│   ├── temporadas/  # Season management pages
│   ├── socios-temporadas/  # Member-season associations
│   └── estadisticas/        # Statistics dashboard
└── (public)/        # Public routes (login)

components/
├── ui/              # shadcn/ui components (accordion, button, card, etc.)
├── auth/            # Auth-related (ProtectedRoute, PublicRoute)
├── association/     # Member-season association components
├── member-form.tsx  # Member CRUD form
├── season-form.tsx  # Season CRUD form
└── ...              # Other feature components

lib/
├── api/             # API client and endpoint definitions
├── errors/          # Centralized error handling system
├── schemas/         # Zod validation schemas
├── utils/           # Utility functions (date, token-storage)
├── types.ts         # TypeScript interfaces
├── constants.ts     # Enums and constants
└── routes.ts        # Route constants

hooks/
├── api/             # API hooks for data fetching
├── useAuth.ts       # Authentication hook
├── use-search.ts    # Search functionality
└── ...              # Other custom hooks

providers/
└── auth-provider.tsx  # TanStack Query provider setup
```

### Data Flow & State Management

1. **API Client** (`lib/api/client.ts`):
   - Axios instance with base URL from `NEXT_PUBLIC_API_URL`
   - Request interceptor: Automatically adds JWT token from localStorage
   - Response interceptor: Auto-logout on 401, redirects to `/login`
   - FormData handling: Automatically removes Content-Type header for multipart uploads

2. **Error Handling System** (`lib/errors/`):
   - **25 backend error codes** synchronized with backend (`error.types.ts`)
   - Centralized error messages in Spanish (`error-messages.ts`)
   - Type-safe error adapter: `adaptError(error)` converts Axios errors to UI-friendly format
   - React Query global error handler configured
   - See `lib/errors/README.md` for detailed usage

3. **Form Validation** (`lib/schemas/`):
   - All forms use React Hook Form + Zod resolvers
   - Schemas define TypeScript types automatically via `z.infer<>`
   - Key schemas:
     - `socio.schema.ts`: DNI, email, age validation, enums
     - `temporada.schema.ts`: Date ranges, cross-field validation

4. **Token Storage** (`lib/utils/token-storage.ts`):
   - SSR-safe abstraction over localStorage
   - Functions: `getToken()`, `setToken()`, `removeToken()`, `isAuthenticated()`, `clearAuthData()`
   - Never access localStorage directly - always use this module

5. **Date Utilities** (`lib/utils/date.ts`):
   - Timezone-aware date handling (America/Argentina/Buenos_Aires)
   - Functions: `formatDateLong()`, `formatDateShort()`, `formatDateNumeric()`, `formatDateRange()`
   - Date checks: `isDatePast()`, `isDateFuture()`, `isDateToday()`, `isDateRangeActive()`
   - Use `parseDateSafe()` for parsing dates with timezone handling

### Routing

- **App Router**: Next.js 15 App Router with route groups
- **Route Groups**:
  - `(auth)`: Protected routes with authentication check in layout
  - `(public)`: Public routes (login page)
- **Route Constants**: Always use `ROUTES` object from `lib/routes.ts` instead of hardcoded strings
  - Example: `ROUTES.MEMBERS.EDIT(id)` instead of `/socios/${id}/edit`

### Authentication Flow

1. User logs in at `/login` → sends credentials to backend
2. Backend returns JWT token
3. Frontend stores token via `setToken()` in token-storage
4. Protected routes check `isAuthenticated()` in `ProtectedRoute` component
5. API client automatically adds token to all requests
6. On 401 response → auto `clearAuthData()` and redirect to `/login`

### Form Handling Pattern

All forms follow this pattern:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { socioSchema } from "@/lib/schemas/socio.schema";
import { adaptError } from "@/lib/errors/error.adapter";

const form = useForm({
  resolver: zodResolver(socioSchema),
  defaultValues: {...}
});

const onSubmit = async (data) => {
  try {
    await createMutation.mutateAsync(data);
    toast.success("Success message");
  } catch (error) {
    const uiError = adaptError(error);
    toast.error(uiError.title, { description: uiError.message });
  }
};
```

### Component Patterns

- **UI Components**: Use shadcn/ui components from `components/ui/`
- **Styling**: Tailwind CSS with `cn()` utility from `lib/utils.ts`
- **Icons**: Lucide React icons
- **Toasts**: Sonner library via `toast.*()` from `sonner`
- **Forms**: React Hook Form + Zod + shadcn Form components
- **Data Fetching**: TanStack Query with custom hooks in `hooks/api/`

## Configuration Files

- **TypeScript**: `tsconfig.json` - Strict mode enabled, `@/*` path alias
- **ESLint**: `.eslintrc.json` - Next.js + TypeScript rules, warnings for `any`, unused vars
- **Prettier**: `.prettierrc` - Code formatting
- **Next.js**: `next.config.mjs` - Security headers, image optimization, no build error ignoring
- **Environment**: `.env-example` - Copy to `.env` and set `NEXT_PUBLIC_API_URL`

## Key Conventions

### Import Paths
- Always use `@/` alias, never relative paths in lib/, components/, hooks/
- Example: `import { apiClient } from "@/lib/api/client"` ✅
- Not: `import { apiClient } from "../../lib/api/client"` ❌

### Error Handling
- Always use `adaptError()` to convert errors to UI format
- Log errors in development with `logError(error, context)`
- Show user-friendly Spanish messages from `error-messages.ts`
- For field-specific errors, use `form.setError()` with React Hook Form

### Type Safety
- TypeScript strict mode is enforced
- Avoid `any` types (ESLint warning)
- Minimize non-null assertions `!` (ESLint warning)
- Infer types from Zod schemas: `type SocioFormData = z.infer<typeof socioSchema>`

### Security
- Security headers configured in `next.config.mjs` (X-Frame-Options, CSP, etc.)
- JWT tokens stored in localStorage (SSR-safe via token-storage utility)
- 401 responses trigger automatic logout
- Never commit `.env` file

### Code Quality
- ESLint warnings are acceptable but should be minimized
- Run `npm run lint:fix` before committing
- Run `npm run format` to auto-format code
- Build must pass with zero errors

## Common Tasks

### Adding a New Form Field
1. Update Zod schema in `lib/schemas/`
2. TypeScript types auto-update via `z.infer<>`
3. Add field to form component using shadcn Form components
4. Validation happens automatically

### Adding a New API Endpoint
1. Add types to `lib/types.ts` if needed
2. Create API function in `lib/api/` or add to existing file
3. Create React Query hook in `hooks/api/`
4. Use hook in component with error handling via `adaptError()`

### Adding a New Error Code
1. Update backend first: `backend/src/constants/errors/error-messages.ts`
2. Add to `BackendErrorCode` enum in `lib/errors/error.types.ts`
3. Add Spanish message in `lib/errors/error-messages.ts`

### Working with Images
- Prefer `next/image` component over `<img>` (ESLint warning)
- Remote images require domain in `next.config.mjs` `remotePatterns`
- Photo upload uses FormData with `react-easy-crop` for cropping

## Dependencies

See `dependencies.md` for detailed documentation of all 59 dependencies.

### Key Dependencies
- **Data Fetching**: `@tanstack/react-query`, `axios`
- **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **UI**: `@radix-ui/*` (16 packages), `tailwind-merge`, `class-variance-authority`
- **Utilities**: `date-fns`, `jwt-decode`, `lucide-react`, `sonner`

### Removed Dependencies
The following were removed during audit (see `PRODUCTION_AUDIT_REPORT.md`):
- `@types/lodash`, `@vercel/analytics`, `debounce`, `tailwindcss-animate`, `autoprefixer`

## Production Checklist

The application is production-ready (see `PRODUCTION_AUDIT_REPORT.md`):
- ✅ Build successful (0 errors)
- ✅ TypeScript strict mode
- ✅ 25 error codes synchronized with backend
- ✅ All forms use Zod validation
- ✅ 0 code duplication
- ✅ Security headers configured
- ✅ 0 npm vulnerabilities
- ⚠️ 44 ESLint warnings (non-blocking)

### Known Warnings to Address
- 4 instances of `<img>` should migrate to `next/image`
- 5 instances of explicit `any` types
- 6 non-null assertions should use optional chaining
- 12 unused variables

## Backend Integration

Backend repository: `club-la-victoria-backend/`

**API Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- Development default: `http://192.168.1.2:3000/api`
- Production: Set in `.env`

**Error Codes**: Must stay synchronized with `backend/src/constants/errors/error-messages.ts`

## Resources

- **Error Handling Docs**: `lib/errors/README.md`
- **Dependencies Docs**: `dependencies.md`
- **Production Audit**: `PRODUCTION_AUDIT_REPORT.md`
- **Next.js Docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com

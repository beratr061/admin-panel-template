# Design Document: Admin Panel Template

## Overview

Bu doküman, tekrar kullanılabilir bir Full-Stack Admin Panel Template'inin teknik tasarımını tanımlar. Proje, monorepo yapısında organize edilmiş olup Frontend (Next.js 14+ App Router), Backend (NestJS), ve PostgreSQL veritabanından oluşmaktadır.

### Teknoloji Stack'i

**Frontend (client/):**
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS + Shadcn/UI
- TanStack Query (React Query)
- Axios (HTTP client)
- Zod (validation)
- Framer Motion (animations)
- next-intl (i18n)
- Recharts (charts)
- Tiptap (rich text editor)

**Backend (server/):**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Passport.js + JWT
- Class-Validator
- Swagger/OpenAPI
- Helmet, CORS, Throttler

**Shared (shared/):**
- TypeScript types/interfaces
- DTOs
- Constants

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│                    admin.example.com / api.example.com           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Frontend Container    │     │   Backend Container     │
│      (Next.js)          │────▶│      (NestJS)           │
│   Port: 3000            │     │   Port: 4000            │
└─────────────────────────┘     └─────────────────────────┘
                                          │
                                          ▼
                              ┌─────────────────────────┐
                              │   PostgreSQL Container  │
                              │      Port: 5432         │
                              └─────────────────────────┘
```

### Monorepo Yapısı

**NPM Workspaces Konfigürasyonu:**

Monorepo yapısında `shared` klasörünün hem `client` hem `server` tarafından kullanılabilmesi için NPM Workspaces kullanılacaktır. Bu, Docker build sırasında path sorunlarını önler.

```json
// package.json (root)
{
  "name": "admin-panel-template",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "shared"
  ],
  "scripts": {
    "dev:client": "npm run dev -w client",
    "dev:server": "npm run dev -w server",
    "build:client": "npm run build -w client",
    "build:server": "npm run build -w server",
    "lint": "npm run lint -w client && npm run lint -w server"
  }
}
```

```json
// shared/package.json
{
  "name": "@admin-panel/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

**Docker Build Stratejisi:**

Docker build işlemi root dizinden çalıştırılacak ve tüm workspace'lere erişim sağlanacaktır:

```dockerfile
# docker/Dockerfile.client
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=client --workspace=shared

# Copy source
COPY shared ./shared
COPY client ./client

# Build shared first, then client
RUN npm run build -w shared
RUN npm run build -w client

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/client/.next/standalone ./
COPY --from=builder /app/client/.next/static ./client/.next/static
COPY --from=builder /app/client/public ./client/public

EXPOSE 3000
CMD ["node", "client/server.js"]
```

```
project/
├── client/                    # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── (auth)/            # Auth layout group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── layout.tsx     # Sidebar + Header layout
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   └── settings/
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   ├── data-table/        # Data table components
│   │   └── dashboard/         # Dashboard widgets
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities
│   ├── providers/             # Context providers
│   ├── services/              # API services
│   ├── stores/                # State management
│   ├── styles/                # Global styles
│   └── locales/               # i18n translations
│
├── server/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Auth module
│   │   ├── users/             # Users module
│   │   ├── roles/             # Roles module
│   │   ├── permissions/       # Permissions module
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── filters/
│   │   └── prisma/            # Prisma module
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.ts
│       └── migrations/
│
├── shared/                    # Shared types
│   ├── types/
│   ├── dtos/
│   └── constants/
│
├── docker/
│   ├── nginx/
│   │   └── nginx.conf
│   ├── Dockerfile.client
│   └── Dockerfile.server
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Components and Interfaces

### Frontend Components

#### Layout Components

```typescript
// components/layout/Sidebar.tsx
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  permission?: string;
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}
```

```typescript
// components/layout/Header.tsx
interface HeaderProps {
  onMenuClick: () => void;
  user: User | null;
}
```

```typescript
// components/layout/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

#### Data Table Components

```typescript
// components/data-table/DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: PaginationState;
  sorting: SortingState;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  isLoading?: boolean;
  totalCount: number;
  pageSize?: number;
  pageSizeOptions?: number[];
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface SortingState {
  id: string;
  desc: boolean;
}[]
```

```typescript
// components/data-table/DataTableToolbar.tsx
interface DataTableToolbarProps {
  filters: FilterConfig[];
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: 'csv' | 'excel') => void;
  selectedCount: number;
  bulkActions?: BulkAction[];
}

interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date-range';
  options?: { label: string; value: string }[];
}

interface BulkAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => void;
}
```

#### Form Components

```typescript
// components/forms/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Zod Schema
const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
});
```

```typescript
// components/forms/FileUpload.tsx
interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onProgress?: (progress: number) => void;
  preview?: boolean;
}
```

#### Dashboard Components

```typescript
// components/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}
```

```typescript
// components/dashboard/ActivityFeed.tsx
interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}
```

### Authorization Components

```typescript
// components/auth/Can.tsx
interface CanProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Usage: <Can permission="users.create"><CreateButton /></Can>
```

```typescript
// hooks/usePermission.ts
interface UsePermissionReturn {
  can: (permission: string | string[]) => boolean;
  permissions: string[];
  isLoading: boolean;
}

// Usage: const { can } = usePermission();
//        if (can('users.delete')) { ... }
```

### Backend Interfaces

#### Auth Module

```typescript
// server/src/auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class TokenResponseDto {
  accessToken: string;
  expiresIn: number;
}
```

```typescript
// server/src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;        // user id
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}
```

#### Permission System

```typescript
// server/src/permissions/decorators/permissions.decorator.ts
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Usage: @Permissions('users.create', 'users.update')
```

```typescript
// server/src/permissions/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    if (!requiredPermissions) return true;
    
    const { user } = context.switchToHttp().getRequest();
    
    // SUPER_ADMIN bypass
    if (user.roles.includes('SUPER_ADMIN')) return true;
    
    return requiredPermissions.every(
      permission => user.permissions.includes(permission)
    );
  }
}
```

## Data Models

### Prisma Schema

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  roles         UserRole[]
  refreshTokens RefreshToken[]
  activities    Activity[]
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(false)  // SUPER_ADMIN, VIEWER etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       UserRole[]
  permissions RolePermission[]
}

model Permission {
  id          String   @id @default(cuid())
  resource    String   // users, roles, dashboard
  action      String   // create, read, update, delete
  description String?
  
  roles       RolePermission[]
  
  @@unique([resource, action])
}

model UserRole {
  userId    String
  roleId    String
  assignedAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String
  
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@id([roleId, permissionId])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Activity {
  id        String   @id @default(cuid())
  userId    String
  action    String
  target    String
  metadata  Json?
  createdAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Shared Types

```typescript
// shared/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}
```

```typescript
// shared/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Theme Toggle Changes Theme
*For any* theme toggle action, the current theme should switch between 'light' and 'dark' modes.
**Validates: Requirements 2.1**

### Property 2: Theme Persists Across Sessions
*For any* theme selection, after page reload, the same theme should be active (round-trip persistence).
**Validates: Requirements 2.4**

### Property 3: Responsive Layout Adapts to Viewport
*For any* viewport width, the layout should adapt appropriately: mobile (<768px) shows drawer, tablet (768-1024px) shows collapsed sidebar, desktop (>1024px) shows full sidebar.
**Validates: Requirements 2.6**

### Property 4: Keyboard Navigation Works for Interactive Elements
*For any* interactive element (button, input, dropdown), Tab key navigation should be functional and focus should be visible.
**Validates: Requirements 2.9**

### Property 5: Sidebar Collapse Toggle Works
*For any* sidebar toggle action, the sidebar should switch between collapsed (icon-only) and expanded (full-width) states.
**Validates: Requirements 3.1**

### Property 6: Sidebar State Persists
*For any* sidebar collapse/expand action, after page reload, the same state should be preserved.
**Validates: Requirements 3.2**

### Property 7: Breadcrumb Reflects Current Path
*For any* page navigation, the breadcrumb should accurately reflect the current route hierarchy.
**Validates: Requirements 3.8**

### Property 8: Active Navigation Link Highlighted
*For any* current route, the corresponding sidebar navigation item should have a distinct highlighted style.
**Validates: Requirements 3.9**

### Property 9: Data Table Pagination Loads Correct Subset
*For any* page change in data table, the displayed data should be the correct subset based on page index and page size.
**Validates: Requirements 4.1**

### Property 10: Data Table Sorting Works
*For any* sortable column click, the data should be sorted by that column in the toggled direction (asc/desc).
**Validates: Requirements 4.2**

### Property 11: Data Table Filtering Returns Matching Results
*For any* filter criteria applied, all displayed rows should match the filter conditions.
**Validates: Requirements 4.3**

### Property 12: Row Selection Updates State
*For any* row checkbox toggle, the selection state should be updated correctly (selected/deselected).
**Validates: Requirements 4.4**

### Property 13: Bulk Actions Appear When Rows Selected
*For any* non-empty row selection, bulk action buttons should be visible; for empty selection, they should be hidden.
**Validates: Requirements 4.5**

### Property 14: Column Visibility Toggle Works
*For any* column visibility toggle, the column should be shown or hidden accordingly.
**Validates: Requirements 4.6**

### Property 15: Export Produces Valid File
*For any* export action (CSV/Excel), the generated file should contain all visible data with correct headers.
**Validates: Requirements 4.7**

### Property 16: Table/Chart View Toggle Works
*For any* view toggle action, the display should switch between table and chart representations of the same data.
**Validates: Requirements 4.10**

### Property 17: Zod Validation Returns Errors for Invalid Input
*For any* form input that violates Zod schema rules, a validation error should be returned with appropriate message.
**Validates: Requirements 5.1**

### Property 18: Combobox Filters Options on Search
*For any* search term entered in combobox, only options containing the search term should be displayed.
**Validates: Requirements 5.3**

### Property 19: Inline Validation Errors Appear Next to Fields
*For any* field with validation error, the error message should be displayed adjacent to that field.
**Validates: Requirements 5.9**

### Property 20: Dashboard Widgets Responsive
*For any* viewport size, dashboard widgets should adapt their layout (grid columns) appropriately.
**Validates: Requirements 6.4**

### Property 21: Toast Notifications Appear on Trigger
*For any* toast trigger (success, error, warning, info), a notification should appear in the top-right corner.
**Validates: Requirements 7.1**

### Property 22: Login Form Validation Works
*For any* invalid login input (empty email, invalid email format, short password), appropriate validation error should be shown.
**Validates: Requirements 8.2**

### Property 23: JWT Tokens Issued on Valid Login
*For any* valid login credentials, the backend should issue both access token and refresh token.
**Validates: Requirements 8.5**

### Property 24: Token Auto-Refresh on Expiry
*For any* expired access token with valid refresh token, the system should automatically obtain a new access token.
**Validates: Requirements 8.9**

### Property 25: Protected Endpoints Return 403 Without Permission
*For any* protected API endpoint, requests without required permissions should receive 403 Forbidden response.
**Validates: Requirements 8.7, 16.6, 20.3, 20.4, 22.3**

### Property 26: Protected Routes Redirect Unauthenticated Users
*For any* protected frontend route, unauthenticated access should redirect to login page.
**Validates: Requirements 8.8, 19.2**

### Property 27: DTO Validation Rejects Invalid Payloads
*For any* API request with invalid payload (missing required fields, wrong types), validation should fail with descriptive error.
**Validates: Requirements 14.2**

### Property 28: Rate Limiting Triggers on Excessive Requests
*For any* IP address exceeding rate limit threshold, subsequent requests should receive 429 Too Many Requests.
**Validates: Requirements 14.3**

### Property 29: Language Preference Persists
*For any* language selection, after page reload, the same language should be active.
**Validates: Requirements 11.5**

### Property 30: SUPER_ADMIN Can CRUD Roles
*For any* role create/update/delete operation by SUPER_ADMIN user, the operation should succeed.
**Validates: Requirements 16.2**

### Property 31: SUPER_ADMIN Bypasses Permission Checks
*For any* protected endpoint accessed by SUPER_ADMIN user, access should be granted regardless of specific permissions.
**Validates: Requirements 16.7**

### Property 32: Role-Permission Mappings Persist
*For any* role-permission assignment, after save, the mapping should be retrievable from database.
**Validates: Requirements 17.5**

### Property 33: Role Deletion Handles Affected Users
*For any* role deletion, users with that role should either have the role removed or be assigned default role, without breaking.
**Validates: Requirements 17.6**

### Property 34: Effective Permissions Calculated from Roles
*For any* user with assigned roles, effective permissions should be the union of all permissions from all assigned roles.
**Validates: Requirements 18.2, 18.3**

### Property 35: UI Elements Visibility Matches Permissions
*For any* permission-gated UI element, visibility should match whether user has the required permission.
**Validates: Requirements 19.1, 19.3**

### Property 36: No Redundant Permission API Calls
*For any* navigation within the app, permission data should be fetched at most once per session (cached).
**Validates: Requirements 21.3**

### Property 37: Permission Updates Reflect on Next Request
*For any* permission change (role assignment/removal), the updated permissions should be effective on the next authenticated request.
**Validates: Requirements 21.4**

## Error Handling

### Frontend API Client with Token Refresh

```typescript
// lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// In-memory token storage (more secure than localStorage for access tokens)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Required for HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add access token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Token expired, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token is sent automatically via HttpOnly cookie
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmamaktadır.');
    }
    
    // Handle 429 - Rate limit
    if (error.response?.status === 429) {
      toast.error('Çok fazla istek gönderdiniz. Lütfen bekleyin.');
    }
    
    // Handle 500 - Server error
    if (error.response?.status && error.response.status >= 500) {
      toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Backend Error Handling

```typescript
// server/src/common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message;
    }
    
    // Log error for monitoring
    this.logger.error(exception);
    
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Validation Error Response Format

```typescript
// Standard validation error response
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be at least 6 characters"
  ],
  "error": "Bad Request"
}
```

## Testing Strategy

### Dual Testing Approach

Bu projede hem unit testler hem de property-based testler kullanılacaktır:

- **Unit Tests**: Spesifik örnekler, edge case'ler ve hata durumları için
- **Property Tests**: Evrensel özelliklerin tüm girdilerde doğrulanması için

### Testing Libraries

**Frontend:**
- Vitest (test runner)
- React Testing Library (component testing)
- fast-check (property-based testing)
- MSW (API mocking)

**Backend:**
- Jest (test runner)
- Supertest (API testing)
- fast-check (property-based testing)

### Property Test Configuration

Her property testi minimum 100 iterasyon ile çalıştırılacaktır:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // fast-check default iterations
    fuzz: {
      numRuns: 100,
    },
  },
});
```

### Test Annotation Format

Her property testi, design dokümanındaki property'ye referans verecektir:

```typescript
// Example property test
describe('Theme System', () => {
  it('Property 2: Theme persists across sessions', () => {
    // Feature: admin-panel-template, Property 2: Theme Persists Across Sessions
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'dark'),
        (theme) => {
          localStorage.setItem('theme', theme);
          // Simulate page reload
          const storedTheme = localStorage.getItem('theme');
          expect(storedTheme).toBe(theme);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Categories

1. **Component Unit Tests**: UI bileşenlerinin render ve interaction testleri
2. **Hook Unit Tests**: Custom hook'ların davranış testleri
3. **API Unit Tests**: Backend endpoint'lerinin unit testleri
4. **Integration Tests**: Frontend-Backend entegrasyon testleri
5. **Property Tests**: Evrensel özelliklerin property-based testleri

### Coverage Targets

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Environment Variables

### Required Environment Variables

Tüm environment variable'lar `.env.example` dosyasında belgelenmeli ve production'da güvenli şekilde yönetilmelidir.

**Server (.env):**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/admin_panel?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Security
CORS_ORIGIN="http://localhost:3000"
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Server
PORT=4000
NODE_ENV="development"
```

**Client (.env.local):**

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# App Configuration
NEXT_PUBLIC_APP_NAME="Admin Panel"
NEXT_PUBLIC_DEFAULT_LOCALE="tr"
```

**Docker Compose (.env):**

```bash
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=admin_panel

# Ports
CLIENT_PORT=3000
SERVER_PORT=4000
DB_PORT=5432
```

### Security Notes

1. **JWT_SECRET ve JWT_REFRESH_SECRET** farklı olmalıdır
2. **JWT_REFRESH_SECRET** daha uzun ömürlü token'lar için kullanıldığından daha güçlü olmalıdır
3. **CORS_ORIGIN** production'da sadece frontend domain'ini içermelidir
4. Tüm secret'lar production'da environment variable olarak inject edilmeli, asla kod içinde hardcode edilmemelidir
5. `.env` dosyaları `.gitignore`'a eklenmelidir


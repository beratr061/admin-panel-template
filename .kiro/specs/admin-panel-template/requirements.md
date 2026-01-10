# Requirements Document

## Introduction

Bu doküman, tekrar kullanılabilir bir Full-Stack Admin Panel Template'i için gereksinimleri tanımlar. Amaç, her yeni projede sıfırdan admin paneli yazmak yerine, hazır bir temel üzerinden hızlıca geliştirme yapabilmektir. Template; Frontend için Next.js App Router, Backend için NestJS, veritabanı için PostgreSQL + Prisma ORM kullanır. Güçlü veri tabloları, form yönetimi, tema desteği, JWT tabanlı kimlik doğrulama ve rol bazlı yetkilendirme gibi temel özellikleri içerecektir. Proje monorepo yapısında `client` ve `server` klasörleri altında organize edilecektir.

## Glossary

- **Admin_Panel**: Yönetim arayüzü uygulaması
- **Sidebar**: Sol taraftaki navigasyon menüsü
- **Header**: Üst kısımdaki sabit bar
- **Data_Table**: Sayfalama, sıralama, filtreleme destekli veri tablosu bileşeni
- **Theme_System**: Açık/koyu mod ve renk paleti yönetim sistemi
- **Toast**: Kısa süreli bildirim mesajları
- **RBAC**: Role Based Access Control - Rol tabanlı erişim kontrolü
- **Skeleton_Loader**: Veri yüklenirken gösterilen iskelet animasyonu
- **Breadcrumb**: Sayfa hiyerarşisini gösteren navigasyon yolu
- **i18n**: Internationalization - Çoklu dil desteği sistemi
- **a11y**: Accessibility - Erişilebilirlik standartları
- **Backend**: NestJS tabanlı API sunucusu
- **JWT**: JSON Web Token - Kimlik doğrulama tokenı
- **DTO**: Data Transfer Object - Veri transfer nesnesi
- **ORM**: Object-Relational Mapping - Veritabanı soyutlama katmanı
- **Permission**: Belirli bir kaynak üzerinde belirli bir işlem yapma yetkisi (örn: users.create)
- **Role**: Bir veya daha fazla permission içeren yetki grubu
- **SUPER_ADMIN**: Tüm kaynaklara sınırsız erişimi olan en üst düzey rol

## Requirements

### Requirement 1: Çekirdek Yapı ve Proje Kurulumu

**User Story:** As a developer, I want a well-structured Next.js project with TypeScript and modern tooling, so that I can start building features immediately without setup overhead.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use Next.js App Router with the `app` directory structure
2. THE Admin_Panel SHALL have full TypeScript support with strict type checking enabled
3. THE Admin_Panel SHALL support absolute imports using `@/` prefix for clean import paths
4. WHEN an unhandled error occurs, THE Admin_Panel SHALL display a custom `error.tsx` page
5. WHEN a route is not found, THE Admin_Panel SHALL display a custom `not-found.tsx` page
6. THE Admin_Panel SHALL support dynamic metadata for SEO (page titles and descriptions)

### Requirement 2: Tema ve Tasarım Sistemi

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the panel comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_System SHALL support dark and light mode switching
2. WHEN the user has not set a preference, THE Theme_System SHALL use the system's color scheme preference
3. THE Theme_System SHALL provide a manual toggle button for theme switching
4. THE Theme_System SHALL persist the user's theme preference across sessions
5. THE Admin_Panel SHALL use CSS variables for the color palette, allowing easy customization from a single file
6. THE Admin_Panel SHALL be fully responsive, adapting to mobile, tablet, and desktop screen sizes
7. THE Admin_Panel SHALL use only solid (non-gradient) colors throughout the interface
8. THE Admin_Panel SHALL use Lucide React icons specifically designed for Shadcn/UI integration to ensure consistency and lightweight bundle size
9. Interactive elements (buttons, inputs, dropdowns) SHALL be accessible via keyboard navigation (Tab functionality) and comply with WCAG 2.1 AA standards

### Requirement 3: Layout ve Navigasyon

**User Story:** As a user, I want intuitive navigation with a collapsible sidebar, so that I can easily access different sections of the admin panel.

#### Acceptance Criteria

1. THE Sidebar SHALL be collapsible, switching between full-width and icon-only modes
2. THE Sidebar SHALL persist its collapsed/expanded state across sessions
3. THE Sidebar SHALL be positioned on the left side with a dark background color
4. THE Sidebar SHALL display the application logo/brand at the top
5. THE Sidebar SHALL organize navigation items into logical groups with section headers
6. THE Header SHALL remain sticky at the top of the viewport during scrolling
7. THE Header SHALL include a search bar, notification icon, and user profile dropdown
8. THE Admin_Panel SHALL display Breadcrumb navigation showing the current page hierarchy
9. WHEN a navigation link corresponds to the current page, THE Sidebar SHALL highlight that link with a distinct visual style (accent color background)
10. WHEN the viewport is mobile-sized, THE Sidebar SHALL transform into a slide-out drawer accessible via a hamburger menu button
11. THE Admin_Panel SHALL include smooth page transition animations
12. THE main content area SHALL have a light/neutral background to contrast with the dark sidebar

### Requirement 4: Veri Tabloları

**User Story:** As a user, I want powerful data tables with pagination, sorting, and filtering, so that I can efficiently manage large datasets.

#### Acceptance Criteria

1. THE Data_Table SHALL support server-side pagination with configurable page sizes (10, 20, 50 items)
2. WHEN a column header is clicked, THE Data_Table SHALL sort the data by that column in ascending or descending order
3. THE Data_Table SHALL support filtering by text search, date range, and category selection
4. THE Data_Table SHALL support row selection via checkboxes for single and multiple rows
5. WHEN rows are selected, THE Data_Table SHALL display bulk action buttons (delete, deactivate, etc.)
6. THE Data_Table SHALL allow users to show/hide columns via a column visibility toggle
7. THE Data_Table SHALL provide client-side export to CSV/Excel functionality preventing unnecessary server load for small datasets
8. WHILE data is loading, THE Data_Table SHALL display a Skeleton_Loader animation
9. THE Data_Table SHALL support inline mini-charts (sparklines) within table cells for visualizing trends
10. THE Data_Table SHALL provide an option to toggle between table view and chart view for data visualization

### Requirement 5: Form Elemanları ve Validasyon

**User Story:** As a user, I want validated form inputs with helpful error messages, so that I can enter data correctly and efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use Zod schemas for form validation with clear error messages
2. THE Admin_Panel SHALL provide a Date Picker component with date range selection support
3. THE Admin_Panel SHALL provide a searchable Select/Combobox component
4. THE Admin_Panel SHALL provide Switch/Toggle button components
5. THE Admin_Panel SHALL integrate a lightweight Tiptap-based Rich Text Editor tailored for React
6. THE Admin_Panel SHALL provide a File Upload component with drag-and-drop support
7. WHEN a file is being uploaded, THE File Upload component SHALL display a progress bar
8. WHEN a file upload completes, THE File Upload component SHALL show a preview of the uploaded file
9. WHEN form validation fails, THE Admin_Panel SHALL display inline error messages next to the relevant fields

### Requirement 6: Dashboard Widget'ları

**User Story:** As a user, I want a dashboard with statistics cards and charts, so that I can quickly understand key metrics at a glance.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide statistic card components displaying metrics with trend indicators (increase/decrease percentages)
2. THE Admin_Panel SHALL provide chart components including Line, Bar, and Pie/Donut charts using Recharts library
3. THE Admin_Panel SHALL provide an activity feed component showing recent actions/events
4. THE Dashboard widgets SHALL be responsive and adapt to different screen sizes

### Requirement 7: Bildirimler ve Geri Bildirim

**User Story:** As a user, I want clear feedback through notifications and confirmations, so that I know when actions succeed or fail.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display Toast notifications for success, error, warning, and info messages
2. THE Toast notifications SHALL appear in the top-right corner and auto-dismiss after a configurable duration
3. THE Admin_Panel SHALL provide confirmation modal dialogs for destructive actions (e.g., "Are you sure you want to delete?")
4. THE Admin_Panel SHALL provide Tooltip components that display helpful text on hover

### Requirement 8: Kimlik Doğrulama ve Yetkilendirme

**User Story:** As a developer, I want a secure, token-based authentication system managed by the backend, so that user sessions are handled safely across services.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a reusable Login Form component (not a full page layout) that can be easily customized per project
2. THE Login Form SHALL include email/username and password fields with client-side validation
3. THE Admin_Panel SHALL provide a reusable Register Form component with email, password, and password confirmation fields
4. THE Admin_Panel SHALL provide a reusable Forgot Password Form component
5. THE Backend SHALL handle authentication logic and issue JWT Access Tokens and Refresh Tokens
6. THE Frontend SHALL store the Access Token in memory and the Refresh Token in a secure HttpOnly Cookie
7. THE Backend SHALL implement Role Based Access Control (RBAC) Guards to protect endpoints (e.g., `@Roles('ADMIN')`)
8. THE Frontend SHALL use Middleware to protect routes by checking the validity of the session via the Backend API
9. WHEN the Access Token expires, THE Frontend (Axios Interceptor) SHALL automatically attempt to refresh it using the Refresh Token
10. THE Admin_Panel SHALL provide a User Profile page where users can update their information and change their password

### Requirement 9: Veritabanı ve ORM (Backend)

**User Story:** As a developer, I want a robust relational database managed by the backend service, so that data integrity is maintained centrally.

#### Acceptance Criteria

1. THE Backend SHALL use PostgreSQL as the primary relational database
2. THE Backend SHALL use Prisma ORM for database modeling, migrations, and type-safe queries
3. THE Backend SHALL include a seeding script (NestJS Command or Prisma Seed) to populate the database with initial admin users and test data
4. THE Database connection string SHALL be configured via environment variables and NOT hardcoded

### Requirement 10: Loading States ve Animasyonlar

**User Story:** As a user, I want smooth loading states and animations, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHILE data is being fetched, THE Admin_Panel SHALL display Skeleton_Loader components
2. THE Admin_Panel SHALL include micro-animations for button hover effects, modal transitions, and page changes
3. THE Admin_Panel SHALL use Framer Motion or Tailwind Animate for animation implementation
4. THE loading states SHALL not block user interaction with other parts of the interface

### Requirement 11: Çoklu Dil Desteği (i18n)

**User Story:** As a developer, I want built-in internationalization support, so that I can easily translate the admin panel into different languages.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use next-intl library for internationalization support
2. THE Admin_Panel SHALL store translations in separate JSON files under a `locales` directory
3. THE Admin_Panel SHALL detect the user's browser language automatically and apply it as default
4. THE Admin_Panel SHALL provide a language switcher component in the header
5. THE Admin_Panel SHALL persist the user's language preference across sessions

### Requirement 12: Kod Kalitesi ve Geliştirici Deneyimi

**User Story:** As a developer, I want automated linting and formatting tools, so that the code style remains consistent across different projects.

#### Acceptance Criteria

1. THE Project SHALL include configured ESLint rules for code quality enforcement
2. THE Project SHALL include configured Prettier rules for consistent code formatting
3. THE Project SHALL include Husky setup to run lint and format checks before commits (pre-commit hooks)
4. THE Project SHALL use Barrel Exports (index.ts files) for cleaner folder imports
5. THE Project SHALL include a well-documented README with setup instructions

### Requirement 13: Dağıtım ve DevOps

**User Story:** As a developer, I want a multi-container Docker setup, so that I can deploy the Frontend and Backend services securely on a VPS.

#### Acceptance Criteria

1. THE Project SHALL adhere to a Monorepo structure with separate folders for `client` (Next.js) and `server` (NestJS)
2. THE Project SHALL include a `docker-compose.yml` that orchestrates the Frontend, Backend, and PostgreSQL database containers
3. THE Frontend container SHALL communicate with the Backend container via the internal Docker network (or defined API URL)
4. THE Project SHALL include Nginx configuration examples for reverse proxying subdomains (e.g., `api.example.com` and `admin.example.com`)
5. THE Project SHALL include environment variable examples in a `.env.example` file

### Requirement 14: Backend Mimarisi ve Güvenlik (NestJS)

**User Story:** As a developer, I want a secure and structured backend API, so that the application is protected against common web vulnerabilities and remains maintainable.

#### Acceptance Criteria

1. THE Backend SHALL be built using NestJS framework to enforce strict architectural patterns (Modules, Controllers, Services)
2. THE Backend SHALL use Class-Validator and DTOs (Data Transfer Objects) to validate all incoming API requests strictly
3. THE Backend SHALL implement Rate Limiting (Throttling) to protect the API against brute-force and DDoS attacks
4. THE Backend SHALL use Helmet middleware to automatically set secure HTTP headers (XSS Filter, HSTS, etc.)
5. THE Backend SHALL use HttpOnly Cookies to store JWT tokens for authentication, preventing XSS token theft
6. THE Backend SHALL implement CORS policies to allow requests ONLY from the frontend domain
7. THE Backend SHALL generate Swagger (OpenAPI) documentation automatically for all endpoints

### Requirement 15: Frontend-Backend İletişimi ve Veri Yönetimi

**User Story:** As a developer, I want a robust data fetching layer, so that the frontend handles server state efficiently without prop drilling or stale data.

#### Acceptance Criteria

1. THE Frontend SHALL use a configured Axios instance (with interceptors) to handle API requests and global error management
2. THE Frontend SHALL use TanStack Query (React Query) for caching, synchronizing, and updating server state
3. THE Frontend SHALL NOT access the database directly; it MUST communicate exclusively via the Backend API
4. THE Project SHALL include a Shared Types (or DTO) package/folder to ensure type safety between Frontend (Next.js) and Backend (NestJS)


### Requirement 16: Rol Hiyerarşisi ve Yetki Sistemi (RBAC + Permissions)

**User Story:** As a Super Admin, I want to create and manage roles with fine-grained permissions, so that I can control exactly what each user can see and do in the Admin Panel.

#### Acceptance Criteria

1. THE System SHALL include a predefined SUPER_ADMIN role with unrestricted access to all resources and actions
2. THE SUPER_ADMIN role SHALL be able to create, update, and delete custom roles
3. THE System SHALL support a permission-based authorization model where permissions follow the format `resource.action` (e.g., `users.create`, `users.delete`)
4. THE System SHALL allow assigning multiple permissions to a single role
5. THE System SHALL allow assigning one or more roles to a user
6. THE Backend SHALL enforce authorization rules using permission checks on all protected endpoints
7. WHEN a user has the SUPER_ADMIN role, permission checks SHALL be bypassed and full access SHALL be granted

### Requirement 17: Rol Yönetimi Arayüzü (Admin Panel)

**User Story:** As a Super Admin, I want a visual interface to manage roles and permissions, so that I can configure access control without touching the codebase.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a Role Management page accessible only to SUPER_ADMIN users
2. THE Role Management page SHALL allow creating and editing roles with a name and description
3. THE Role Management page SHALL display permissions grouped by resource (e.g., Users, Roles, Dashboard)
4. THE Role Management page SHALL provide a checkbox-based permission selector supporting bulk selection per resource
5. THE Admin_Panel SHALL persist role-permission mappings in the database
6. WHEN a role is deleted, THE System SHALL handle affected users gracefully by removing or reassigning the role

### Requirement 18: Kullanıcı–Rol Atama Sistemi

**User Story:** As a Super Admin, I want to assign roles to users, so that each user inherits the correct permissions.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow assigning one or more roles to a user from the User Management interface
2. THE assigned roles SHALL determine the effective permissions of the user
3. THE System SHALL recalculate user permissions immediately after role changes
4. WHEN a user has no assigned role, THE System SHALL apply a default low-privilege role (e.g., VIEWER)

### Requirement 19: Frontend Yetki Tabanlı Görünürlük Kontrolü

**User Story:** As a user, I want to see only the pages and actions I am authorized for, so that the interface remains clear and secure.

#### Acceptance Criteria

1. THE Admin_Panel SHALL hide Sidebar navigation items for which the user lacks the required permission
2. THE Admin_Panel SHALL protect routes using permission checks and redirect unauthorized access attempts
3. THE Admin_Panel SHALL conditionally render UI elements (buttons, actions, menus) based on user permissions
4. THE Admin_Panel SHALL provide a reusable frontend authorization component or hook (e.g., `<Can />`, `usePermission`)
5. THE Admin_Panel SHALL NOT display disabled actions for unauthorized permissions; restricted actions SHALL be fully hidden

### Requirement 20: Backend Permission Guards ve Decorators

**User Story:** As a developer, I want a clean and declarative way to protect backend endpoints, so that authorization logic is consistent and maintainable.

#### Acceptance Criteria

1. THE Backend SHALL provide a custom `@Permissions()` decorator to declare required permissions at the controller or route level
2. THE Backend SHALL implement a Permission Guard that validates user permissions before executing protected endpoints
3. THE Permission Guard SHALL support multiple required permissions per endpoint
4. WHEN permission validation fails, THE Backend SHALL return a 403 Forbidden response
5. Permission checks SHALL be applied consistently across all protected API routes

### Requirement 21: Permission Senkronizasyonu ve Performans Optimizasyonu

**User Story:** As a developer, I want permission data to be efficiently handled on the frontend, so that authorization checks do not introduce performance issues.

#### Acceptance Criteria

1. THE Backend SHALL expose an endpoint to retrieve the authenticated user's effective permissions
2. THE Frontend SHALL cache user permissions in memory using a global state or server-state solution
3. THE Admin_Panel SHALL avoid redundant permission API calls during navigation
4. WHEN a user's roles or permissions change, THE System SHALL ensure updated permissions are reflected on the next authenticated request

### Requirement 22: Güvenlik ve Tutarlılık Kuralları

**User Story:** As a system owner, I want authorization rules to be enforced consistently across the system, so that security is never dependent on frontend logic alone.

#### Acceptance Criteria

1. THE Backend SHALL remain the single source of truth for authorization decisions
2. THE Frontend SHALL be used only to enhance user experience by hiding unauthorized UI elements
3. Direct API access to protected endpoints SHALL always require valid permissions regardless of frontend restrictions
4. Authorization logic SHALL be centralized and reusable across the application

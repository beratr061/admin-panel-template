# Implementation Plan: Admin Panel Template

## Overview

Bu görev listesi, Full-Stack Admin Panel Template'inin adım adım implementasyonunu içerir. Proje monorepo yapısında organize edilmiş olup, önce temel altyapı kurulacak, ardından bileşenler ve özellikler eklenecektir.

## Tasks

- [x] 1. Monorepo ve Proje Altyapısı Kurulumu
  - [x] 1.1 Root package.json ve NPM Workspaces konfigürasyonu oluştur
    - Root dizinde `package.json` oluştur
    - Workspaces: client, server, shared tanımla
    - Ortak scripts ekle (dev, build, lint)
    - _Requirements: 13.1_

  - [x] 1.2 Shared package oluştur
    - `shared/package.json` oluştur (@admin-panel/shared)
    - TypeScript konfigürasyonu ekle
    - Barrel exports için `index.ts` oluştur
    - _Requirements: 15.4, 12.4_

  - [x] 1.3 Next.js Client projesi oluştur
    - `npx create-next-app@latest client` ile proje oluştur
    - App Router, TypeScript, Tailwind CSS, ESLint seçeneklerini aktif et
    - `tsconfig.json`'da strict mode ve absolute imports (@/) ayarla
    - Shared package'ı dependency olarak ekle
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.4 NestJS Server projesi oluştur
    - `nest new server` ile proje oluştur
    - TypeScript strict mode aktif et
    - Shared package'ı dependency olarak ekle
    - _Requirements: 14.1_

  - [x] 1.5 ESLint, Prettier ve Husky konfigürasyonu
    - Root'ta ESLint ve Prettier config dosyaları oluştur
    - Husky pre-commit hook ekle (lint-staged)
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 1.6 Environment variables ve .env.example dosyaları oluştur
    - Server için .env.example
    - Client için .env.example
    - Root için docker .env.example
    - _Requirements: 13.5_

- [x] 2. Checkpoint - Proje altyapısını doğrula
  - Tüm workspace'lerin çalıştığını doğrula
  - `npm install` ve `npm run dev` komutlarının çalıştığını kontrol et
  - Kullanıcıya soru sor

- [x] 3. Veritabanı ve Prisma Kurulumu
  - [x] 3.1 Prisma'yı server projesine ekle ve schema oluştur
    - `npm install prisma @prisma/client`
    - User, Role, Permission, UserRole, RolePermission, RefreshToken, Activity modellerini tanımla
    - _Requirements: 9.1, 9.2_

  - [x] 3.2 Seed script oluştur
    - SUPER_ADMIN rolü ve varsayılan permissions oluştur
    - Test kullanıcıları ekle (Faker.js ile)
    - _Requirements: 9.3, 16.1_

  - [x] 3.3 Property test: Role-Permission mappings persist
    - **Property 32: Role-Permission Mappings Persist**
    - **Validates: Requirements 17.5**

- [x] 4. Backend Auth Modülü
  - [x] 4.1 Auth module, controller ve service oluştur
    - Login, Register, Refresh, Logout endpoints
    - JWT Access ve Refresh token stratejileri
    - HttpOnly cookie ile refresh token yönetimi
    - _Requirements: 8.5, 8.6_

  - [x] 4.2 DTOs ve validation oluştur
    - LoginDto, RegisterDto, TokenResponseDto
    - Class-validator decorators
    - _Requirements: 14.2_

  - [x] 4.3 Property test: JWT tokens issued on valid login
    - **Property 23: JWT Tokens Issued on Valid Login**
    - **Validates: Requirements 8.5**

  - [x] 4.4 Property test: DTO validation rejects invalid payloads
    - **Property 27: DTO Validation Rejects Invalid Payloads**
    - **Validates: Requirements 14.2**

- [x] 5. Backend Permission Sistemi
  - [x] 5.1 Permissions module oluştur
    - @Permissions() decorator
    - PermissionsGuard
    - SUPER_ADMIN bypass logic
    - _Requirements: 20.1, 20.2, 16.7_

  - [x] 5.2 Users module oluştur
    - CRUD endpoints
    - Rol atama endpoint'i
    - Permission-protected routes
    - _Requirements: 18.1_

  - [x] 5.3 Roles module oluştur
    - CRUD endpoints (SUPER_ADMIN only)
    - Permission assignment
    - _Requirements: 16.2, 17.5_

  - [x] 5.4 Property test: Protected endpoints return 403 without permission
    - **Property 25: Protected Endpoints Return 403 Without Permission**
    - **Validates: Requirements 8.7, 16.6, 20.3, 20.4, 22.3**

  - [x] 5.5 Property test: SUPER_ADMIN bypasses permission checks
    - **Property 31: SUPER_ADMIN Bypasses Permission Checks**
    - **Validates: Requirements 16.7**

  - [x] 5.6 Property test: Effective permissions calculated from roles
    - **Property 34: Effective Permissions Calculated from Roles**
    - **Validates: Requirements 18.2, 18.3**

- [x] 6. Backend Güvenlik ve Middleware
  - [x] 6.1 Helmet, CORS ve Rate Limiting konfigürasyonu
    - Helmet middleware ekle
    - CORS policy ayarla
    - Throttler module ekle
    - _Requirements: 14.3, 14.4, 14.6_

  - [x] 6.2 Global exception filter oluştur
    - HttpExceptionFilter
    - Validation error formatting
    - _Requirements: 14.2_

  - [x] 6.3 Swagger/OpenAPI konfigürasyonu
    - Swagger module ekle
    - API documentation endpoint'i
    - _Requirements: 14.7_

  - [x] 6.4 Property test: Rate limiting triggers on excessive requests
    - **Property 28: Rate Limiting Triggers on Excessive Requests**
    - **Validates: Requirements 14.3**

- [x] 7. Checkpoint - Backend API'yi doğrula
  - Swagger UI üzerinden tüm endpoint'leri test et
  - Auth flow'u doğrula
  - Kullanıcıya soru sor

- [x] 8. Frontend Temel Kurulum
  - [x] 8.1 Shadcn/UI kurulumu ve temel bileşenler
    - `npx shadcn-ui@latest init`
    - Button, Input, Card, Dialog, Toast, Tooltip bileşenlerini ekle
    - _Requirements: 2.8_

  - [x] 8.2 Tema sistemi kurulumu (next-themes)
    - ThemeProvider oluştur
    - CSS variables tanımla (light/dark)
    - Theme toggle bileşeni
    - LocalStorage persistence
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

  - [x] 8.3 Property test: Theme toggle changes theme
    - **Property 1: Theme Toggle Changes Theme**
    - **Validates: Requirements 2.1**

  - [x] 8.4 Property test: Theme persists across sessions
    - **Property 2: Theme Persists Across Sessions**
    - **Validates: Requirements 2.4**

- [x] 9. Frontend API Client ve State Management
  - [x] 9.1 Axios instance ve interceptors oluştur
    - apiClient oluştur
    - Request interceptor (token ekleme)
    - Response interceptor (error handling, token refresh)
    - _Requirements: 15.1, 8.9_

  - [x] 9.2 TanStack Query kurulumu
    - QueryClientProvider
    - Default options (staleTime, cacheTime)
    - _Requirements: 15.2_

  - [x] 9.3 Auth store ve hooks oluştur
    - useAuth hook
    - Permission caching
    - _Requirements: 21.2_

  - [x] 9.4 Property test: Token auto-refresh on expiry
    - **Property 24: Token Auto-Refresh on Expiry**
    - **Validates: Requirements 8.9**

- [x] 10. Frontend Layout Bileşenleri
  - [x] 10.1 Sidebar bileşeni oluştur
    - Collapsible sidebar (full/icon mode)
    - Navigation groups ve items
    - Active link highlighting
    - Permission-based item visibility
    - LocalStorage state persistence
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9, 19.1_

  - [x] 10.2 Header bileşeni oluştur
    - Sticky header
    - Search bar
    - Notification icon
    - User profile dropdown
    - Theme toggle
    - Language switcher
    - _Requirements: 3.6, 3.7_

  - [x] 10.3 Breadcrumb bileşeni oluştur
    - Route-based breadcrumb generation
    - _Requirements: 3.8_

  - [x] 10.4 Mobile navigation (Sheet/Drawer)
    - Hamburger menu button
    - Slide-out drawer
    - _Requirements: 3.10_

  - [x] 10.5 Dashboard layout oluştur
    - Sidebar + Header + Main content area
    - Responsive grid
    - _Requirements: 3.12_

  - [x] 10.6 Property test: Sidebar collapse toggle works
    - **Property 5: Sidebar Collapse Toggle Works**
    - **Validates: Requirements 3.1**

  - [x] 10.7 Property test: Sidebar state persists
    - **Property 6: Sidebar State Persists**
    - **Validates: Requirements 3.2**

  - [x] 10.8 Property test: Breadcrumb reflects current path
    - **Property 7: Breadcrumb Reflects Current Path**
    - **Validates: Requirements 3.8**

  - [x] 10.9 Property test: Active navigation link highlighted
    - **Property 8: Active Navigation Link Highlighted**
    - **Validates: Requirements 3.9**

- [x] 11. Checkpoint - Layout bileşenlerini doğrula
  - Sidebar collapse/expand çalışıyor mu?
  - Mobile responsive çalışıyor mu?
  - Kullanıcıya soru sor

- [x] 12. Frontend Auth Sayfaları ve Bileşenleri
  - [x] 12.1 LoginForm bileşeni oluştur
    - Email/password fields
    - Zod validation
    - Remember me checkbox
    - _Requirements: 8.1, 8.2_

  - [x] 12.2 RegisterForm bileşeni oluştur
    - Email, password, confirm password fields
    - Zod validation
    - _Requirements: 8.3_

  - [x] 12.3 ForgotPasswordForm bileşeni oluştur
    - Email field
    - _Requirements: 8.4_

  - [x] 12.4 Auth sayfaları oluştur (login, register, forgot-password)
    - Auth layout group
    - Form bileşenlerini entegre et
    - _Requirements: 8.1_

  - [x] 12.5 Route protection middleware oluştur
    - Auth check
    - Permission check
    - Redirect logic
    - _Requirements: 8.8, 19.2_

  - [x] 12.6 Property test: Login form validation works
    - **Property 22: Login Form Validation Works**
    - **Validates: Requirements 8.2**

  - [x] 12.7 Property test: Protected routes redirect unauthenticated users
    - **Property 26: Protected Routes Redirect Unauthenticated Users**
    - **Validates: Requirements 8.8, 19.2**

- [x] 13. Frontend Authorization Bileşenleri
  - [x] 13.1 Can bileşeni oluştur
    - Permission-based rendering
    - Fallback support
    - _Requirements: 19.4_

  - [x] 13.2 usePermission hook oluştur
    - can() function
    - Permission array
    - _Requirements: 19.4_

  - [x] 13.3 Property test: UI elements visibility matches permissions
    - **Property 35: UI Elements Visibility Matches Permissions**
    - **Validates: Requirements 19.1, 19.3**

- [x] 14. Data Table Bileşeni
  - [x] 14.1 DataTable core bileşeni oluştur
    - TanStack Table entegrasyonu
    - Column definitions
    - Skeleton loader
    - _Requirements: 4.8_

  - [x] 14.2 Pagination bileşeni oluştur
    - Page navigation
    - Page size selector
    - _Requirements: 4.1_

  - [x] 14.3 Sorting implementasyonu
    - Column header click handler
    - Sort direction indicator
    - _Requirements: 4.2_

  - [x] 14.4 Filtering bileşenleri oluştur
    - Text search
    - Date range picker
    - Category select
    - _Requirements: 4.3_

  - [x] 14.5 Row selection implementasyonu
    - Checkbox column
    - Select all
    - _Requirements: 4.4_

  - [x] 14.6 Bulk actions toolbar
    - Selected count display
    - Action buttons
    - _Requirements: 4.5_

  - [x] 14.7 Column visibility toggle
    - Dropdown menu
    - Checkbox list
    - _Requirements: 4.6_

  - [x] 14.8 Export functionality
    - CSV export
    - Excel export
    - _Requirements: 4.7_

  - [x] 14.9 Property test: Data table pagination loads correct subset
    - **Property 9: Data Table Pagination Loads Correct Subset**
    - **Validates: Requirements 4.1**

  - [x] 14.10 Property test: Data table sorting works
    - **Property 10: Data Table Sorting Works**
    - **Validates: Requirements 4.2**

  - [x] 14.11 Property test: Data table filtering returns matching results
    - **Property 11: Data Table Filtering Returns Matching Results**
    - **Validates: Requirements 4.3**

  - [x] 14.12 Property test: Row selection updates state
    - **Property 12: Row Selection Updates State**
    - **Validates: Requirements 4.4**

  - [x] 14.13 Property test: Bulk actions appear when rows selected
    - **Property 13: Bulk Actions Appear When Rows Selected**
    - **Validates: Requirements 4.5**

  - [x] 14.14 Property test: Column visibility toggle works
    - **Property 14: Column Visibility Toggle Works**
    - **Validates: Requirements 4.6**

  - [x] 14.15 Property test: Export produces valid file
    - **Property 15: Export Produces Valid File**
    - **Validates: Requirements 4.7**

- [x] 15. Checkpoint - Data Table'ı doğrula
  - Tüm Data Table özellikleri çalışıyor mu?
  - Kullanıcıya soru sor

- [x] 16. Form Bileşenleri
  - [x] 16.1 DatePicker bileşeni oluştur
    - Single date selection
    - Date range selection
    - _Requirements: 5.2_

  - [x] 16.2 Combobox bileşeni oluştur
    - Searchable select
    - Multi-select support
    - _Requirements: 5.3_

  - [x] 16.3 FileUpload bileşeni oluştur
    - Drag and drop
    - Progress bar
    - Preview
    - _Requirements: 5.6, 5.7, 5.8_

  - [x] 16.4 RichTextEditor bileşeni oluştur (Tiptap)
    - Basic formatting
    - Toolbar
    - _Requirements: 5.5_

  - [x] 16.5 Property test: Zod validation returns errors for invalid input
    - **Property 17: Zod Validation Returns Errors for Invalid Input**
    - **Validates: Requirements 5.1**

  - [x] 16.6 Property test: Combobox filters options on search
    - **Property 18: Combobox Filters Options on Search**
    - **Validates: Requirements 5.3**

  - [x] 16.7 Property test: Inline validation errors appear next to fields
    - **Property 19: Inline Validation Errors Appear Next to Fields**
    - **Validates: Requirements 5.9**

- [x] 17. Dashboard Bileşenleri
  - [x] 17.1 StatCard bileşeni oluştur
    - Value display
    - Trend indicator
    - Icon
    - _Requirements: 6.1_

  - [x] 17.2 Chart bileşenleri oluştur (Recharts)
    - LineChart
    - BarChart
    - PieChart/DonutChart
    - _Requirements: 6.2_

  - [x] 17.3 ActivityFeed bileşeni oluştur
    - Activity list
    - User avatar
    - Timestamp
    - _Requirements: 6.3_

  - [x] 17.4 Dashboard sayfası oluştur
    - Widget grid layout
    - Responsive design
    - _Requirements: 6.4_

  - [x] 17.5 Property test: Dashboard widgets responsive
    - **Property 20: Dashboard Widgets Responsive**
    - **Validates: Requirements 6.4**

- [x] 18. Bildirim Bileşenleri
  - [x] 18.1 Toast notification sistemi kurulumu (Sonner)
    - Success, error, warning, info variants
    - Auto-dismiss
    - _Requirements: 7.1, 7.2_

  - [x] 18.2 Confirmation modal bileşeni oluştur
    - Title, description
    - Confirm/Cancel buttons
    - _Requirements: 7.3_

  - [x] 18.3 Property test: Toast notifications appear on trigger
    - **Property 21: Toast Notifications Appear on Trigger**
    - **Validates: Requirements 7.1**

- [x] 19. i18n Kurulumu
  - [x] 19.1 next-intl kurulumu ve konfigürasyonu
    - Middleware
    - Provider
    - _Requirements: 11.1_

  - [x] 19.2 Locale dosyaları oluştur (tr, en)
    - Common translations
    - Page-specific translations
    - _Requirements: 11.2_

  - [x] 19.3 Language switcher bileşeni
    - Dropdown menu
    - Flag icons
    - _Requirements: 11.4_

  - [x] 19.4 Property test: Language preference persists
    - **Property 29: Language Preference Persists**
    - **Validates: Requirements 11.5**

- [x] 20. Yönetim Sayfaları
  - [x] 20.1 Users management sayfası oluştur
    - User list (DataTable)
    - Create/Edit user modal
    - Role assignment
    - _Requirements: 18.1_

  - [x] 20.2 Roles management sayfası oluştur
    - Role list
    - Create/Edit role modal
    - Permission assignment (checkbox grid)
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 20.3 User profile sayfası oluştur
    - Profile info form
    - Password change form
    - _Requirements: 8.10_

  - [x] 20.4 Property test: SUPER_ADMIN can CRUD roles
    - **Property 30: SUPER_ADMIN Can CRUD Roles**
    - **Validates: Requirements 16.2**

  - [x] 20.5 Property test: Role deletion handles affected users
    - **Property 33: Role Deletion Handles Affected Users**
    - **Validates: Requirements 17.6**

- [x] 21. Checkpoint - Tüm sayfaları doğrula
  - Tüm CRUD işlemleri çalışıyor mu?
  - Permission sistemi doğru çalışıyor mu?
  - Kullanıcıya soru sor

- [x] 22. Error ve Loading Sayfaları
  - [x] 22.1 Custom error.tsx sayfası oluştur
    - Error boundary
    - Retry button
    - _Requirements: 1.4_

  - [x] 22.2 Custom not-found.tsx sayfası oluştur
    - 404 design
    - Home link
    - _Requirements: 1.5_

  - [x] 22.3 Loading states ve Skeleton loaders
    - Page loading
    - Component loading
    - _Requirements: 10.1_

- [x] 23. Animasyonlar
  - [x] 23.1 Framer Motion kurulumu ve page transitions
    - Page enter/exit animations
    - _Requirements: 10.2, 10.3, 3.11_

  - [x] 23.2 Micro-animations
    - Button hover effects
    - Modal transitions
    - _Requirements: 10.2_

- [x] 24. Docker ve Deployment
  - [x] 24.1 Dockerfile.client oluştur
    - Multi-stage build
    - Standalone output
    - _Requirements: 13.2_

  - [x] 24.2 Dockerfile.server oluştur
    - Multi-stage build
    - Production optimization
    - _Requirements: 13.2_

  - [x] 24.3 docker-compose.yml oluştur
    - Client, Server, PostgreSQL services
    - Network configuration
    - Volume mounts
    - _Requirements: 13.2, 13.3_

  - [x] 24.4 Nginx konfigürasyonu oluştur
    - Reverse proxy
    - Subdomain routing
    - _Requirements: 13.4_

- [x] 25. Dokümantasyon
  - [x] 25.1 README.md oluştur
    - Proje açıklaması
    - Kurulum adımları
    - Environment variables
    - Docker kullanımı
    - _Requirements: 12.5_

- [x] 26. Final Checkpoint - Tüm sistemi doğrula
  - Docker compose ile tüm sistem ayağa kalkıyor mu?
  - Tüm özellikler çalışıyor mu?
  - Kullanıcıya soru sor

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All tasks including property tests are required for comprehensive coverage

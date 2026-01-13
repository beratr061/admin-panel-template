# Admin Panel Template

A production-ready, full-stack admin panel template built with modern technologies. This monorepo provides a solid foundation for building admin dashboards with authentication, role-based access control (RBAC), and a comprehensive UI component library.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access/refresh tokens
  - Role-Based Access Control (RBAC) with fine-grained permissions
  - SUPER_ADMIN role with unrestricted access
  - Protected routes and API endpoints

- **Modern UI/UX**
  - Dark/Light theme with system preference detection
  - Responsive design (mobile, tablet, desktop)
  - Collapsible sidebar with state persistence
  - Smooth animations with Framer Motion
  - Accessible components (WCAG 2.1 AA compliant)

- **Data Management**
  - Advanced data tables with pagination, sorting, filtering
  - Row selection and bulk actions
  - CSV/Excel export functionality
  - Real-time data synchronization with TanStack Query

- **Internationalization**
  - Multi-language support (Turkish, English)
  - Language preference persistence
  - Easy to extend with additional languages

- **Developer Experience**
  - TypeScript with strict mode
  - ESLint + Prettier + Husky pre-commit hooks
  - Shared types between frontend and backend
  - Comprehensive API documentation with Swagger

## 🛠️ Tech Stack

### Frontend (client/)
- [Next.js 14+](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn/UI](https://ui.shadcn.com/) - UI component library
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Zod](https://zod.dev/) - Schema validation
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization
- [Recharts](https://recharts.org/) - Charts and data visualization

### Backend (server/)
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - ORM for PostgreSQL
- [Passport.js](http://www.passportjs.org/) - Authentication
- [Class-Validator](https://github.com/typestack/class-validator) - DTO validation
- [Swagger](https://swagger.io/) - API documentation
- [Helmet](https://helmetjs.github.io/) - Security headers

### Database
- [PostgreSQL](https://www.postgresql.org/) - Relational database

### DevOps
- [Docker](https://www.docker.com/) - Containerization
- [Nginx](https://nginx.org/) - Reverse proxy (optional)

## 📁 Project Structure

```
admin-panel-template/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── (auth)/     # Auth pages (login, register)
│   │   │   └── (dashboard)/ # Dashboard pages
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn/UI components
│   │   │   ├── forms/      # Form components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── data-table/ # Data table components
│   │   │   └── dashboard/  # Dashboard widgets
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   ├── providers/      # Context providers
│   │   └── locales/        # i18n translations
│   └── public/             # Static assets
│
├── server/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── roles/          # Roles module
│   │   ├── permissions/    # Permissions module
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Prisma module
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── seed.ts         # Database seeding
│
├── shared/                 # Shared TypeScript types
│   └── src/
│       ├── types/          # Type definitions
│       └── constants/      # Shared constants
│
├── docker/                 # Docker configuration
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx/
│
├── docker-compose.yml      # Container orchestration
└── package.json            # Root package.json (workspaces)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14+ (or Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp client/.env.example client/.env.local
   cp server/.env.example server/.env
   ```

4. **Configure environment variables**

   Edit the `.env` files with your configuration (see [Environment Variables](#-environment-variables) section).

5. **Set up the database**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres

   # Run Prisma migrations
   cd server
   npx prisma migrate dev

   # Seed the database with initial data
   npx prisma db seed
   ```

6. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Swagger API Docs: http://localhost:4000/api/docs

### Default Credentials

After seeding the database, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | Admin123! |
| User | user@example.com | User123! |

## 🔧 Environment Variables

### Root (.env)

Used by Docker Compose for container orchestration.

```bash
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=admin_panel

# Ports
CLIENT_PORT=3000
SERVER_PORT=4000
DB_PORT=5432

# Node Environment
NODE_ENV=development
```

### Server (server/.env)

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

### Client (client/.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# App Configuration
NEXT_PUBLIC_APP_NAME="Admin Panel"
NEXT_PUBLIC_DEFAULT_LOCALE="tr"
```

## 📜 Available Scripts

### Root Level

```bash
# Start all services in development mode
npm run dev

# Build all packages
npm run build

# Lint all packages
npm run lint

# Format code with Prettier
npm run format
```

### Client

```bash
# Development server
npm run dev -w client

# Production build
npm run build -w client

# Run tests
npm run test -w client

# Lint
npm run lint -w client
```

### Server

```bash
# Development server (watch mode)
npm run dev -w server

# Production build
npm run build -w server

# Run tests
npm run test -w server

# Prisma commands
cd server
npx prisma migrate dev      # Run migrations
npx prisma db seed          # Seed database
npx prisma studio           # Open Prisma Studio
npx prisma generate         # Generate Prisma Client
```

## 🐳 Docker Deployment

### Quick Start with Docker

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and start containers**
   ```bash
   # Development (without Nginx)
   docker-compose up -d

   # Production (with Nginx reverse proxy)
   docker-compose --profile with-nginx up -d
   ```

3. **Run database migrations**
   ```bash
   docker-compose exec server npx prisma migrate deploy
   docker-compose exec server npx prisma db seed
   ```

### Container Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| server | 4000 | NestJS API server |
| client | 3000 | Next.js frontend |
| nginx | 80/443 | Reverse proxy (optional) |

### Subdomain Configuration

When using Nginx, configure your DNS to point:
- `admin.example.com` → Frontend (port 3000)
- `api.example.com` → Backend (port 4000)

### SSL Certificates

For HTTPS, place your SSL certificates in `docker/nginx/ssl/`:
- `fullchain.pem` - Certificate chain
- `privkey.pem` - Private key

See [docker/README.md](docker/README.md) for detailed deployment instructions.

## 🔐 Authentication & Authorization

### JWT Token Flow

1. User logs in with email/password
2. Server validates credentials and issues:
   - **Access Token** (15min) - Stored in memory
   - **Refresh Token** (7 days) - Stored in HttpOnly cookie
3. Access token is sent with each API request
4. When access token expires, refresh token is used to obtain a new one

### Permission System

Permissions follow the format `resource.action`:
- `users.create`, `users.read`, `users.update`, `users.delete`
- `roles.create`, `roles.read`, `roles.update`, `roles.delete`
- `dashboard.read`

### Role Hierarchy

- **SUPER_ADMIN**: Full access to all resources (bypasses permission checks)
- **ADMIN**: Configurable permissions
- **USER**: Limited permissions
- **VIEWER**: Read-only access (default role)

## 🧪 Testing

```bash
# Run all tests
npm run test -w client
npm run test -w server

# Run tests in watch mode
npm run test:watch -w client
npm run test:watch -w server

# Run with coverage
npm run test:cov -w server
```

## 📚 API Documentation

When the server is running, access Swagger documentation at:
```
http://localhost:4000/api/docs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [NestJS](https://nestjs.com/) for the robust backend framework
- [Next.js](https://nextjs.org/) for the React framework
- [Prisma](https://www.prisma.io/) for the excellent ORM

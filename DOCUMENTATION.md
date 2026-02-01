# Dashboard Starter - Complete Documentation

A production-ready, enterprise-grade Next.js dashboard with comprehensive features for SaaS applications.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Pages & Routes](#pages--routes)
8. [API Reference](#api-reference)
9. [Components](#components)
10. [State Management](#state-management)
11. [Feature Flags](#feature-flags)
12. [Settings System](#settings-system)
13. [Email System](#email-system)
14. [Billing & Subscriptions](#billing--subscriptions)
15. [Analytics](#analytics)
16. [Internationalization (i18n)](#internationalization-i18n)
17. [Notifications](#notifications)
18. [Media Library](#media-library)
19. [SEO Tools](#seo-tools)
20. [Onboarding](#onboarding)
21. [Configuration](#configuration)

---

## Overview

Dashboard Starter is a full-featured admin dashboard built with Next.js 16, designed to accelerate the development of SaaS applications. It includes:

- **User Management** with role-based permissions
- **Content Management System** (Posts, Categories, Tags)
- **Media Library** with folder organization
- **Subscription & Billing** with Stripe integration
- **Email System** with templates and logging
- **Advanced Analytics** with geographic, retention, and funnel analysis
- **Multi-language Support** (9 languages including RTL)
- **Real-time Notifications** via Server-Sent Events
- **Feature Flags** for controlled feature rollout
- **Comprehensive Audit Logging**
- **SEO Tools** including redirects management

---

## Tech Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |

### Database & ORM
| Package | Version | Purpose |
|---------|---------|---------|
| Prisma | 6.19.2 | Database ORM |
| MySQL | - | Database provider |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| NextAuth | 5.0.0-beta.30 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| @auth/prisma-adapter | 2.11.1 | Prisma adapter |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | 4.x | Utility-first CSS |
| shadcn/ui | - | Component library |
| Radix UI | Various | Headless UI primitives |
| lucide-react | 0.563.0 | Icons |
| Recharts | 3.7.0 | Charts & graphs |

### Forms & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| React Hook Form | 7.71.1 | Form management |
| Zod | 4.3.6 | Schema validation |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | 5.0.10 | Client state |
| next-themes | 0.4.6 | Theme management |

### Payments & Email
| Package | Version | Purpose |
|---------|---------|---------|
| Stripe | 20.3.0 | Payment processing |
| Nodemailer | 7.0.13 | Email sending |
| web-push | 3.6.7 | Push notifications |

### Editor & Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| TipTap | 3.18.0 | Rich text editor |
| date-fns | 4.1.0 | Date utilities |
| cmdk | 1.1.1 | Command palette |
| Sonner | 2.0.7 | Toast notifications |

---

## Project Structure

```
dashboard-starter/
├── prisma/
│   ├── schema.prisma          # Database models (32 models)
│   └── seed.ts                # Database seeding script
├── public/
│   ├── messages/              # i18n translation files (9 languages)
│   └── uploads/               # User-uploaded files
├── src/
│   ├── app/
│   │   ├── (auth)/            # Public authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── activity/
│   │   │       ├── analytics/
│   │   │       ├── billing/
│   │   │       ├── categories/
│   │   │       ├── email/
│   │   │       ├── media/
│   │   │       ├── plans/
│   │   │       ├── posts/
│   │   │       ├── profile/
│   │   │       ├── redirects/
│   │   │       ├── roles/
│   │   │       ├── seo/
│   │   │       ├── settings/
│   │   │       ├── subscriptions/
│   │   │       ├── tags/
│   │   │       └── users/
│   │   └── api/               # REST API endpoints (55 routes)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (30+)
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── providers/         # Context providers
│   │   ├── auth/              # Authentication forms
│   │   ├── activity/          # Activity timeline
│   │   ├── analytics/         # Analytics charts
│   │   ├── billing/           # Billing components
│   │   ├── editor/            # TipTap editor
│   │   ├── i18n/              # Language switcher
│   │   ├── notifications/     # Notification components
│   │   ├── onboarding/        # Onboarding components
│   │   └── settings/          # Settings components
│   ├── config/
│   │   ├── navigation.ts      # Sidebar navigation
│   │   ├── permissions.ts     # Permission definitions
│   │   └── onboarding.ts      # Onboarding steps
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── settings.ts        # Settings management
│   │   ├── activity.ts        # Activity logging
│   │   ├── features.ts        # Feature flags
│   │   ├── notifications.ts   # Notification service
│   │   ├── email/             # Email service & templates
│   │   ├── stripe/            # Stripe integration
│   │   ├── analytics/         # Analytics utilities
│   │   ├── usage/             # Usage tracking
│   │   ├── dashboard/         # Dashboard statistics
│   │   ├── i18n/              # i18n configuration
│   │   └── validations/       # Zod schemas
│   ├── stores/                # Zustand state stores
│   ├── types/                 # TypeScript definitions
│   └── auth.ts                # NextAuth configuration
├── package.json
├── CLAUDE.md                  # AI assistant instructions
└── DOCUMENTATION.md           # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dashboard-starter

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and auth settings

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

**Required:**
```env
DATABASE_URL="mysql://user:pass@localhost:3306/dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-min-32-character-secret"
```

**Optional (Email):**
```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@example.com"
```

**Optional (Stripe):**
```env
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |

---

## Database Schema

The database consists of **32 models** organized into logical groups:

### Authentication Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  roleId        String?
  locale        String    @default("en")
  lastActiveAt  DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // Relations: role, accounts, sessions, posts, media, notifications, etc.
}
```

#### Role
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions Json     // Array of permission strings
  isDefault   Boolean  @default(false)
}
```

### Content Models

#### Post
```prisma
model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  content     String?    @db.LongText
  excerpt     String?    @db.Text
  featuredImage String?
  status      PostStatus @default(DRAFT) // DRAFT, PUBLISHED, SCHEDULED, ARCHIVED
  publishedAt DateTime?
  scheduledAt DateTime?
  authorId    String
  categoryId  String?
  // Relations: author, category, tags, seoMeta, translations
}
```

#### Category
Supports hierarchical structure with parent-child relationships.

#### Tag
Simple tag model with name, slug, and optional color.

### Media Models

#### Media
```prisma
model Media {
  id         String   @id @default(cuid())
  name       String
  fileName   String
  fileType   String
  fileSize   Int
  url        String
  width      Int?
  height     Int?
  alt        String?
  folderId   String?
  uploadedBy String
}
```

#### MediaFolder
Hierarchical folder structure for organizing media files.

### Subscription Models

#### Plan
```prisma
model Plan {
  id                   String     @id @default(cuid())
  name                 String     @unique
  description          String?
  monthlyPrice         Decimal
  yearlyPrice          Decimal
  features             Json       // { maxUsers, maxStorage, apiCalls, featureFlags }
  trialDays            Int        @default(0)
  status               PlanStatus // ACTIVE, INACTIVE, ARCHIVED
  stripeProductId      String?
  stripeMonthlyPriceId String?
  stripeYearlyPriceId  String?
}
```

#### Subscription
```prisma
model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  planId               String
  status               SubscriptionStatus // TRIALING, ACTIVE, PAST_DUE, CANCELED, EXPIRED
  billingPeriod        BillingPeriod      // MONTHLY, YEARLY
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  trialStart           DateTime?
  trialEnd             DateTime?
  stripeCustomerId     String?
  stripeSubscriptionId String?
}
```

### Email Models

#### EmailTemplate
Templates with variable substitution support.

#### EmailLog
Complete email sending history with status tracking.

### Analytics Models

#### PageView
Page visit tracking with geographic, device, and browser data.

#### ConversionEvent
Funnel event tracking for conversion analysis.

### System Models

- **Setting** - Key-value configuration store
- **Notification** - In-app notifications
- **NotificationPreference** - User notification settings
- **ActivityLog** - Comprehensive audit trail
- **FeatureFlag** - Feature toggle management
- **Backup** - Database backup records
- **Redirect** - URL redirect management with hit counting
- **UsageRecord** - Resource usage tracking
- **UserOnboarding** - Onboarding progress tracking
- **PushSubscription** - Web push subscriptions
- **Translation** - i18n translation strings
- **PostTranslation** - Multilingual post content

---

## Authentication & Authorization

### Authentication Flow

The application uses **NextAuth v5** with JWT strategy:

```typescript
// src/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        // Email/password validation with bcrypt
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      // Include id, role, permissions in token
    },
    session({ session, token }) {
      // Expose user data in session
    }
  }
})
```

### Permission System

**42 permissions** organized by feature:

```typescript
// src/config/permissions.ts
export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",

  // Posts
  POSTS_VIEW: "posts.view",
  POSTS_CREATE: "posts.create",
  POSTS_EDIT: "posts.edit",
  POSTS_EDIT_ALL: "posts.edit_all",
  POSTS_DELETE: "posts.delete",
  POSTS_DELETE_ALL: "posts.delete_all",
  POSTS_PUBLISH: "posts.publish",

  // Categories & Tags
  CATEGORIES_MANAGE: "categories.manage",
  TAGS_MANAGE: "tags.manage",

  // Media
  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_DELETE: "media.delete",
  MEDIA_DELETE_ALL: "media.delete_all",

  // SEO
  SEO_MANAGE: "seo.manage",
  REDIRECTS_MANAGE: "redirects.manage",

  // Settings & Roles
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",

  // Activity & Analytics
  ACTIVITY_VIEW: "activity.view",
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_ADVANCED: "analytics.advanced",
  ANALYTICS_EXPORT: "analytics.export",

  // Plans & Subscriptions
  PLANS_VIEW: "plans.view",
  PLANS_CREATE: "plans.create",
  PLANS_EDIT: "plans.edit",
  PLANS_DELETE: "plans.delete",
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  SUBSCRIPTIONS_CREATE: "subscriptions.create",
  SUBSCRIPTIONS_EDIT: "subscriptions.edit",
  SUBSCRIPTIONS_CANCEL: "subscriptions.cancel",

  // Email
  EMAIL_TEMPLATES_VIEW: "email.templates.view",
  EMAIL_TEMPLATES_EDIT: "email.templates.edit",
  EMAIL_LOGS_VIEW: "email.logs.view",
  EMAIL_SEND: "email.send",

  // Billing & Features
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",
  FEATURES_VIEW: "features.view",
  FEATURES_MANAGE: "features.manage",

  // Translations
  TRANSLATIONS_VIEW: "translations.view",
  TRANSLATIONS_EDIT: "translations.edit",
}
```

### Default Roles

| Role | Permissions |
|------|-------------|
| **Admin** | All 42 permissions |
| **Editor** | Posts (all), Categories, Tags, Media, SEO, Analytics view, Email view |
| **Author** | Posts (own), Media (own), Tags |
| **User** | Posts view, Media view only |

### API Route Authorization Pattern

```typescript
// Example API route
export async function GET(request: Request) {
  const session = await auth()

  // Check authentication
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check permission
  if (!session.user.permissions.includes("posts.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Proceed with operation
  const posts = await db.post.findMany()
  return NextResponse.json(posts)
}
```

---

## Pages & Routes

### Authentication Pages
| Route | Description |
|-------|-------------|
| `/login` | User login form |
| `/register` | New user registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Reset password with token |

### Dashboard Pages

#### Overview
| Route | Permission | Feature Flag |
|-------|------------|--------------|
| `/dashboard` | - | - |
| `/dashboard/analytics` | `analytics.view` | - |
| `/dashboard/analytics/geo` | `analytics.advanced` | `advanced_analytics` |
| `/dashboard/analytics/retention` | `analytics.advanced` | `advanced_analytics` |
| `/dashboard/analytics/funnels` | `analytics.advanced` | `advanced_analytics` |

#### Content Management
| Route | Permission |
|-------|------------|
| `/dashboard/posts` | `posts.view` |
| `/dashboard/posts/new` | `posts.create` |
| `/dashboard/posts/[id]` | `posts.edit` |
| `/dashboard/categories` | `categories.manage` |
| `/dashboard/tags` | `tags.manage` |
| `/dashboard/media` | `media.view` |

#### SEO
| Route | Permission |
|-------|------------|
| `/dashboard/seo` | `seo.manage` |
| `/dashboard/redirects` | `redirects.manage` |

#### Subscriptions
| Route | Permission |
|-------|------------|
| `/dashboard/plans` | `plans.view` |
| `/dashboard/plans/create` | `plans.create` |
| `/dashboard/plans/[id]` | `plans.edit` |
| `/dashboard/subscriptions` | `subscriptions.view` |
| `/dashboard/subscriptions/create` | `subscriptions.create` |
| `/dashboard/subscriptions/[id]` | `subscriptions.edit` |

#### Billing
| Route | Permission | Feature Flag |
|-------|------------|--------------|
| `/dashboard/billing` | `billing.view` | `stripe_billing` |
| `/dashboard/billing/usage` | `billing.view` | `usage_limits` |
| `/dashboard/billing/invoices` | `billing.view` | `stripe_billing` |

#### Email
| Route | Permission |
|-------|------------|
| `/dashboard/email/templates` | `email.templates.view` |
| `/dashboard/email/templates/create` | `email.templates.edit` |
| `/dashboard/email/templates/[id]` | `email.templates.edit` |
| `/dashboard/email/logs` | `email.logs.view` |

#### Administration
| Route | Permission |
|-------|------------|
| `/dashboard/users` | `users.view` |
| `/dashboard/users/create` | `users.create` |
| `/dashboard/users/[id]` | `users.edit` |
| `/dashboard/roles` | `roles.view` |
| `/dashboard/activity` | `activity.view` |
| `/dashboard/activity/timeline` | `activity.view` |
| `/dashboard/profile` | - |

#### Settings
| Route | Permission |
|-------|------------|
| `/dashboard/settings` | `settings.view` |
| `/dashboard/settings/general` | `settings.edit` |
| `/dashboard/settings/appearance` | `settings.edit` |
| `/dashboard/settings/email` | `settings.edit` |
| `/dashboard/settings/security` | `settings.edit` |
| `/dashboard/settings/notifications` | `settings.edit` |
| `/dashboard/settings/integrations` | `settings.edit` |
| `/dashboard/settings/language` | `settings.edit` |
| `/dashboard/settings/features` | `features.manage` |
| `/dashboard/settings/backup` | `settings.edit` |

---

## API Reference

The API consists of **55 endpoints** following REST conventions.

### Users API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/[id]` | Get user by ID |
| PUT | `/api/users/[id]` | Update user |
| DELETE | `/api/users/[id]` | Delete user |
| GET | `/api/profile` | Get current user profile |
| POST | `/api/profile` | Update current user profile |
| PATCH | `/api/user/locale` | Update user language preference |

### Posts API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (with filters) |
| POST | `/api/posts` | Create new post |
| GET | `/api/posts/[id]` | Get post by ID |
| PUT | `/api/posts/[id]` | Update post |
| DELETE | `/api/posts/[id]` | Delete post |
| PUT | `/api/posts/[id]/seo` | Update post SEO metadata |

### Categories & Tags API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/categories` | List/Create categories |
| GET/PUT/DELETE | `/api/categories/[id]` | Manage category |
| GET/POST | `/api/tags` | List/Create tags |
| GET/PUT/DELETE | `/api/tags/[id]` | Manage tag |

### Media API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List media files |
| POST | `/api/media` | Upload media file |
| GET | `/api/media/[id]` | Get media details |
| DELETE | `/api/media/[id]` | Delete media file |
| GET/POST | `/api/media/folders` | List/Create folders |
| GET/DELETE | `/api/media/folders/[id]` | Manage folder |

### Notifications API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications` | Mark all as read |
| GET | `/api/notifications/[id]` | Get notification |
| PATCH | `/api/notifications/[id]` | Mark as read |
| DELETE | `/api/notifications/[id]` | Delete notification |
| GET | `/api/notifications/preferences` | Get preferences |
| POST | `/api/notifications/preferences` | Update preferences |
| POST | `/api/notifications/push/subscribe` | Subscribe to push |
| POST | `/api/notifications/push/unsubscribe` | Unsubscribe |
| GET | `/api/notifications/sse` | Server-Sent Events stream |

### Subscriptions & Plans API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/plans` | List/Create plans |
| GET/PUT/DELETE | `/api/plans/[id]` | Manage plan |
| GET/POST | `/api/subscriptions` | List/Create subscriptions |
| GET/PUT/DELETE | `/api/subscriptions/[id]` | Manage subscription |
| GET | `/api/subscriptions/me` | Get current user's subscription |
| GET | `/api/usage` | Get usage statistics |

### Stripe API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/checkout` | Create checkout session |
| GET | `/api/stripe/invoices` | List invoices |
| GET | `/api/stripe/portal` | Get customer portal URL |
| GET | `/api/stripe/status` | Get subscription status |
| POST | `/api/stripe/webhook` | Handle Stripe webhooks |

### Email API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/email/templates` | List/Create templates |
| GET/PUT/DELETE | `/api/email/templates/[id]` | Manage template |
| GET/POST | `/api/email/logs` | List/Create log entries |
| GET/DELETE | `/api/email/logs/[id]` | Manage log entry |
| POST | `/api/email/send` | Send email |

### Analytics API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/track` | Track page view |
| GET | `/api/analytics/export` | Export analytics data |
| GET | `/api/analytics/funnels` | Get funnel data |
| GET | `/api/analytics/geo` | Get geographic data |
| GET | `/api/analytics/retention` | Get retention metrics |

### System API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/roles` | List/Create roles |
| GET/PUT/DELETE | `/api/roles/[id]` | Manage role |
| GET | `/api/settings` | Get settings |
| PATCH | `/api/settings` | Update settings |
| GET | `/api/activity` | List activity logs |
| GET | `/api/search` | Global search |
| GET/POST | `/api/features` | List/Update feature flags |
| POST | `/api/onboarding` | Update onboarding progress |
| GET/POST | `/api/backups` | List/Create backups |
| GET/DELETE | `/api/backups/[id]` | Manage backup |
| POST | `/api/backups/restore` | Restore from backup |

---

## Components

### Provider Components (`src/components/providers/`)

| Provider | Purpose |
|----------|---------|
| `ThemeProvider` | Dark/light/system theme management |
| `SessionProvider` | NextAuth session context |
| `FaviconProvider` | Dynamic favicon from settings |
| `AnalyticsProvider` | Injects tracking pixels (GA4, GTM, Facebook, TikTok, Snapchat) |
| `SSEProvider` | Server-Sent Events connection for real-time updates |
| `TourProvider` | Guided onboarding tour (Shepherd.js) |
| `I18nProvider` | Internationalization context |
| `RTLProvider` | Right-to-left language support |

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `Header` | Top navigation bar with search and user menu |
| `Sidebar` | Main navigation sidebar |
| `MobileSidebar` | Responsive mobile navigation |
| `UserMenu` | User profile dropdown |
| `NotificationsDropdown` | Notification bell with real-time updates |
| `SearchCommand` | Command palette (Cmd+K) |
| `ThemeToggle` | Dark/light mode switcher |
| `StatsCard` | Dashboard metric card with icon |
| `DataTable` | Reusable data table with sorting/filtering |
| `ServerDataTable` | Server-side paginated data table |
| `RecentActivity` | Activity feed component |

### Chart Components (`src/components/dashboard/charts/`)

| Component | Purpose |
|-----------|---------|
| `AreaChart` | Area chart visualization |
| `LineChart` | Line chart for trends |
| `BarChart` | Bar chart comparison |
| `PieChart` | Pie/donut chart |

### Feature Components

| Location | Components |
|----------|------------|
| `activity/` | ActivityTimeline |
| `analytics/` | ExportButton, FunnelChart, GeoMap, RetentionChart, PageTracker |
| `billing/` | UpgradePrompt, UsageMeter |
| `auth/` | LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm |
| `editor/` | TipTapEditor, EditorToolbar |
| `i18n/` | LocaleSwitcher |
| `notifications/` | PushPermission |
| `onboarding/` | OnboardingChecklist, WelcomeModal |
| `settings/` | FeatureToggle |

### UI Components (`src/components/ui/`)

30+ shadcn/ui components including:
- Accordion, Alert, AlertDialog, Avatar
- Badge, Button, Card, Checkbox, Collapsible
- Dialog, DropdownMenu, Form, Input, Label
- Popover, Progress, RadioGroup, ScrollArea
- Select, Separator, Skeleton, Slot
- Switch, Table, Tabs, Toggle, Tooltip

---

## State Management

### Zustand Stores (`src/stores/`)

#### Sidebar Store
```typescript
// src/stores/sidebar-store.ts
interface SidebarStore {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapse: () => void
  toggleMobile: () => void
  closeMobile: () => void
}
// Persisted to localStorage
```

#### Notification Store
```typescript
// src/stores/notification-store.ts
interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}
```

#### SSE Store
```typescript
// src/stores/sse-store.ts
interface SSEStore {
  isConnected: boolean
  clientId: string | null
  reconnectAttempts: number
  lastEventTime: number | null
  setConnected: (connected: boolean) => void
  setClientId: (id: string) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
}
```

#### Features Store
```typescript
// src/stores/features-store.ts
interface FeaturesStore {
  features: Record<string, boolean>
  isLoading: boolean
  fetchFeatures: () => Promise<void>
  isEnabled: (key: string) => boolean
}
```

#### Onboarding Store
```typescript
// src/stores/onboarding-store.ts
interface OnboardingStore {
  completedSteps: string[]
  tourCompleted: boolean
  tourSkipped: boolean
  checklistHidden: boolean
  // Actions for managing onboarding state
}
```

#### Translations Store
```typescript
// src/stores/translations-store.ts
interface TranslationsStore {
  translations: Record<string, string>
  locale: string
  isLoading: boolean
  loadTranslations: (locale: string) => Promise<void>
  t: (key: string) => string
}
```

---

## Feature Flags

Feature flags allow controlled rollout of features without code changes.

### Available Features

| Key | Name | Default | Description |
|-----|------|---------|-------------|
| `realtime_notifications` | Real-time Notifications | Enabled | Server-Sent Events for instant notifications |
| `push_notifications` | Browser Push Notifications | Disabled | Push notifications when users are away |
| `i18n` | Multi-language Support | Disabled | Internationalization with RTL support |
| `advanced_analytics` | Advanced Analytics | Disabled | Geographic, retention, and funnel analysis |
| `stripe_billing` | Stripe Billing | Disabled | Payment and subscription management |
| `usage_limits` | Usage Limits & Quotas | Disabled | Resource usage tracking per plan |
| `onboarding_tour` | Onboarding Tour | Enabled | Interactive guided tour for new users |

### Usage

```typescript
// Check feature in API route
import { isFeatureEnabled } from "@/lib/features"

if (await isFeatureEnabled("advanced_analytics")) {
  // Feature-specific logic
}

// Check feature with plan requirement
const access = await checkFeatureAccess("stripe_billing", userPlanName)
if (!access.enabled) {
  return NextResponse.json({
    error: "Upgrade required",
    requiredPlan: access.requiresPlan
  }, { status: 403 })
}
```

### Feature Gates in Navigation

```typescript
// src/config/navigation.ts
{
  title: "Geography",
  href: "/dashboard/analytics/geo",
  icon: Globe,
  permission: PERMISSIONS.ANALYTICS_ADVANCED,
  feature: "advanced_analytics", // Only shown if feature is enabled
}
```

---

## Settings System

Settings are stored as key-value pairs with group organization.

### Setting Groups

| Group | Settings |
|-------|----------|
| `general` | Site name, title, description, logo, favicon |
| `appearance` | Theme, color scheme, custom CSS |
| `security` | Session timeout, password requirements |
| `email` | SMTP host, port, user, password, from address |
| `notifications` | Default notification preferences |
| `integrations` | Analytics pixels (GA, GTM, Facebook, TikTok, Snapchat) |

### Settings API

```typescript
// src/lib/settings.ts

// Get single setting
const siteName = await getSetting("siteName")

// Get multiple settings
const { siteName, siteTitle } = await getSettings(["siteName", "siteTitle"])

// Get all settings in a group
const emailSettings = await getSettingsByGroup("email")

// Update setting (via API)
await fetch("/api/settings", {
  method: "PATCH",
  body: JSON.stringify({ siteName: "My Dashboard" })
})
```

### Analytics Integration

The `AnalyticsProvider` injects tracking pixels based on settings:

```typescript
// Supported pixels
- Google Analytics 4 (ga4Id)
- Google Tag Manager (gtmId)
- Facebook Pixel (facebookPixelId)
- TikTok Pixel (tiktokPixelId)
- Snapchat Pixel (snapchatPixelId)
- Custom header/body scripts
```

---

## Email System

### Email Service

```typescript
// src/lib/email/service.ts

// Send email using template
await sendTemplatedEmail({
  to: "user@example.com",
  templateSlug: "welcome",
  variables: { name: "John", loginUrl: "https://..." }
})

// Send raw email
await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Message content</p>",
  text: "Message content"
})
```

### Default Templates

| Template | Purpose |
|----------|---------|
| `welcome` | New user welcome email |
| `password-reset` | Password reset link |
| `subscription-started` | Subscription confirmation |
| `subscription-cancelled` | Cancellation confirmation |
| `email-verification` | Email verification link |

### Template Variables

Templates support variable substitution:

```html
<!-- Template -->
<p>Hello {{name}},</p>
<p>Click here to reset: {{resetLink}}</p>

<!-- Variables definition -->
{
  "name": "string",
  "resetLink": "string"
}
```

### Email Logging

All sent emails are logged with:
- Status (PENDING, SENT, FAILED, BOUNCED)
- Recipient, subject, content
- Error message (if failed)
- Send timestamp
- Retry attempts

---

## Billing & Subscriptions

### Plan Structure

```typescript
interface Plan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  features: {
    maxUsers?: number
    maxStorage?: number      // in MB
    apiCalls?: number        // per month
    maxPosts?: number
    featureFlags?: string[]  // Enabled features
  }
  trialDays: number
  isPopular: boolean
}
```

### Stripe Integration

```typescript
// src/lib/stripe/

// Create checkout session
const session = await createCheckoutSession({
  userId: "...",
  planId: "...",
  billingPeriod: "MONTHLY"
})

// Handle webhooks
// - checkout.session.completed
// - invoice.paid
// - invoice.payment_failed
// - customer.subscription.updated
// - customer.subscription.deleted
```

### Usage Tracking

```typescript
// src/lib/usage/

// Track resource usage
await trackUsage(userId, "storage", byteCount)
await trackUsage(userId, "media_uploads", 1)
await trackUsage(userId, "api_calls", 1)
await trackUsage(userId, "posts", 1)

// Check limits
const { allowed, current, limit } = await checkLimit(userId, "posts")
if (!allowed) {
  return NextResponse.json({ error: "Post limit reached" }, { status: 403 })
}

// Get all limits for user
const limits = await getAllLimitsAndUsage(userId)
```

---

## Analytics

### Page View Tracking

```typescript
// Automatic tracking via PageTracker component
// Captures:
- Path
- User ID (if authenticated)
- Session ID
- User agent
- Referrer
- Country, city, region (via IP geolocation)
- Device type (desktop/mobile/tablet)
- Browser
- Duration
```

### Dashboard Statistics

```typescript
// src/lib/dashboard/analytics.ts

const stats = await getDashboardStats()
// Returns: totalUsers, totalPosts, activeSubscriptions, monthlyRevenue

const growth = await getUserGrowthData()
// Returns: monthly user registration counts

const pageViews = await getPageViewTrends()
// Returns: daily page view counts

const topPages = await getTopPages(10)
// Returns: most visited pages with counts

const activeUsers = await getActiveUsers()
// Returns: users active in last 24h, 7d, 30d
```

### Advanced Analytics

Requires `advanced_analytics` feature flag.

#### Geographic Analysis
```typescript
const geoData = await getGeographicData()
// Returns: visitors by country with counts
```

#### Retention Analysis
```typescript
const retention = await getRetentionData()
// Returns: cohort retention rates over time
```

#### Funnel Analysis
```typescript
const funnels = await getFunnelData("signup")
// Returns: conversion rates at each funnel step
```

#### Data Export
```typescript
// Export formats: CSV, JSON
GET /api/analytics/export?format=csv&dateFrom=2024-01-01&dateTo=2024-01-31
```

---

## Internationalization (i18n)

### Supported Languages

| Code | Language | RTL |
|------|----------|-----|
| `en` | English | No |
| `ar` | Arabic | Yes |
| `zh` | Chinese | No |
| `hi` | Hindi | No |
| `ja` | Japanese | No |
| `de` | German | No |
| `ru` | Russian | No |
| `id` | Indonesian | No |
| `fr` | French | No |

### Translation Files

Located in `/public/messages/{locale}.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {{name}}"
  }
}
```

### Usage

```typescript
// In components
const { t } = useTranslations()
return <h1>{t("dashboard.title")}</h1>

// With variables
return <p>{t("dashboard.welcome", { name: user.name })}</p>
```

### RTL Support

The `RTLProvider` automatically:
- Sets `dir="rtl"` on the document for Arabic
- Adjusts layout direction
- Mirrors UI components appropriately

---

## Notifications

### Notification Types

| Type | Usage |
|------|-------|
| `INFO` | General information |
| `SUCCESS` | Successful operations |
| `WARNING` | Warnings and alerts |
| `ERROR` | Error notifications |

### Notification Categories

| Category | Examples |
|----------|----------|
| `SYSTEM` | System updates, maintenance |
| `POST` | Post published, commented |
| `USER` | User joined, role changed |
| `SUBSCRIPTION` | Plan upgraded, trial ending |
| `SECURITY` | Password changed, new login |
| `COMMENT` | New comments on posts |

### Notification Templates

```typescript
// src/lib/notifications.ts
await NotificationTemplates.postPublished(userId, postTitle)
await NotificationTemplates.welcome(userId)
await NotificationTemplates.subscriptionStarted(userId, planName)
await NotificationTemplates.passwordChanged(userId)
```

### Real-time Delivery

Server-Sent Events provide instant notification delivery:

```typescript
// SSE endpoint: /api/notifications/sse
// Events: notification, heartbeat
```

### Push Notifications

Web Push API for notifications when user is away:

```typescript
// Subscribe
POST /api/notifications/push/subscribe
{ endpoint, keys: { p256dh, auth } }

// Send push (server-side)
await sendPushNotification(userId, {
  title: "New message",
  body: "You have a new notification"
})
```

---

## Media Library

### Features

- **File Upload** - Drag & drop or click to upload
- **Folder Organization** - Hierarchical folder structure
- **Image Metadata** - Width, height, file size tracking
- **Search & Filter** - By name, type, date
- **Bulk Operations** - Select multiple files

### Supported Operations

```typescript
// Upload file
POST /api/media
// FormData with file

// Get media with filters
GET /api/media?folderId=xxx&type=image&search=logo

// Create folder
POST /api/media/folders
{ name: "Images", parentId: null }

// Move to folder
PUT /api/media/[id]
{ folderId: "new-folder-id" }
```

### File Types

Files are categorized by MIME type:
- Images: `image/*`
- Documents: `application/pdf`, `application/msword`, etc.
- Videos: `video/*`
- Audio: `audio/*`

---

## SEO Tools

### Post SEO Metadata

Each post can have SEO metadata:

```typescript
interface SeoMeta {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonicalUrl: string
  noIndex: boolean
  noFollow: boolean
}
```

### URL Redirects

```typescript
interface Redirect {
  source: string      // e.g., "/old-page"
  destination: string // e.g., "/new-page"
  statusCode: 301 | 302
  isActive: boolean
  hitCount: number    // Automatic tracking
}
```

---

## Onboarding

### Guided Tour

8-step interactive tour using Shepherd.js:

1. Welcome introduction
2. Dashboard overview
3. Navigation sidebar
4. Creating posts
5. Media library
6. User settings
7. Analytics
8. Getting help

### Onboarding Checklist

5 tasks to complete setup:

1. Complete profile information
2. Create first post
3. Upload media
4. Invite team member
5. Configure settings

### Progress Tracking

```typescript
// src/stores/onboarding-store.ts
interface OnboardingState {
  completedSteps: string[]
  tourCompleted: boolean
  tourSkipped: boolean
  checklistHidden: boolean
}

// Update progress
POST /api/onboarding
{ completedStep: "create_post" }
```

---

## Configuration

### Navigation (`src/config/navigation.ts`)

```typescript
export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        permission: PERMISSIONS.ANALYTICS_VIEW
      },
    ]
  },
  // ... more groups
]
```

### Permissions (`src/config/permissions.ts`)

Defines all 42 permissions and default role assignments.

### Onboarding (`src/config/onboarding.ts`)

Defines tour steps and checklist items.

---

## Activity Logging

### Log Entry Structure

```typescript
interface ActivityLog {
  userId: string
  action: string       // "create", "update", "delete", "login", etc.
  entity: string       // "Post", "User", "Setting", etc.
  entityId: string
  description: string
  metadata: object     // Additional context
  ipAddress: string
  userAgent: string
  createdAt: Date
}
```

### Usage

```typescript
// src/lib/activity.ts
await logActivity({
  userId: session.user.id,
  action: "create",
  entity: "Post",
  entityId: post.id,
  description: `Created post "${post.title}"`,
  metadata: { status: post.status }
})
```

---

## Summary

Dashboard Starter provides a complete, production-ready foundation for SaaS applications with:

- **32 database models** covering all major features
- **55 API endpoints** with full CRUD operations
- **42 permissions** for fine-grained access control
- **7 feature flags** for controlled rollout
- **9 supported languages** with RTL support
- **Real-time notifications** via SSE and Web Push
- **Full Stripe integration** for billing
- **Comprehensive audit logging**
- **Advanced analytics** with geographic and retention analysis

The modular architecture allows easy customization and extension while maintaining clean separation of concerns.

---

*Generated for Dashboard Starter v0.1.0*

# 🏗️ Repository Architecture Documentation

## 📋 **Overview**

Dokumen ini menjelaskan arsitektur saat ini dari repositori Nuxt.js boilerplate, termasuk struktur komponen, aliran data, dan pola desain yang digunakan.

## 🏛️ **High-Level Architecture**

### **Technology Stack**

- **Frontend Framework**: Nuxt.js 3 dengan Vue.js 3
- **Styling**: Tailwind CSS
- **TypeScript**: Untuk type safety
- **Testing**: Vitest dengan Vue Test Utils
- **Build Tool**: Vite
- **Package Manager**: npm (sedang dalam proses standardisasi)

### **Project Structure**

```
nuxtjs-boilerplate/
├── app/                          # App configuration and error handling
│   ├── error.vue                # Global error boundary
│   └── app.vue                  # Root application component
├── assets/                       # Static assets
│   └── css/
│       └── main.css             # Global styles
├── components/                   # Vue components
│   ├── __tests__/               # Component tests
│   ├── ResourceCard.vue         # Resource display card
│   ├── SearchBar.vue            # Search functionality
│   ├── ResourceFilters.vue      # Filtering interface
│   └── [other components]
├── composables/                  # Vue composables (business logic)
│   ├── useResources.ts          # Main resource management
│   ├── useResourceData.ts       # Data loading and caching
│   ├── useResourceFilters.ts    # Filtering logic
│   ├── useResourceSearch.ts     # Search functionality
│   └── [other composables]
├── pages/                        # Nuxt.js pages
│   ├── index.vue                # Home page
│   ├── search.vue               # Search page
│   ├── about.vue                # About page
│   └── resources/
│       └── [id].vue             # Resource detail page
├── server/                       # Server-side code
│   ├── api/                     # API routes
│   │   └── v1/                  # API version 1
│   │       ├── resources.get.ts # Resources endpoint
│   │       ├── search.get.ts    # Search endpoint
│   │       └── [other endpoints]
│   ├── plugins/                 # Server plugins
│   │   ├── security-headers.ts  # CSP and security headers
│   │   └── resource-validation.ts
│   └── utils/                   # Server utilities
│       ├── enhanced-cache.ts    # Caching system
│       └── enhanced-rate-limit.ts
├── types/                        # TypeScript type definitions
│   ├── resource.ts              # Resource interface
│   ├── tag.ts                   # Tag interfaces
│   └── submission.ts            # Submission types
├── utils/                        # Client utilities
│   ├── analytics.ts             # Analytics helpers
│   ├── sanitize.ts              # XSS protection
│   ├── tags.ts                  # Tag utilities
│   └── [other utilities]
└── docs/                         # Documentation
    ├── roadmap.md                # Project roadmap
    ├── tasks.md                  # Task management
    └── [other docs]
```

## 🔄 **Data Flow Architecture**

### **Resource Data Flow**

```
Data Sources (JSON/API)
    ↓
Server API Routes (/api/v1/*)
    ↓
useResourceData Composable
    ↓
useResources Main Composable
    ↓
Components (ResourceCard, SearchBar, etc.)
    ↓
User Interface
```

### **Search and Filter Flow**

```
User Input (SearchBar/Filters)
    ↓
useResourceSearch/useResourceFilters
    ↓
Fuse.js Search Engine
    ↓
Filtered Results
    ↓
Component Rendering
```

## 🧩 **Component Architecture**

### **Core Components**

#### **ResourceCard.vue**

- **Purpose**: Menampilkan resource individual
- **Props**: `resource` (Resource object)
- **Features**: Bookmarking, sharing, rating
- **Dependencies**: useBookmarks composable

#### **SearchBar.vue**

- **Purpose**: Interface pencarian
- **Features**: Autocomplete, search history
- **Dependencies**: useResourceSearch composable

#### **ResourceFilters.vue**

- **Purpose**: Interface filtering
- **Features**: Multi-select filters, dynamic counts
- **Dependencies**: useResourceFilters composable

### **Layout Components**

#### **default.vue**

- **Purpose**: Main layout wrapper
- **Features**: Navigation, footer, global state
- **SEO**: Meta tags management

## 🔧 **Composable Architecture**

### **useResources.ts (Main Composable)**

- **Purpose**: Menggabungkan semua resource functionality
- **Size**: 164 lines (perlu refactoring)
- **Responsibilities**: Data loading, filtering, searching, sorting
- **Issue**: Terlalu kompleks, melanggar Single Responsibility Principle

### **useResourceData.ts**

- **Purpose**: Data loading dan caching
- **Features**: API calls, error handling, retry logic
- **Dependencies**: Nuxt's useFetch, useAsyncData

### **useResourceSearch.ts**

- **Purpose**: Search functionality
- **Engine**: Fuse.js
- **Features**: Full-text search, highlighting, suggestions

### **useResourceFilters.ts**

- **Purpose**: Filtering logic
- **Features**: Multi-select filters, category filtering
- **State Management**: Reactive filter state

## 🗄️ **Data Architecture**

### **Resource Data Structure**

```typescript
interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[]
  hierarchicalTags?: readonly HierarchicalTag[]
  technology: readonly string[]
  dateAdded: string
  lastUpdated?: string
  popularity: number
  viewCount?: number
  rating?: number
  screenshots?: readonly string[]
  specifications?: Record<string, string>
  features?: readonly string[]
  limitations?: readonly string[]
  platforms?: readonly string[]
  license?: string
  icon?: string
}
```

### **API Architecture**

#### **Resources Endpoint** (`/api/v1/resources`)

- **Method**: GET
- **Parameters**: limit, offset, category, pricing, difficulty, search, sort
- **Response**: Paginated resource list with metadata
- **Caching**: 300 seconds with cache invalidation

#### **Search Endpoint** (`/api/v1/search`)

- **Method**: GET
- **Parameters**: q (query), filters, sort
- **Response**: Search results with highlighting
- **Features**: Advanced search operators

## 🔒 **Security Architecture**

### **Content Security Policy (CSP)**

- **Implementation**: Nonce-based CSP
- **Location**: `server/plugins/security-headers.ts`
- **Issue**: Duplication dengan nuxt.config.ts (perlu konsolidasi)

### **Input Sanitization**

- **Library**: DOMPurify dan xss library
- **Purpose**: XSS prevention
- **Implementation**: Di utils/sanitize.ts

### **Rate Limiting**

- **Implementation**: Enhanced rate limiting
- **Location**: `server/utils/enhanced-rate-limit.ts`
- **Features**: Path-based limits, IP tracking

## 🎨 **Styling Architecture**

### **Tailwind CSS Configuration**

- **Purging**: Otomatis untuk production
- **Customization**: Di `tailwind.config.js`
- **Components**: Utility-first approach

### **CSS Organization**

- **Global Styles**: `assets/css/main.css`
- **Component Styles**: Tailwind utilities
- **Responsive**: Mobile-first design

## 🧪 **Testing Architecture**

### **Test Framework**

- **Unit Tests**: Vitest dengan Vue Test Utils
- **Environment**: happy-dom
- **Coverage**: Target 80%+
- **Status**: 🔴 Perlu perbaikan (dependencies tidak terinstall)

### **Test Structure**

```
__tests__/
├── components/          # Component tests
├── composables/         # Composable tests
├── utils/              # Utility tests
└── pages/              # Page tests
```

## 🚀 **Performance Architecture**

### **Caching Strategy**

- **Server-side**: Enhanced cache dengan tag-based invalidation
- **Client-side**: Browser caching untuk static assets
- **API**: Response caching untuk endpoint yang stabil

### **Bundle Optimization**

- **Code Splitting**: Otomatis oleh Nuxt/Vite
- **Tree Shaking**: Dependencies optimization
- **Image Optimization**: Nuxt Image module

### **PWA Features**

- **Service Worker**: Workbox integration
- **Manifest**: PWA manifest configuration
- **Caching**: Offline-first strategy

## 🔧 **Development Workflow Architecture**

### **Git Workflow**

- **Main Branch**: `main` (production)
- **Feature Branches**: Topic-based branching
- **Pull Requests**: Code review required

### **CI/CD Pipeline**

- **GitHub Actions**: Automated testing dan deployment
- **Linting**: ESLint dan Prettier
- **Security**: Automated security scanning
- **Status**: 🔴 Perlu perbaikan (build system broken)

## 📊 **Monitoring and Analytics**

### **Performance Monitoring**

- **Web Vitals**: Core Web Vitals tracking
- **Bundle Analysis**: Rollup plugin visualizer
- **Error Tracking**: Custom error logging

### **User Analytics**

- **Search Analytics**: Search query tracking
- **Resource Analytics**: Resource usage tracking
- **User Behavior**: Interaction tracking

## 🚨 **Current Architecture Issues**

### **Critical Issues**

1. **Build System Broken** - Dependencies tidak terinstall
2. **ESLint Configuration** - Flat config tidak terdeteksi
3. **Test Framework** - Vitest tidak functional

### **Design Issues**

1. **Composable Complexity** - useResources terlalu besar
2. **Code Duplication** - Route rules duplikat
3. **Security Configuration** - CSP duplikat

### **Maintenance Issues**

1. **Documentation Misalignment** - Dokumen tidak sesuai implementasi
2. **Inconsistent Patterns** - Error handling tidak standar
3. **Type Safety** - TypeScript strict mode tidak aktif

## 🎯 **Architecture Improvement Plan**

### **Phase 1: Infrastructure Repair**

- Fix build system dan dependencies
- Restore test framework
- Stabilize development environment

### **Phase 2: Code Quality**

- Refactor composables
- Eliminate code duplication
- Standardize patterns

### **Phase 3: Security & Performance**

- Harden security configuration
- Optimize performance
- Enhance monitoring

### **Phase 4: Documentation**

- Align documentation dengan code
- Create comprehensive guides
- Improve developer experience

---

## 📋 **Conclusion**

Arsitektur repository ini memiliki fondasi yang solid dengan Nuxt.js 3, tetapi memerlukan perbaikan kritis pada build system dan optimasi arsitektur untuk meningkatkan maintainability dan developer experience.

**Architecture Health**: 🟡 **Needs Optimization** - Good foundation but requires refactoring and hardening.

---

**Document Updated**: 2025-11-29
**Architect**: Project Orchestrator
**Next Review**: 2025-12-01
**Status**: ✅ **ARCHITECTURE DOCUMENTATION UPDATED**

🏗️ **REPOSITORY ARCHITECTURE CLEARLY DEFINED**

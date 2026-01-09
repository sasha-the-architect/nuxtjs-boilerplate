# Getting Started

This guide will help you set up the Nuxt.js boilerplate for development and deployment. This is a comprehensive foundation for building resource directory and community-driven web applications with advanced features.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (recommended) or pnpm
- **Git**: For version control
- **Code Editor**: VS Code (recommended) with Vue extensions

### Optional Tools

- **Vue DevTools**: Browser extension for Vue development
- **Nuxt DevTools**: Built-in development tools

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate
```

### 2. Install Dependencies

**Using npm (Recommended):**

```bash
npm install
```

> **Note**: The project uses `packageManager: npm` in package.json, so npm is the recommended package manager.

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Development
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME="Free Stuff Website"

# Optional: Analytics and monitoring
NUXT_PUBLIC_GA_ID=""
NUXT_PUBLIC_SENTRY_DSN=""
```

## 🛠️ Development

### Start Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

The development server will start at `http://localhost:3000`.

### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Analysis
npm run analyze      # Analyze bundle size
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── __tests__/         # Test files and factories
├── app/               # Application entry point
├── assets/            # Static assets (CSS, images)
│   └── css/           # Global stylesheets
├── components/        # Vue components
│   ├── ResourceCard.vue     # Display individual resources
│   ├── SearchBar.vue        # Search functionality
│   ├── ResourceFilters.vue  # Resource filtering
│   └── ...                # Additional UI components
├── composables/       # Vue composables (useResources, useUrlSync, etc.)
├── docs/              # Project documentation
├── layouts/           # Nuxt layouts
│   └── default.vue   # Main layout with header and footer
├── pages/             # Vue pages (auto-routing)
│   ├── index.vue     # Home page with resource grid and search
│   ├── search.vue    # Search results page
│   ├── submit.vue    # Resource submission page
│   ├── compare/      # Resource comparison pages
│   └── ...           # Additional pages
├── plugins/           # Nuxt plugins
├── public/            # Public static files
├── server/            # Server-side API routes and middleware
│   ├── api/          # API endpoints
│   ├── middleware/   # Server middleware
│   └── utils/        # Server utilities
├── types/             # TypeScript type definitions
├── utils/             # Client-side utilities
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 🎨 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit files in the appropriate directories
- Follow the coding standards outlined in [Development Guidelines](./development.md)
- Test your changes locally

### 3. Run Quality Checks

```bash
npm run lint
npm run format
npm run test  # When tests are implemented
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## 🔧 Configuration

### Nuxt Configuration

The main configuration is in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  routeRules: {
    '/': { prerender: true },
  },
})
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in the `tailwind.config.js` file (auto-generated).

### ESLint and Prettier

- **ESLint**: Code linting and error detection
- **Prettier**: Code formatting
- **Stylelint**: CSS/SCSS linting

Configuration files:

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.stylelintrc` - Stylelint configuration

## 🚀 Current Features and Capabilities (2025-11-29)

### Implemented Features

**✅ Robust Infrastructure:**

- **Modern Build System**: Fully configured Nuxt 3 with TypeScript and ESLint
- **Testing Framework**: Comprehensive test coverage with Vitest
- **Security**: XSS protection, CSP headers, and authentication security

#### 1. User Management

- **Authentication System**: Complete registration, login, and profile management
- **Role-based Access**: User, moderator, and admin permissions
- **Profile Dashboard**: User management interface with activity tracking

#### 2. Resource Management

- **Submission System**: User resource submissions with moderation queue
- **Advanced Search**: Full-text search with filtering, sorting, and faceted search
- **Comparison Tools**: Side-by-side resource comparison functionality

#### 3. Community Features

- **User Engagement**: Comments, voting, and rating systems
- **Moderation Tools**: Content flagging and approval workflows
- **Feedback System**: Customer feedback collection and tracking

#### 4. Analytics and Monitoring

- **Search Analytics**: Comprehensive search tracking and performance metrics
- **Usage Analytics**: User behavior and engagement tracking
- **Resource Health**: Monitoring and status tracking

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. ESLint Configuration Not Found

```bash
# Check ESLint version and configuration
npx eslint --version
ls -la eslint.config.js
```

#### 3. Build Fails

```bash
# Clean build
rm -rf .nuxt .output
npm build
```

#### 4. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### 5. Test Framework Issues

```bash
# If Vitest fails, check dependencies
npm list vitest
npm install --save-dev vitest@latest
```

### Getting Help

- Check the [Troubleshooting Guide](./maintenance/troubleshooting.md)
- Review [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
- Consult [Nuxt Documentation](https://nuxt.com/docs)

## 📚 Next Steps

- Read the [Development Guidelines](./development.md)
- Explore the [Architecture Documentation](./architecture/README.md)
- Check [Deployment Guides](./deployment/README.md)

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./development.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📋 Current Development Status

### ✅ Major Features Completed

- **User Authentication System**: Complete with profiles and roles
- **Advanced Search**: Full-text search with faceted filtering
- **Resource Management**: Submission, moderation, and comparison tools
- **Community Features**: Comments, voting, and feedback systems
- **Analytics**: Comprehensive tracking and performance monitoring

### 🔄 Active Development Areas

- Continuous security improvements and XSS protection
- Performance optimization and caching strategies
- Enhanced accessibility compliance
- API documentation and developer experience
- Mobile responsiveness improvements

### 📞 Getting Help

- Check the [Troubleshooting Guide](./maintenance/troubleshooting.md)
- Review [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
- Consult [Nuxt Documentation](https://nuxt.com/docs)
- Check [Project Management](./project-management.md) for current priorities

---

_Last Updated: 2026-01-09_

# Getting Started

This guide will help you set up the "Free Stuff on the Internet" project for development and deployment. This is a comprehensive directory of free resources for developers, students, and tech enthusiasts.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Package Manager**: pnpm (recommended) or npm
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

**Using pnpm (Recommended):**

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

**Using npm:**

```bash
npm install
```

> **Note**: The project uses `pnpm-lock.yaml`, so pnpm is the recommended package manager.

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
# Using pnpm
pnpm dev

# Using npm
npm run dev
```

The development server will start at `http://localhost:3000`.

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier

# Testing (when implemented)
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
│   └── css/           # Global stylesheets
├── components/        # Vue components
│   ├── ResourceCard.vue     # Display individual resources
│   ├── SearchBar.vue        # Search functionality
│   └── ResourceFilters.vue  # Resource filtering
├── layouts/           # Nuxt layouts
│   └── default.vue   # Main layout with header and footer
├── pages/             # Vue pages (auto-routing)
│   ├── index.vue     # Home page with resource grid and search
│   ├── ai-keys.vue   # AI tools and resources page
│   ├── about.vue     # About page
│   ├── search.vue    # Search results page
│   └── submit.vue    # Resource submission page
├── composables/       # Vue composables (useResources, useUrlSync)
├── plugins/           # Nuxt plugins
│   └── performance.client.ts  # Performance monitoring
├── data/              # Resource data files (JSON)
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
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
pnpm lint
pnpm format
pnpm test  # When tests are implemented
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

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. ESLint Configuration Not Found

```bash
# Check ESLint version and configuration
npx eslint --version
ls -la .eslintrc.*
```

#### 3. Build Fails

```bash
# Clean build
rm -rf .nuxt .output
pnpm build
```

#### 4. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev --port 3001
```

### Getting Help

- Check the [Troubleshooting Guide](./maintenance/troubleshooting.md)
- Review [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
- Consult [Nuxt Documentation](https://nuxt.com/docs)

## 📚 Next Steps

- Read the [Development Guidelines](./development.md)
- Explore the [Architecture Documentation](./architecture/)
- Check [Deployment Guides](./deployment/)

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./development.md) for details on our code of conduct and the process for submitting pull requests.

---

_Last Updated: 2025-11-19_

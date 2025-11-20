# Nuxt.js Boilerplate

A modern, production-ready [Nuxt.js](https://nuxt.com) boilerplate with best practices, security scanning, and comprehensive documentation.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cpa02cmz/nuxtjs-boilerplate)

[![Security Scan](https://github.com/cpa02cmz/nuxtjs-boilerplate/workflows/Security%20Scan/badge.svg)](https://github.com/cpa02cmz/nuxtjs-boilerplate/actions/workflows/security.yml)
[![CI/CD Pipeline](https://github.com/cpa02cmz/nuxtjs-boilerplate/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/cpa02cmz/nuxtjs-boilerplate/actions/workflows/ci.yml)

_Live Example: <https://nuxtjs-boilerplate.vercel.app>_

Look at the [Nuxt 3 documentation](https://nuxt.com/docs) to learn more.

## 🚀 Features

- ⚡ **Nuxt 3** with Vue 3 and TypeScript
- 🎨 **Tailwind CSS** for styling
- 📦 **ESLint & Prettier** for code quality
- 🔒 **Security scanning** with CodeQL and dependency review
- 📚 **Comprehensive documentation**
- 🚀 **Performance optimizations**
- ♿ **Accessibility standards**
- 🔄 **CI/CD pipeline**

## 📋 Setup

- **Node.js**: Version 18.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Git**: For version control

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate
```
2. **Install dependencies**

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install
```

> **Note**: The project uses `pnpm-lock.yaml`, so pnpm is the recommended package manager.

3. **Start development server**

```bash
pnpm dev
```

The application will be available at <http://localhost:3000>

## 📋 Available Scripts

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev
```

The application will be available at <http://localhost:3000>

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
├── components/        # Vue components
├── layouts/           # Nuxt layouts
├── pages/             # Vue pages (auto-routing)
├── plugins/           # Nuxt plugins
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Detailed setup and development guide
- **[Development Guidelines](./docs/development.md)** - Coding standards and conventions
- **[Architecture](./docs/architecture/README.md)** - System design and project structure
- **[Deployment](./docs/deployment/README.md)** - Platform-specific deployment instructions
- **[Roadmap](./docs/roadmap.md)** - Project development roadmap and milestones



The application will be available at <http://localhost:3000>

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
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
├── components/        # Vue components
├── layouts/           # Nuxt layouts
├── pages/             # Vue pages (auto-routing)
├── plugins/           # Nuxt plugins
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./docs/development.md) for details on:

- **[Getting Started](./docs/getting-started.md)** - Detailed setup and development guide
- **[Development Guidelines](./docs/development.md)** - Coding standards and best practices
- **[Architecture](./docs/architecture/)** - System design and technical decisions
- **[Deployment](./docs/deployment/)** - Platform-specific deployment instructions
- **[Maintenance](./docs/maintenance/)** - CI/CD and troubleshooting guides

## 🐛 Troubleshooting

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

The application will be available at <http://localhost:3000>

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
├── components/        # Vue components
├── layouts/           # Nuxt layouts
├── pages/             # Vue pages (auto-routing)
├── plugins/           # Nuxt plugins
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 🧪 Technology Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) - Vue.js Meta Framework
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- **Linting**: ESLint + Prettier + Stylelint
- **Type Safety**: TypeScript support

## 📚 Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [Development Guidelines](./docs/development.md)
- [Project Architecture](./docs/architecture/README.md)
- [Deployment Guide](./docs/deployment/README.md)

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./docs/development.md) for details on our code of conduct and the process for submitting pull requests.

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. ESLint Configuration Issues

```bash
# Check ESLint version and configuration
npx eslint --version
pnpm run lint:fix
```

#### 3. Build Fails

```bash
# Clean build
rm -rf .nuxt .output
pnpm build
```

For more troubleshooting, see our [Troubleshooting Guide](./docs/maintenance/troubleshooting.md).

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. ESLint Configuration Issues

```bash
# Check ESLint version and configuration
npx eslint --version
pnpm run lint:fix
```

#### 3. Build Fails

```bash
# Clean build
rm -rf .nuxt .output
pnpm build
```

For more troubleshooting, see our [Troubleshooting Guide](./docs/maintenance/troubleshooting.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community

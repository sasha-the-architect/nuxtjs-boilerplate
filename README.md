# 🆓 Free Stuff on the Internet

A curated platform that helps developers, students, and tech enthusiasts discover and access valuable free resources across various categories including AI tools, cloud services, hosting, databases, and more.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://your-demo-url.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt Version](https://img.shields.io/badge/Nuxt-3.8.2-00DC82)](https://nuxt.com/)
[![Vue Version](https://img.shields.io/badge/Vue-3.3.8-4FC08D)](https://vuejs.org/)

Built with [Nuxt 3](https://nuxt.com) and [Tailwind CSS](https://tailwindcss.com) for optimal performance and developer experience.

## 🚀 Quick Start

### Prerequisites

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community
# 🆓 Free Stuff Website

A curated platform that helps developers, students, and tech enthusiasts discover and access valuable free resources across various categories including AI tools, cloud services, hosting, databases, and more.

Built with [Nuxt.js](https://nuxt.com) 3 and Tailwind CSS for a modern, responsive experience.

## 🚀 Features

- **Curated Resources**: Hand-picked collection of free tools and services
- **Category Organization**: Resources organized by category and tags
- **Search & Filter**: Find exactly what you need quickly
- **Responsive Design**: Works seamlessly on all devices
- **Modern Stack**: Built with the latest web technologies

## 🛠️ Tech Stack

- **Framework**: [Nuxt.js 3](https://nuxt.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Package Manager**: pnpm
- **Deployment**: Vercel/Netlify ready
- **Code Quality**: ESLint, Prettier, Stylelint

## 📋 Prerequisites

- **Node.js**: Version 18.0 or higher
- **Package Manager**: pnpm (recommended)
- **Git**: For version control

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

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect and deploy your Nuxt.js app

### Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `pnpm build`
4. Set publish directory: `.output/public`

### Manual Deployment

```bash
# Build for production
pnpm build

# Preview the build
pnpm preview
```

For more deployment options, check the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./docs/development.md) for details on:

- Code standards and conventions
- Git workflow
- Testing practices
- Pull request process

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Detailed setup and development guide
- **[Development Guidelines](./docs/development.md)** - Coding standards and best practices
- **[Architecture](./docs/architecture/)** - System design and technical decisions
- **[Deployment](./docs/deployment/)** - Platform-specific deployment instructions
- **[Maintenance](./docs/maintenance/)** - CI/CD and troubleshooting guides

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

## 🙏 Acknowledgments

- Built with [Nuxt.js](https://nuxt.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons and illustrations from various open-source projects

---

_If you find this project helpful, please give it a ⭐ on GitHub!_

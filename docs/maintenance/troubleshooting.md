# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with Nuxt.js boilerplate.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Testing Issues](#testing-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Security Issues](#security-issues)

## 🔧 Installation Issues

### Dependencies Not Installing

**Symptom**: `npm install` fails with errors

**Common Causes**:

- Node.js version incompatibility
- Network issues
- NPM cache corruption
- Lockfile conflicts

**Solutions**:

#### 1. Check Node.js Version

```bash
node --version  # Should be 18.0 or higher

# If too old, install latest LTS
nvm install --lts
nvm use --lts
```

#### 2. Clear NPM Cache

```bash
npm cache clean --force
```

#### 3. Delete node_modules and Lockfile

```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. Use Legacy Peer Dependencies

```bash
npm install --legacy-peer-deps
```

#### 5. Check Network Proxy

If behind corporate firewall:

```bash
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080
```

### Git Clone Issues

**Symptom**: `git clone` fails with authentication or network errors

**Solutions**:

```bash
# Check git config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Clone using HTTPS (no authentication)
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git

# Clone using SSH (requires SSH key)
git clone git@github.com:cpa02cmz/nuxtjs-boilerplate.git
```

## 💻 Development Server Issues

### Port Already in Use

**Symptom**: `npm run dev` fails with "Address already in use"

**Solutions**:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### HMR Not Working

**Symptom**: Changes not reflecting in browser

**Solutions**:

#### 1. Clear Nuxt Cache

```bash
rm -rf .nuxt
npm run dev
```

#### 2. Check File Watching Limits

```bash
# Increase file watch limit (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### 3. Disable HMR Temporarily

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    server: {
      hmr: false,
    },
  },
})
```

### Server Won't Start

**Symptom**: Development server starts but crashes immediately

**Solutions**:

```bash
# Check error logs
npm run dev

# Verify port availability
netstat -tulpn | grep 3000

# Check environment variables
printenv | grep NUXT

# Run with debug output
DEBUG=nuxt:* npm run dev
```

## 🏗️ Build Issues

### Build Fails

**Symptom**: `npm run build` fails with errors

**Solutions**:

#### 1. Clear Build Artifacts

```bash
rm -rf .nuxt .output
npm run build
```

#### 2. Check TypeScript Errors

```bash
npm run typecheck
# Fix all type errors before building
```

#### 3. Check ESLint Errors

```bash
npm run lint
# Fix linting errors
npm run lint:fix
```

#### 4. Increase Memory Limit

```bash
# Node.js 18+
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Type Errors

**Symptom**: TypeScript compilation fails with type errors

**Solutions**:

#### 1. Update Type Definitions

```bash
npm install --save-dev @types/node
```

#### 2. Check tsconfig.json

```json
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

#### 3. Regenerate Prisma Types

```bash
npm run prisma:generate
```

### Linting Errors

**Symptom**: ESLint or Prettier errors preventing build

**Solutions**:

```bash
# Auto-fix linting errors
npm run lint:fix

# Auto-format code
npm run format

# Skip linting (not recommended)
npm run build -- --no-lint
```

## ⚡ Runtime Errors

### Page Not Found (404)

**Symptom**: Browser shows 404 error

**Solutions**:

#### 1. Check File Structure

```bash
# Verify pages directory
ls -la pages/

# Verify page file exists
ls -la pages/index.vue
```

#### 2. Check Route Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pages: true,
  },
})
```

#### 3. Clear Nuxt Cache

```bash
rm -rf .nuxt
npm run dev
```

### Hydration Mismatch

**Symptom**: "Hydration mismatch" errors in console

**Causes**:

- Client-only content rendered on server
- Date/time differences between server and client
- Random values rendered differently

**Solutions**:

```vue
<template>
  <!-- Use ClientOnly for client-only components -->
  <ClientOnly>
    <ClientSideComponent />
  </ClientOnly>

  <!-- Or use process.client -->
  <div v-if="process.client">Client-side content</div>
</template>
```

### Component Not Rendering

**Symptom**: Component imported but not displayed

**Solutions**:

#### 1. Check Import Path

```vue
<script setup>
// Wrong path
import ResourceCard from '~/components/ResourceCard.vue'

// Correct path (auto-imported)
// No import needed for components/ directory
</script>
```

#### 2. Check Component Name

```vue
<template>
  <!-- Component name must match file name -->
  <ResourceCard />
</template>
```

#### 3. Check Component Registration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: {
    dirs: ['~/components', '~/components/ui'],
  },
})
```

## 🚀 Performance Issues

### Slow Page Load

**Symptom**: Pages take long time to load

**Solutions**:

#### 1. Enable Pre-rendering

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/resources': { isr: 60 }, // 60 seconds ISR
  },
})
```

#### 2. Optimize Images

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    format: ['webp', 'avif'],
    quality: 80,
  },
})
```

#### 3. Enable Compression

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
  },
})
```

#### 4. Lazy Load Components

```vue
<template>
  <!-- Lazy load heavy component -->
  <LazyResourceCard v-if="showCard" />
</template>
```

### High Memory Usage

**Symptom**: Application consumes excessive memory

**Solutions**:

```bash
# Monitor memory usage
node --inspect your-app.js

# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Profile memory
npm run build -- --profile
```

### Bundle Size Too Large

**Symptom**: JavaScript bundle is too large

**Solutions**:

#### 1. Analyze Bundle

```bash
npm run analyze
```

#### 2. Enable Code Splitting

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  build: {
    splitChunks: {
      chunks: 'all',
      maxSize: 244 * 1024, // 244KB
    },
  },
})
```

#### 3. Tree Shake Unused Code

```bash
# Check bundle size report
npm run build

# Use dynamic imports
const heavyModule = await import('./heavyModule.js')
```

## 🌐 Deployment Issues

### Deployment Fails

**Symptom**: Build fails on deployment platform

**Solutions**:

#### 1. Check Node.js Version

```bash
# Specify Node version in package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 2. Check Environment Variables

```bash
# Verify all required env variables are set
printenv | grep NUXT

# Check platform-specific configuration
# Vercel: Project Settings > Environment Variables
# Netlify: Site Settings > Environment
```

#### 3. Check Build Command

```bash
# Verify build command in platform settings
# Default: npm run build
# Should output to .output/public
```

### 404 After Deployment

**Symptom**: Deployment successful but site shows 404

**Solutions**:

```bash
# Check deployment URL
# Verify correct branch is deployed

# Check static export configuration
export default defineNuxtConfig({
  nitro: {
    preset: 'static',
  },
})

# Check base URL
export default defineNuxtConfig({
  app: {
    baseURL: '/',
  },
})
```

### Environment Variables Not Working

**Symptom**: Environment variables undefined in production

**Solutions**:

#### 1. Check Variable Prefix

```bash
# Client-side variables must start with NUXT_PUBLIC_
NUXT_PUBLIC_SITE_URL=https://example.com  # Accessible in client
DATABASE_URL=...                        # Not accessible in client
```

#### 2. Access in Code

```typescript
// Client-side
const siteUrl = useRuntimeConfig().public.siteUrl

// Server-side
const dbUrl = useRuntimeConfig().databaseUrl
```

#### 3. Verify Platform Configuration

```bash
# Vercel: Project Settings > Environment Variables
# Netlify: Site Settings > Environment
# Docker: -e NUXT_PUBLIC_SITE_URL=...
```

## 🧪 Testing Issues

### Tests Won't Run

**Symptom**: `npm run test` fails to execute

**Solutions**:

```bash
# Check Vitest configuration
npx vitest --version

# Check test environment
npx vitest --run

# Check test files
ls -la __tests__/

# Clear test cache
rm -rf node_modules/.vite
```

### Test Timeouts

**Symptom**: Tests fail with timeout errors

**Solutions**:

```typescript
// Increase timeout
import { describe, it, expect, vi } from 'vitest'

describe('Component', () => {
  it('should render', async () => {
    // ... test code
  }, 10000) // 10 second timeout
})
```

### Tests Pass Locally, Fail in CI

**Symptom**: Tests work locally but fail in GitHub Actions

**Solutions**:

#### 1. Check Node Version

```yaml
# .github/workflows/test.yml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: 18
```

#### 2. Check Environment

```bash
# CI may have different environment
# Verify all required env variables are set
# Use mock services in CI tests
```

#### 3. Check Timezone

```bash
# Set consistent timezone in CI
export TZ=UTC
```

## 💾 Database Issues

### Database Connection Failed

**Symptom**: Application cannot connect to database

**Solutions**:

#### 1. Check Database URL

```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Check SQLite file exists
ls -la data/dev.db
```

#### 2. Check Prisma Client

```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (development only)
npm run prisma:migrate reset
```

#### 3. Run Migrations

```bash
# Apply pending migrations
npm run prisma:migrate dev

# Or deploy migrations (production)
npx prisma migrate deploy
```

### Migration Fails

**Symptom**: `npm run prisma:migrate` fails

**Solutions**:

```bash
# Check database schema
npx prisma db pull

# Create migration with introspection
npx prisma migrate dev --name fix_schema

# Resolve conflicts manually
npx prisma migrate resolve --applied
```

### N+1 Query Problems

**Symptom**: Slow database queries, excessive database calls

**Solutions**:

```typescript
// Use Prisma include
const resources = await prisma.resource.findMany({
  include: {
    tags: true,
    comments: true,
  },
})

// Use database-level aggregation
const count = await prisma.resource.count()
```

## 🔌 API Issues

### API Route Not Found

**Symptom**: API endpoint returns 404

**Solutions**:

#### 1. Check File Structure

```bash
# Verify file exists in correct location
ls -la server/api/resources.get.ts
```

#### 2. Check Route Naming

```bash
# Correct
server/api/v1/resources.get.ts  # GET /api/v1/resources
server/api/webhook.post.ts      # POST /api/webhook

# Incorrect
server/api/getResources.ts     # Not auto-routed
```

### CORS Errors

**Symptom**: Browser blocks API requests with CORS error

**Solutions**:

```typescript
// server/api/hello.get.ts
export default defineEventHandler(event => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  return { message: 'Hello!' }
})
```

### Rate Limiting Errors

**Symptom**: API requests blocked with rate limit error

**Solutions**:

```bash
# Check rate limit status
curl -I http://localhost:3000/api/resources

# Wait for rate limit to reset (1 minute)

# Use API key for higher limits
curl -H "X-API-Key: your-key" http://localhost:3000/api/resources
```

## 🔒 Security Issues

### Vulnerability Found

**Symptom**: `npm audit` reports vulnerabilities

**Solutions**:

```bash
# Run npm audit
npm audit

# Fix automatically
npm audit fix

# Fix major vulnerabilities
npm audit fix --force

# Update dependencies
npm update
```

### CSP Violations

**Symptom**: Console shows CSP violation errors

**Solutions**:

```typescript
// server/plugins/security-headers.ts
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:response', event => {
    setResponseHeaders(event, {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'nonce-{nonce}';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
      `
        .replace(/\s{2,}/g, ' ')
        .trim(),
    })
  })
})
```

### XSS Vulnerability

**Symptom**: User input not sanitized

**Solutions**:

```vue
<template>
  <!-- Never use v-html without sanitization -->
  <div v-html="userContent" />
  <!-- DANGEROUS -->

  <!-- Use sanitization -->
  <div v-html="sanitize(userContent)" />
  <!-- SAFE -->
</template>

<script setup>
import { sanitize } from '~/utils/sanitize'
</script>
```

## 🛠️ Debugging Tools

### Vue DevTools

```bash
# Install Vue DevTools browser extension
# Chrome/Edge: https://chrome.google.com/webstore/detail/vuejs-devtools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/
```

### Nuxt DevTools

```bash
# Enable in nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
})
```

### Console Debugging

```bash
# Enable debug mode
DEBUG=nuxt:* npm run dev

# Check specific module
DEBUG=nuxt:pages npm run dev
```

### Source Maps

```typescript
// Enable source maps in development
export default defineNuxtConfig({
  sourcemap: {
    server: true,
    client: true,
  },
})
```

## 📞 Getting Help

If you can't resolve your issue:

1. **Check Documentation**:
   - [Getting Started](./getting-started.md)
   - [Development Guide](./development.md)
   - [Architecture Documentation](./architecture/README.md)

2. **Search GitHub Issues**:
   - [Existing Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)

3. **Create New Issue**:
   - Include error messages
   - Provide reproduction steps
   - Include environment details (Node version, OS, browser)

4. **Community Support**:
   - Nuxt.js Discord
   - Stack Overflow
   - Vue.js Forum

## 📝 Logging Issues

When reporting issues, include:

```bash
# Node.js version
node --version

# NPM version
npm --version

# Nuxt.js version
npm list nuxt

# Operating system
uname -a

# Browser console errors
# (Screenshot of console)

# Terminal output
# (Copy of terminal error)
```

---

**Last Updated**: 2025-01-07

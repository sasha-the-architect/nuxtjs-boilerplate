# Vercel Deployment Guide

Deploy Nuxt.js boilerplate to Vercel with optimized configuration for production.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cpa02cmz/nuxtjs-boilerplate)

## 📋 Prerequisites

- GitHub repository with project code
- Vercel account (free tier available)
- Domain name (optional)

## 🔧 Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Sign in to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository to deploy

### 2. Configure Build Settings

Vercel automatically detects Nuxt.js configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### 3. Environment Variables

Configure the following environment variables in Vercel dashboard:

```env
# Required
NUXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"

# Optional
NUXT_PUBLIC_GA_ID=""
NUXT_PUBLIC_SENTRY_DSN=""
```

**To add environment variables**:

1. Go to Project Settings > Environment Variables
2. Add each variable with its value
3. Select environments (Production, Preview, Development)
4. Save and redeploy

### 4. Deploy

Click "Deploy" button. Vercel will:

1. Install dependencies
2. Build the application
3. Generate static files
4. Deploy to global CDN

First deployment typically takes 2-3 minutes.

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to Project Settings > Domains
2. Click "Add Domain"
3. Enter your domain name (e.g., `example.com`)
4. Update DNS records as instructed

### DNS Configuration

If using your own domain, add these DNS records:

| Type  | Name | Value                | TTL  |
| ----- | ---- | -------------------- | ---- |
| A     | @    | 76.76.21.21          | 3600 |
| CNAME | www  | cname.vercel-dns.com | 3600 |

### SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

## 🔒 Environment-Specific Configuration

### Production Environment

```env
NUXT_PUBLIC_SITE_URL=https://example.com
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"
```

### Preview Environments

```env
NUXT_PUBLIC_SITE_URL=https://preview-branch.vercel.app
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet (Preview)"
```

### Development Environment

```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet (Dev)"
```

## ⚡ Performance Optimization

### Enable Edge Network

Vercel automatically deploys to edge network. Ensure `nuxt.config.ts` has:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel-edge',
  },
})
```

### Image Optimization

Vercel automatically optimizes images. No additional configuration needed.

### Cache Strategy

Add cache rules in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 📊 Monitoring and Analytics

### Vercel Analytics

1. Install Vercel Analytics:

```bash
npm install @vercel/analytics
```

2. Add to `app.vue`:

```vue
<script setup>
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <div>
    <Analytics />
    <NuxtPage />
  </div>
</template>
```

### Performance Monitoring

View metrics in Vercel dashboard:

- Build duration
- Bundle size
- Edge Network performance
- Core Web Vitals

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:

- **Production**: Push to main branch
- **Preview**: Pull requests and other branches
- **Development**: Pushes to development branches

### Deployment Hooks

Add deployment scripts in `package.json`:

```json
{
  "scripts": {
    "postbuild": "npm run test:unit"
  }
}
```

## 🐛 Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found" error

```bash
# Solution: Clear Vercel cache
# In Vercel dashboard: Project > Settings > Git > Ignored Build Step
# Add: echo "build"
```

**Issue**: Environment variables not loading

```bash
# Solution: Ensure variables are set in correct environment
# Check Project Settings > Environment Variables
# Variables must start with NUXT_PUBLIC_ to be exposed to client
```

### Deployment Errors

**Issue**: Static export fails

```bash
# Solution: Check nuxt.config.ts for static generation
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel-static',
  },
})
```

### Performance Issues

**Issue**: Slow initial load

```bash
# Solution: Enable pre-rendering in nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/resources/**': { isr: 60 },
  },
})
```

## 📈 Best Practices

### 1. Branch Protection

Protect main branch:

- Require pull request reviews
- Require status checks to pass
- Enable branch protection rules in GitHub

### 2. Preview Deployments

Enable preview deployments for:

- Pull requests
- Feature branches
- Testing before production merge

### 3. Environment Variables

Never commit secrets:

- Use Vercel environment variables
- Different variables per environment
- Rotate API keys regularly

### 4. Build Optimization

Optimize build performance:

- Use `.vercelignore` to exclude unnecessary files
- Enable caching for dependencies
- Monitor build times regularly

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Nuxt.js on Vercel](https://vercel.com/docs/frameworks/nuxtjs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: 2025-01-07

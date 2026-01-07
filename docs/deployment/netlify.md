# Netlify Deployment Guide

Deploy Nuxt.js boilerplate to Netlify with optimized configuration for production.

## 🚀 Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cpa02cmz/nuxtjs-boilerplate)

## 📋 Prerequisites

- GitHub repository with project code
- Netlify account (free tier available)
- Domain name (optional)

## 🔧 Step-by-Step Deployment

### 1. Connect Repository to Netlify

1. Sign in to [Netlify](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Select GitHub and authorize Netlify
4. Choose your repository

### 2. Configure Build Settings

Set build configuration:

| Setting           | Value                              |
| ----------------- | ---------------------------------- |
| Build command     | `npm run build`                    |
| Publish directory | `.output/public` (or `.nuxt/dist`) |
| Node version      | 18 (or latest LTS)                 |

**Netlify automatically detects these settings** from your repository.

### 3. Environment Variables

Add environment variables in Netlify dashboard:

**Go to**: Site Settings > Build & Deploy > Environment

```env
# Required
NUXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"

# Optional
NUXT_PUBLIC_GA_ID=""
NUXT_PUBLIC_SENTRY_DSN=""
```

**Note**: Variables with `NUXT_PUBLIC_` prefix are available in client-side code.

### 4. Deploy

Click "Deploy site". Netlify will:

1. Install dependencies
2. Build the application
3. Deploy to global CDN

First deployment typically takes 2-3 minutes.

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to Site Settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `example.com`)
4. Choose to redirect www or not

### DNS Configuration

Netlify provides DNS records to add:

| Type  | Hostname | Value                 | TTL  |
| ----- | -------- | --------------------- | ---- |
| A     | @        | 75.2.70.75            | 3600 |
| CNAME | www      | your-site.netlify.app | 3600 |

### SSL Certificate

Netlify automatically provisions SSL certificates via Let's Encrypt for custom domains.

## 🔒 Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## ⚡ Performance Optimization

### Enable Pre-rendering

Add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify',
  },
})
```

### Image Optimization

Netlify automatically optimizes images. Enable in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

### Cache Strategy

Netlify automatically caches static assets. Customize in `netlify.toml`:

```toml
[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

## 📊 Monitoring and Analytics

### Netlify Analytics

1. Go to Site Settings > Analytics
2. Enable Analytics (free for personal sites)
3. Add script to `app.vue`:

```vue
<script setup>
onMounted(() => {
  // Netlify Analytics is automatically injected
})
</script>
```

### Lighthouse CI

Enable Lighthouse CI in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  [plugins.inputs]
    fail_build_on_threshold = true
    threshold = 70
```

## 🔄 Continuous Deployment

### Automatic Deployments

Netlify automatically deploys:

- **Production**: Push to main branch
- **Preview**: Pull requests and other branches
- **Deploy Previews**: Test changes before merging

### Deployment Hooks

Add deployment hooks in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.post_processing]
  skip = false

[build.processing]
  skip_processing = false
```

### Branch Controls

Configure branch deployment settings:

1. Go to Site Settings > Build & Deploy > Branches
2. Add branch names for auto-deployment
3. Set branch-specific environment variables

## 🛠️ Form Handling

Netlify Forms are automatically detected:

1. Add forms to your pages:

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <button type="submit">Submit</button>
</form>
```

2. View submissions in Netlify dashboard

## 🐛 Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found" error

```bash
# Solution: Clear Netlify cache
# In Netlify dashboard: Site Settings > Build & Deploy > Build settings
# Click "Clear build cache and retry deploy"
```

**Issue**: Environment variables not loading

```bash
# Solution: Ensure variables are set in correct environment
# Site Settings > Build & Deploy > Environment
# Variables must start with NUXT_PUBLIC_ to be exposed to client
```

### Deployment Errors

**Issue**: Static export fails

```bash
# Solution: Ensure nitro preset is configured
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify-static',
  },
})
```

**Issue**: SPA routing issues

```bash
# Solution: Add redirect in netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

### Performance Issues

**Issue**: Slow initial load

```bash
# Solution: Enable pre-rendering and caching
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/resources/**': { isr: 60 },
  },
})
```

## 📈 Best Practices

### 1. Branch Protection

Protect main branch in GitHub:

- Require pull request reviews
- Require status checks to pass
- Enable branch protection rules

### 2. Preview Deployments

Enable preview deployments for:

- Pull requests
- Feature branches
- Testing before production merge

### 3. Environment Variables

Never commit secrets:

- Use Netlify environment variables
- Different variables per environment
- Rotate API keys regularly

### 4. Build Optimization

Optimize build performance:

- Use `.netlifyignore` to exclude unnecessary files
- Enable caching for dependencies
- Monitor build times regularly

### 5. Security Headers

Add security headers via `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

## 🔌 Netlify Functions (Optional)

For server-side logic beyond Nuxt:

1. Create `netlify/functions` directory
2. Add JavaScript/TypeScript functions:

```javascript
// netlify/functions/hello.js
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello!' }),
  }
}
```

3. Access via `/api/hello`

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Nuxt.js on Netlify](https://docs.netlify.com/integrations/frameworks/nuxt/)
- [Netlify CLI](https://cli.netlify.com)
- [Environment Variables Guide](https://docs.netlify.com/site-deploys/environment-variables)

---

**Last Updated**: 2025-01-07

# Static Hosting Deployment Guide

Deploy Nuxt.js boilerplate as a static site to GitHub Pages, Cloudflare Pages, or other static hosting providers.

## 📋 Prerequisites

- Built Nuxt.js application
- Git repository (for GitHub Pages)
- Static hosting account
- Basic understanding of static site generation

## 🚀 Static Site Generation

### Configure for Static Export

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'static',
  },
})
```

### Build Static Site

```bash
# Generate static site
npm run generate

# Output directory
.output/public/
```

The build will generate:

- `index.html` files for routes
- `_nuxt/` directory with assets
- Optimized static assets
- Sitemap and robots.txt (if configured)

## 🌐 GitHub Pages Deployment

### Option 1: Using GitHub Actions

#### 1. Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run generate
        env:
          NUXT_PUBLIC_SITE_URL: ${{ secrets.SITE_URL }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .output/public
```

#### 2. Configure GitHub Pages

1. Go to Repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` and `/ (root)`
4. Save

#### 3. Add Site URL to Secrets

1. Go to Repository Settings > Secrets and variables > Actions
2. Add new repository secret:
   - Name: `SITE_URL`
   - Value: `https://your-username.github.io/repository-name`

### Option 2: Manual Deployment

```bash
# Build static site
npm run generate

# Copy files to gh-pages branch
git checkout -b gh-pages
git rm -rf .
cp -r ../.output/public/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

## ☁️ Cloudflare Pages Deployment

### Automatic Deployment

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click "Create a project"
3. Connect your GitHub account
4. Select the repository
5. Configure build settings:

| Setting        | Value              |
| -------------- | ------------------ |
| Build command  | `npm run generate` |
| Build output   | `.output/public`   |
| Root directory | `/`                |

6. Add environment variables:

```env
NUXT_PUBLIC_SITE_URL=https://your-project.pages.dev
NUXT_PUBLIC_SITE_NAME="Free Stuff on the Internet"
```

7. Click "Save and Deploy"

### Manual Deployment

```bash
# Build static site
npm run generate

# Using Wrangler CLI
npm install -g wrangler
wrangler pages publish .output/public --project-name=your-project
```

## 🔌 Cloudflare Workers (Edge)

Deploy to Cloudflare Workers for edge computing:

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Create Worker

```bash
wrangler init nuxtjs-worker
```

### 3. Deploy

```bash
wrangler deploy
```

## 🐳 Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase

```bash
firebase init
# Select: Hosting
# Public directory: .output/public
# Configure as single-page app: No
```

### 3. Deploy

```bash
firebase deploy
```

### firebase.json Configuration

```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 🌊 Surge.sh Deployment

### Quick Deploy

```bash
# Install Surge CLI
npm install -g surge

# Deploy
cd .output/public
surge your-project.surge.sh
```

### Custom Domain

```bash
surge --domain example.com .output/public
```

## 🔒 AWS S3 + CloudFront

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name
```

### 2. Enable Static Website Hosting

```bash
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 3. Deploy to S3

```bash
# Using AWS CLI
aws s3 sync .output/public/ s3://your-bucket-name \
  --delete \
  --cache-control "max-age=31536000"

# Using s3cmd
s3cmd sync --delete-removed \
  --rexclude ".git*" \
  .output/public/ s3://your-bucket-name/
```

### 4. Configure CloudFront

1. Create CloudFront distribution
2. Origin: S3 bucket
3. Default Root Object: `index.html`
4. Behaviors:
   - Cache `_nuxt/*` for 1 year
   - Cache assets for 1 year
   - No caching for HTML

### 5. Configure DNS

Add CNAME record:

| Type  | Name | Value                         | TTL  |
| ----- | ---- | ----------------------------- | ---- |
| CNAME | www  | d111111abcdef8.cloudfront.net | 3600 |

## 🐋 Static Docker Image

### Dockerfile for Static

```dockerfile
FROM nginx:alpine

# Copy static files
COPY .output/public /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Cache static assets
    location /_nuxt/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Cache images, fonts, etc.
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t nuxtjs-static .

# Run container
docker run -d -p 80:80 nuxtjs-static
```

## 📊 SEO Optimization

### Sitemap Generation

Install `@nuxtjs/sitemap`:

```bash
npm install @nuxtjs/sitemap
```

Configure in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  sitemap: {
    hostname: 'https://your-domain.com',
    gzip: true,
    routes: ['/', '/resources', '/submit'],
  },
})
```

### Robots.txt

Create `public/robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://your-domain.com/sitemap.xml
```

### Meta Tags

Add SEO in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Free resources on the internet' },
        { name: 'og:type', content: 'website' },
        { name: 'og:title', content: 'Free Stuff on the Internet' },
        { name: 'og:description', content: 'Free resources on the internet' },
      ],
    },
  },
})
```

## ⚡ Performance Optimization

### Asset Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    format: ['webp', 'avif'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
})
```

### Cache Headers

#### Cloudflare Pages

Add `_headers` file in `.output/public`:

```txt
/_nuxt/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000

/*.css
  Cache-Control: public, max-age=31536000
```

#### Netlify

Add `netlify.toml`:

```toml
[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### GitHub Pages

Add `.htaccess`:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🔄 CI/CD Pipelines

### GitHub Actions

```yaml
name: Deploy Static Site

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install and Build
        run: |
          npm ci
          npm run generate

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project
          directory: .output/public
```

### GitLab CI

```yaml
image: node:18

pages:
  script:
    - npm ci
    - npm run generate
    - mkdir public
    - cp -r .output/public/* public
  artifacts:
    paths:
      - public
  only:
    - main
```

## 🐛 Troubleshooting

### Build Issues

**Issue**: Static generation fails with "Page not found" error

```bash
# Solution: Check route configuration
# Ensure all routes are accessible
```

**Issue**: Assets not loading after deployment

```bash
# Solution: Check base URL configuration
export default defineNuxtConfig({
  app: {
    baseURL: '/your-subdirectory',
  },
})
```

### Deployment Issues

**Issue**: GitHub Pages shows 404

```bash
# Solution: Ensure branch is gh-pages or docs
# Check Settings > Pages source
```

**Issue**: Cloudflare Pages build fails

```bash
# Solution: Check build command and output directory
# Ensure node version is correct
```

### Performance Issues

**Issue**: Slow initial load

```bash
# Solution: Enable pre-rendering
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/resources': { prerender: true },
  },
})
```

## 📈 Best Practices

### 1. Use CDN

Deploy with CDN for global distribution:

- Cloudflare Pages (includes CDN)
- CloudFront (AWS)
- Fastly

### 2. Optimize Images

- Use WebP and AVIF formats
- Lazy load images
- Implement responsive images

### 3. Enable Compression

- Gzip compression
- Brotli compression
- Minimize JavaScript and CSS

### 4. Cache Strategy

- Cache static assets for 1 year
- Cache HTML for shorter duration
- Use cache-busting for assets

### 5. Monitor Performance

- Use Lighthouse for audits
- Monitor Core Web Vitals
- Track page load times

## 📚 Additional Resources

- [Nuxt.js Static Deployment](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

---

**Last Updated**: 2025-01-07

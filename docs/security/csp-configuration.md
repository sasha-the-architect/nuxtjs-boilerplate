# Content Security Policy (CSP) Configuration

This document explains the security header configuration approach used in this Nuxt.js application.

## Overview

The application implements comprehensive security headers using multiple layers:

1. **Security Headers Plugin**: Located at `server/plugins/security-headers.ts` - This is the primary location for dynamic security header configuration
2. **Centralized Sanitization**: Located at `utils/sanitize.ts` - This handles XSS prevention across the application

## Content Security Policy Implementation

The CSP is configured in the security headers plugin which:

- Sets a unique nonce for each request to allow inline scripts when needed
- Implements a comprehensive policy that allows only trusted sources
- Uses modern security practices like strict-dynamic for script sources
- Provides appropriate directives for different content types

### CSP Directives

- `default-src 'self'` - Restricts all content to same origin by default
- `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:` - Allows scripts from same origin, with nonces, and HTTPS sources
- `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com` - Allows styles from same origin and Google Fonts
- `img-src 'self' data: blob: https:` - Allows images from same origin, data URIs, blobs, and HTTPS sources
- `frame-ancestors 'none'` - Prevents the site from being embedded in iframes
- `object-src 'none'` - Blocks plugins like Flash
- `upgrade-insecure-requests` - Forces HTTPS connections

## Sanitization Approach

Instead of using DOMPurify directly in components, the application uses centralized sanitization functions:

- `sanitizeForXSS()` - General XSS sanitization
- `sanitizeAndHighlight()` - Sanitization with search term highlighting

These functions are used in components like `ResourceCard.vue` to prevent XSS attacks while allowing safe content rendering.

## Validation

The security implementation is validated by the `validate-security.js` script which checks:

- That the centralized sanitization functions are being used
- That the security headers plugin exists and is properly configured
- That security headers are applied correctly

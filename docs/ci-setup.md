# CI/CD Setup Guide

## Setting up pnpm in CI Environments

This project uses pnpm as the package manager. When setting up CI/CD pipelines, ensure the following steps are included:

### GitHub Actions Example

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9.x

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run lint
  run: pnpm run lint

- name: Run build
  run: pnpm run build
```

### Other CI Platforms

For other CI platforms, ensure you:

1. Install pnpm globally before running any commands
2. Use `pnpm install` instead of `npm install`
3. Run commands with `pnpm run [script-name]` instead of `npm run [script-name]`

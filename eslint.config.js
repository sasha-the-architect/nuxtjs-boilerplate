// This is a problematic flat config file that conflicts with ESLint 8
// This file was causing the issue described in #7
export default [
  {
    files: ['**/*.{js,vue}'],
    rules: {},
  },
]

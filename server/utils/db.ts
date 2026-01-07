// server/utils/db.ts
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Declare global Prisma client instance for development
declare global {
  var prisma: any | undefined
}

let prismaClient: any

try {
  // Try to import Prisma from CommonJS module
  // This may fail during build/prerendering, which is expected
  const { PrismaClient } = require('@prisma/client')

  // Create a single instance of PrismaClient for production
  prismaClient = global.prisma || new PrismaClient()

  // In development, store global instance to prevent multiple instances
  if (process.env.NODE_ENV === 'development') {
    global.prisma = prismaClient
  }
} catch (error) {
  // Prisma is not available during build/prerendering
  // This is expected - db will be initialized at runtime
  console.warn(
    'Prisma client not available during build - will be initialized at runtime'
  )
}

export default prismaClient

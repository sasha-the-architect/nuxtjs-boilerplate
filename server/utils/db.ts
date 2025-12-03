// server/utils/db.ts
import { PrismaClient } from '@prisma/client'

// Declare global Prisma client instance for development
declare global {
  var prisma: PrismaClient | undefined
}

// Create a single instance of PrismaClient for production
const prismaClient = global.prisma || new PrismaClient()

// In development, store the global instance to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  global.prisma = prismaClient
}

export default prismaClient

/**
 * @type {import('@prisma/migrate').MigrateConfig}
 */
module.exports = {
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://localhost:5432/nuxtjs_boilerplate?schema=public',
  },
}

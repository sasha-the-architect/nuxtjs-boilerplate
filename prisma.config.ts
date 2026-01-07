/**
 * @type {import('@prisma/migrate').MigrateConfig}
 */
module.exports = {
  datasource: {
    url: process.env.DATABASE_URL || 'file:./data/dev.db',
  },
}

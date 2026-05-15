import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const sites = sqliteTable('sites', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	location: text('location'),
	latitude: real('latitude'),
	longitude: real('longitude'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;

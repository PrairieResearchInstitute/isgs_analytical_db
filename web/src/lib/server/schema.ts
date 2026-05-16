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

export const lutSiteType = sqliteTable('lut_site_type', {
	id: integer('id').primaryKey(),
	siteType: text('site_type').notNull()
});

export const lutCountyNames = sqliteTable('lut_county_names', {
	cntycode: integer('cntycode').primaryKey(),
	cntyname: text('cntyname')
});

export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey(),
	isgsNum: text('isgs_num'),
	idotName: text('idot_name'),
	isgsName: text('isgs_name'),
	beginDt: text('begin_dt'),
	endDt: text('end_dt'),
	faNum: text('fa_num'),
	county: integer('county').references(() => lutCountyNames.cntycode),
	typeId: integer('type_id').references(() => lutSiteType.id),
	seqCode: text('seq_code')
});

export const lutcInitials = sqliteTable('lutc_initials', {
	initials: text('initials').primaryKey(),
	firstName: text('first_name'),
	lastName: text('last_name')
});

export type LutSiteType = typeof lutSiteType.$inferSelect;
export type LutCountyName = typeof lutCountyNames.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type LutcInitials = typeof lutcInitials.$inferSelect;

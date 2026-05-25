import { pgTable, integer, text, doublePrecision, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sites = pgTable('sites', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	location: text('location'),
	latitude: doublePrecision('latitude'),
	longitude: doublePrecision('longitude'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;

export const lutSiteType = pgTable('lut_site_type', {
	id: integer('id').primaryKey(),
	siteType: text('site_type').notNull()
});

export const lutCountyNames = pgTable('lut_county_names', {
	cntycode: integer('cntycode').primaryKey(),
	cntyname: text('cntyname')
});

export const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
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

export const lutcInitials = pgTable('lutc_initials', {
	initials: text('initials').primaryKey(),
	firstName: text('first_name'),
	lastName: text('last_name')
});

export const visits = pgTable('visits', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => projects.id),
	dt: text('dt'),
	by: text('by')
		.notNull()
		.references(() => lutcInitials.initials),
	note: text('note'),
	reviewedBy: text('reviewed_by').references(() => lutcInitials.initials),
	reviewedDate: text('reviewed_date')
});

export const lutStationType = pgTable('lut_station_type', {
	id: integer('id').primaryKey(),
	type: text('type').notNull(),
	shortType: text('short_type')
});

export const lutLocationType = pgTable('lut_location_type', {
	id: integer('id').primaryKey(),
	locationType: text('location_type').notNull()
});

export const lutStationInstType = pgTable('lut_station_inst_type', {
	id: integer('id').primaryKey(),
	instType: text('inst_type').notNull(),
	wleEquation: text('wle_equation')
});

export const lutStationUnits = pgTable('lut_station_units', {
	id: integer('id').primaryKey(),
	unitsReading: text('units_reading').notNull(),
	convFactor: doublePrecision('conv_factor')
});

export const lutStationReadType = pgTable('lut_station_read_type', {
	id: integer('id').primaryKey(),
	loggerType: text('logger_type').notNull(),
	readType: text('read_type').notNull(),
	idrt: integer('idrt').notNull(),
	loggerTypeShort: text('logger_type_short'),
	isWQ: integer('is_wq').notNull(),
	sortOrder: integer('sort_order')
});

export const lutBoringMethod = pgTable('lut_boring_method', {
	id: integer('id').primaryKey(),
	boringMethod: text('boring_method').notNull()
});

export const stations = pgTable('stations', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => projects.id),
	typeId: integer('type_id')
		.notNull()
		.references(() => lutStationType.id),
	code: text('code'),
	beginDt: text('begin_dt'),
	endDt: text('end_dt'),
	staName: text('sta_name').notNull(),
	labelAlt: text('label_alt'),
	longitude: doublePrecision('longitude'),
	latitude: doublePrecision('latitude'),
	locationTypeId: integer('location_type_id').references(() => lutLocationType.id),
	initials: text('initials')
		.notNull()
		.references(() => lutcInitials.initials),
	instTypeId: integer('inst_type_id').references(() => lutStationInstType.id),
	instUnitsId: integer('inst_units_id').references(() => lutStationUnits.id),
	stationTypeId: integer('station_type_id').references(() => lutStationReadType.id),
	isgsId: text('isgs_id'),
	borDt: text('bor_dt'),
	borMethodId: integer('bor_method_id').references(() => lutBoringMethod.id),
	comment: text('comment')
});

export type LutSiteType = typeof lutSiteType.$inferSelect;
export type LutCountyName = typeof lutCountyNames.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type LutcInitials = typeof lutcInitials.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
export type LutStationType = typeof lutStationType.$inferSelect;
export type LutLocationType = typeof lutLocationType.$inferSelect;
export type LutStationInstType = typeof lutStationInstType.$inferSelect;
export type LutStationUnits = typeof lutStationUnits.$inferSelect;
export type LutStationReadType = typeof lutStationReadType.$inferSelect;
export type LutBoringMethod = typeof lutBoringMethod.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;

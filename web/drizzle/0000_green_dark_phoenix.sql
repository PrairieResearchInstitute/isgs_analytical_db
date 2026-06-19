CREATE TABLE "lut_boring_method" (
	"id" integer PRIMARY KEY NOT NULL,
	"boring_method" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lut_county_names" (
	"cntycode" integer PRIMARY KEY NOT NULL,
	"cntyname" text
);
--> statement-breakpoint
CREATE TABLE "lut_location_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"location_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lut_site_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"site_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lut_station_inst_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"inst_type" text NOT NULL,
	"wle_equation" text
);
--> statement-breakpoint
CREATE TABLE "lut_station_read_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"logger_type" text NOT NULL,
	"read_type" text NOT NULL,
	"idrt" integer NOT NULL,
	"logger_type_short" text,
	"is_wq" integer NOT NULL,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "lut_station_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"short_type" text
);
--> statement-breakpoint
CREATE TABLE "lut_station_units" (
	"id" integer PRIMARY KEY NOT NULL,
	"units_reading" text NOT NULL,
	"conv_factor" double precision
);
--> statement-breakpoint
CREATE TABLE "lut_status" (
	"id" integer PRIMARY KEY NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lutc_initials" (
	"initials" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text
);
--> statement-breakpoint
CREATE TABLE "pressure_temperature_depth" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_visit_id" integer NOT NULL,
	"timestamp" timestamp,
	"pressure" real,
	"temperature" real,
	"depth" real,
	"include_in_report" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"isgs_num" text,
	"idot_name" text,
	"isgs_name" text,
	"begin_dt" text,
	"end_dt" text,
	"fa_num" text,
	"county" integer,
	"type_id" integer,
	"seq_code" text
);
--> statement-breakpoint
CREATE TABLE "samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_visit_id" integer NOT NULL,
	"sample_name" varchar(32),
	"notes" text,
	"pump_type" text,
	"flow_rate" real,
	"final_flow_rate" real,
	"tubing_type" text,
	"device_model" text,
	"device_sn" text
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "sonde_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"timestamp" timestamp,
	"elapsed_time" text,
	"flow" real,
	"actual_conductivity" real,
	"specific_conductivity" real,
	"salinity" real,
	"resistivity" real,
	"density" real,
	"total_dissolved_solids" real,
	"turbidity" real,
	"ph" real,
	"ph_mv" real,
	"orp" real,
	"rdo_concentration" real,
	"rdo_saturation" real,
	"oxygen_partial_pressure" real,
	"temperature" real,
	"external_voltage" real,
	"battery_capacity" real,
	"barometric_pressure" real
);
--> statement-breakpoint
CREATE TABLE "sonde_import_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"uri" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_visit_import_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_visit_id" integer NOT NULL,
	"uri" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"visit_id" integer NOT NULL,
	"station_id" integer NOT NULL,
	"status_id" integer,
	"level" real,
	"time" time,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"code" text,
	"begin_dt" text,
	"end_dt" text,
	"sta_name" text NOT NULL,
	"label_alt" text,
	"longitude" double precision,
	"latitude" double precision,
	"location_type_id" integer,
	"initials" text NOT NULL,
	"inst_type_id" integer,
	"inst_units_id" integer,
	"station_type_id" integer,
	"isgs_id" text,
	"bor_dt" text,
	"bor_method_id" integer,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "temperatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_visit_id" integer NOT NULL,
	"datetime" timestamp,
	"temperature_celsius" real
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"dt" text,
	"by" text NOT NULL,
	"note" text,
	"reviewed_by" text,
	"reviewed_date" text
);
--> statement-breakpoint
ALTER TABLE "pressure_temperature_depth" ADD CONSTRAINT "ptd_station_visit_id_fk" FOREIGN KEY ("station_visit_id") REFERENCES "public"."station_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_county_lut_county_names_cntycode_fk" FOREIGN KEY ("county") REFERENCES "public"."lut_county_names"("cntycode") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_type_id_lut_site_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."lut_site_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_station_visit_id_station_visits_id_fk" FOREIGN KEY ("station_visit_id") REFERENCES "public"."station_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sonde_data" ADD CONSTRAINT "sd_sample_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sonde_import_queue" ADD CONSTRAINT "siq_sample_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_visit_import_queue" ADD CONSTRAINT "sviq_station_visit_id_fk" FOREIGN KEY ("station_visit_id") REFERENCES "public"."station_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_visits" ADD CONSTRAINT "station_visits_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_visits" ADD CONSTRAINT "station_visits_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_visits" ADD CONSTRAINT "station_visits_status_id_lut_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lut_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_type_id_lut_station_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."lut_station_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_location_type_id_lut_location_type_id_fk" FOREIGN KEY ("location_type_id") REFERENCES "public"."lut_location_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_initials_lutc_initials_initials_fk" FOREIGN KEY ("initials") REFERENCES "public"."lutc_initials"("initials") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_inst_type_id_lut_station_inst_type_id_fk" FOREIGN KEY ("inst_type_id") REFERENCES "public"."lut_station_inst_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_inst_units_id_lut_station_units_id_fk" FOREIGN KEY ("inst_units_id") REFERENCES "public"."lut_station_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_station_type_id_lut_station_read_type_id_fk" FOREIGN KEY ("station_type_id") REFERENCES "public"."lut_station_read_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_bor_method_id_lut_boring_method_id_fk" FOREIGN KEY ("bor_method_id") REFERENCES "public"."lut_boring_method"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temperatures" ADD CONSTRAINT "temperatures_station_visit_id_station_visits_id_fk" FOREIGN KEY ("station_visit_id") REFERENCES "public"."station_visits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_by_lutc_initials_initials_fk" FOREIGN KEY ("by") REFERENCES "public"."lutc_initials"("initials") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_reviewed_by_lutc_initials_initials_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."lutc_initials"("initials") ON DELETE no action ON UPDATE no action;
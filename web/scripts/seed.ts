import { readFileSync } from 'fs';
import { resolve } from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/schema.js';

const sqlite = new Database(resolve(import.meta.dirname, '../dev.db'));
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

function parseNdjson<T>(filePath: string): T[] {
	return readFileSync(filePath, 'utf-8')
		.split('\n')
		.filter((l) => l.trim())
		.map((l) => JSON.parse(l) as T);
}

function parseDate(raw: string | undefined | null): string | null {
	if (!raw) return null;
	// Format: "MM/DD/YY HH:MM:SS" or "MM/DD/YYYY HH:MM:SS"
	const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
	if (!match) return null;
	const [, mm, dd, yy] = match;
	const year = yy.length === 2 ? (parseInt(yy) < 50 ? `20${yy}` : `19${yy}`) : yy;
	return `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

const dataDir = resolve(import.meta.dirname, '../../data');

// Seed LUT_SiteType
const siteTypeRows = parseNdjson<{ ID: number; SiteType: string }>(
	`${dataDir}/LUT_SiteType.json`
);
db.insert(schema.lutSiteType)
	.values(siteTypeRows.map((r) => ({ id: r.ID, siteType: r.SiteType })))
	.onConflictDoNothing()
	.run();
console.log(`Seeded ${siteTypeRows.length} site types`);

// Seed LUT_County_Names
const countyRows = parseNdjson<{ CNTYCODE: number; CNTYNAME: string }>(
	`${dataDir}/LUT_County_Names.json`
);
db.insert(schema.lutCountyNames)
	.values(countyRows.map((r) => ({ cntycode: r.CNTYCODE, cntyname: r.CNTYNAME })))
	.onConflictDoNothing()
	.run();
console.log(`Seeded ${countyRows.length} county names`);

// Seed Projects
type RawProject = {
	ID: number;
	ISGS_Num?: string;
	IDOT_Name?: string;
	ISGS_Name?: string;
	BeginDT?: string;
	EndDT?: string;
	FA_num?: string;
	County?: string;
	TypeID?: number;
	SeqCode?: string;
};
const projectRows = parseNdjson<RawProject>(`${dataDir}/Projects.json`);
db.insert(schema.projects)
	.values(
		projectRows.map((r) => ({
			id: r.ID,
			isgsNum: r.ISGS_Num ?? null,
			idotName: r.IDOT_Name ?? null,
			isgsName: r.ISGS_Name ?? null,
			beginDt: parseDate(r.BeginDT),
			endDt: parseDate(r.EndDT),
			faNum: r.FA_num ?? null,
			county: r.County ? parseInt(r.County) : null,
			typeId: r.TypeID ?? null,
			seqCode: r.SeqCode ?? null
		}))
	)
	.onConflictDoNothing()
	.run();
console.log(`Seeded ${projectRows.length} projects`);

// Seed LUTC_Initials
type RawInitials = { Initials: string; FirstName?: string; LastName?: string };
const initialsRows = parseNdjson<RawInitials>(`${dataDir}/LUTC_Initials.json`);
db.insert(schema.lutcInitials)
	.values(
		initialsRows.map((r) => ({
			initials: r.Initials,
			firstName: r.FirstName ?? null,
			lastName: r.LastName ?? null
		}))
	)
	.onConflictDoNothing()
	.run();
console.log(`Seeded ${initialsRows.length} initials`);

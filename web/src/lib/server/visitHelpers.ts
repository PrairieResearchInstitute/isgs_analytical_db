import { db } from './db';
import { visits, stations, stationVisits } from './schema';
import { eq } from 'drizzle-orm';
import type { NewVisit } from './schema';

export async function createVisitWithStations(values: NewVisit): Promise<void> {
	const [newVisit] = await db.insert(visits).values(values).returning();

	const projectStations = await db
		.select({ id: stations.id })
		.from(stations)
		.where(eq(stations.projectId, values.projectId));

	if (projectStations.length > 0) {
		await db
			.insert(stationVisits)
			.values(projectStations.map((s) => ({ visitId: newVisit.id, stationId: s.id })));
	}
}

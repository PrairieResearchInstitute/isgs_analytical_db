import { db } from '$lib/server/db';
import {
	visits,
	sites,
	lutcInitials,
	stations,
	stationVisits,
	lutStatus
} from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(404, 'Visit not found');

	const [rows, svRows, allSites, scientists] = await Promise.all([
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				siteId: visits.siteId,
				siteName: sites.isgsName,
				by: visits.by,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				note: visits.note,
				reviewedBy: visits.reviewedBy,
				reviewedDate: visits.reviewedDate
			})
			.from(visits)
			.leftJoin(sites, eq(visits.siteId, sites.id))
			.leftJoin(lutcInitials, eq(visits.by, lutcInitials.initials))
			.where(eq(visits.id, id))
			.limit(1),
		db
			.select({
				id: stationVisits.id,
				stationId: stationVisits.stationId,
				staName: stations.staName,
				code: stations.code,
				time: stationVisits.time,
				level: stationVisits.level,
				statusId: stationVisits.statusId,
				status: lutStatus.status,
				notes: stationVisits.notes
			})
			.from(stationVisits)
			.leftJoin(stations, eq(stationVisits.stationId, stations.id))
			.leftJoin(lutStatus, eq(stationVisits.statusId, lutStatus.id))
			.where(eq(stationVisits.visitId, id))
			.orderBy(asc(stations.staName)),
		db
			.select({ id: sites.id, isgsName: sites.isgsName, isgsNum: sites.isgsNum })
			.from(sites)
			.orderBy(asc(sites.isgsName)),
		db.select().from(lutcInitials).orderBy(asc(lutcInitials.lastName), asc(lutcInitials.firstName))
	]);

	if (rows.length === 0) throw error(404, 'Visit not found');

	return {
		visit: rows[0],
		stationVisits: svRows,
		sites: allSites,
		scientists
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const id = parseInt(params.id);
		if (isNaN(id)) return fail(400, { error: 'Invalid visit id' });

		const data = await request.formData();
		const siteIdRaw = data.get('siteId') as string;
		const by = (data.get('by') as string)?.trim();

		if (!siteIdRaw) return fail(400, { error: 'Site is required' });
		if (!by) return fail(400, { error: 'Field Scientist is required' });

		const siteId = parseInt(siteIdRaw);
		if (isNaN(siteId)) return fail(400, { error: 'Invalid site' });

		await db
			.update(visits)
			.set({
				siteId,
				by,
				dt: (data.get('dt') as string) || null,
				note: (data.get('note') as string) || null
			})
			.where(eq(visits.id, id));

		return { success: true };
	}
};

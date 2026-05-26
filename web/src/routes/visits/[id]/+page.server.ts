import { db } from '$lib/server/db';
import {
	visits,
	projects,
	lutcInitials,
	stations,
	stationVisits,
	lutStatus
} from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(404, 'Visit not found');

	const [rows, svRows, statuses] = await Promise.all([
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				projectId: visits.projectId,
				projectName: projects.idotName,
				by: visits.by,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				note: visits.note,
				reviewedBy: visits.reviewedBy,
				reviewedDate: visits.reviewedDate
			})
			.from(visits)
			.leftJoin(projects, eq(visits.projectId, projects.id))
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
		db.select().from(lutStatus).orderBy(lutStatus.status)
	]);

	if (rows.length === 0) throw error(404, 'Visit not found');

	return { visit: rows[0], stationVisits: svRows, statuses };
};

export const actions: Actions = {
	updateStationVisit: async ({ request, params }) => {
		const visitId = parseInt(params.id);
		const data = await request.formData();
		const svId = parseInt(data.get('stationVisitId') as string);
		const levelRaw = (data.get('level') as string)?.trim();
		const statusIdRaw = data.get('statusId') as string;

		await db
			.update(stationVisits)
			.set({
				time: (data.get('time') as string) || null,
				level: levelRaw !== '' ? parseFloat(levelRaw) : null,
				statusId: statusIdRaw ? parseInt(statusIdRaw) : null,
				notes: (data.get('notes') as string) || null
			})
			.where(eq(stationVisits.id, svId));

		redirect(303, `/visits/${visitId}`);
	}
};

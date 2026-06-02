import { db } from '$lib/server/db';
import {
	visits,
	projects,
	lutcInitials,
	stations,
	stationVisits,
	lutStatus,
	visitLabsImportQueue
} from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ensureBucket, uploadFile } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(404, 'Visit not found');

	const [rows, svRows, allProjects, scientists] = await Promise.all([
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
		db
			.select({ id: projects.id, idotName: projects.idotName, isgsNum: projects.isgsNum })
			.from(projects)
			.orderBy(asc(projects.idotName)),
		db.select().from(lutcInitials).orderBy(asc(lutcInitials.lastName), asc(lutcInitials.firstName))
	]);

	if (rows.length === 0) throw error(404, 'Visit not found');

	return {
		visit: rows[0],
		stationVisits: svRows,
		projects: allProjects,
		scientists
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const id = parseInt(params.id);
		if (isNaN(id)) return fail(400, { error: 'Invalid visit id' });

		const data = await request.formData();
		const projectIdRaw = data.get('projectId') as string;
		const by = (data.get('by') as string)?.trim();

		if (!projectIdRaw) return fail(400, { error: 'Project is required' });
		if (!by) return fail(400, { error: 'Field Scientist is required' });

		const projectId = parseInt(projectIdRaw);
		if (isNaN(projectId)) return fail(400, { error: 'Invalid project' });

		await db
			.update(visits)
			.set({
				projectId,
				by,
				dt: (data.get('dt') as string) || null,
				note: (data.get('note') as string) || null
			})
			.where(eq(visits.id, id));

		return { success: true };
	},

	importLabs: async ({ params, request }) => {
		const id = parseInt(params.id);
		if (isNaN(id)) return fail(400, { error: 'Invalid visit id' });

		const data = await request.formData();
		const files = data
			.getAll('files')
			.filter((f): f is File => f instanceof File && f.size > 0 && /\.(xls|xlsx)$/i.test(f.name));

		if (files.length === 0) return fail(400, { error: 'No valid .xls or .xlsx files provided' });

		await ensureBucket('watershed');
		const keys = await Promise.all(
			files.map(async (file) => {
				const key = `visits/${id}/labs/${Date.now()}-${file.name}`;
				await uploadFile(
					'watershed',
					key,
					await file.arrayBuffer(),
					file.type || 'application/octet-stream'
				);
				return key;
			})
		);

		await db
			.insert(visitLabsImportQueue)
			.values(keys.map((key) => ({ visitId: id, uri: `s3://watershed/${key}` })));

		return { success: true };
	}
};

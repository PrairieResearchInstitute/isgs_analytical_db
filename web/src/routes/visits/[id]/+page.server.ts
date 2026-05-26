import { db } from '$lib/server/db';
import { visits, projects, lutcInitials } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(404, 'Visit not found');

	const rows = await db
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
		.limit(1);

	if (rows.length === 0) throw error(404, 'Visit not found');

	return { visit: rows[0] };
};

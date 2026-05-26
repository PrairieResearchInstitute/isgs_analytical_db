import { db } from '$lib/server/db';
import { visits, projects, lutcInitials } from '$lib/server/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [allVisits, allProjects, scientists] = await Promise.all([
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				projectId: visits.projectId,
				projectName: projects.idotName,
				by: visits.by,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				note: visits.note
			})
			.from(visits)
			.leftJoin(projects, eq(visits.projectId, projects.id))
			.leftJoin(lutcInitials, eq(visits.by, lutcInitials.initials))
			.orderBy(desc(visits.dt)),
		db
			.select({ id: projects.id, idotName: projects.idotName, isgsNum: projects.isgsNum })
			.from(projects)
			.orderBy(asc(projects.idotName)),
		db.select().from(lutcInitials).orderBy(asc(lutcInitials.lastName), asc(lutcInitials.firstName))
	]);

	return { visits: allVisits, projects: allProjects, scientists };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const projectIdRaw = data.get('projectId') as string;
		const by = (data.get('by') as string)?.trim();

		if (!projectIdRaw) return fail(400, { error: 'Project is required' });
		if (!by) return fail(400, { error: 'Field Scientist is required' });

		const projectId = parseInt(projectIdRaw);
		if (isNaN(projectId)) return fail(400, { error: 'Invalid project' });

		await db.insert(visits).values({
			projectId,
			by,
			dt: (data.get('dt') as string) || null,
			note: (data.get('note') as string) || null
		});

		redirect(303, '/visits');
	}
};

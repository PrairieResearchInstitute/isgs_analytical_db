import { db } from '$lib/server/db';
import { lutcInitials, visits, projects } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const row = db
		.select()
		.from(lutcInitials)
		.where(eq(lutcInitials.initials, params.initials))
		.get();

	if (!row) error(404, 'Person not found');

	const scientistVisits = db
		.select({
			id: visits.id,
			dt: visits.dt,
			projectId: visits.projectId,
			idotName: projects.idotName,
			note: visits.note
		})
		.from(visits)
		.leftJoin(projects, eq(visits.projectId, projects.id))
		.where(eq(visits.by, params.initials))
		.orderBy(visits.dt)
		.all();

	return { scientist: row, visits: scientistVisits };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		db.update(lutcInitials)
			.set({
				firstName: (data.get('firstName') as string) || null,
				lastName: (data.get('lastName') as string) || null
			})
			.where(eq(lutcInitials.initials, params.initials))
			.run();

		redirect(303, `/maintenance/people/${params.initials}`);
	},

	delete: async ({ params }) => {
		db.delete(lutcInitials).where(eq(lutcInitials.initials, params.initials)).run();
		redirect(303, '/maintenance/people');
	}
};

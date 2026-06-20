import { db } from '$lib/server/db';
import { lutcInitials, visits, sites } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [row] = await db
		.select()
		.from(lutcInitials)
		.where(eq(lutcInitials.initials, params.initials))
		.limit(1);

	if (!row) error(404, 'Person not found');

	const scientistVisits = await db
		.select({
			id: visits.id,
			dt: visits.dt,
			siteId: visits.siteId,
			isgsName: sites.isgsName,
			note: visits.note
		})
		.from(visits)
		.leftJoin(sites, eq(visits.siteId, sites.id))
		.where(eq(visits.by, params.initials))
		.orderBy(visits.dt);

	return { scientist: row, visits: scientistVisits };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		await db
			.update(lutcInitials)
			.set({
				firstName: (data.get('firstName') as string) || null,
				lastName: (data.get('lastName') as string) || null
			})
			.where(eq(lutcInitials.initials, params.initials));

		redirect(303, `/maintenance/people/${params.initials}`);
	},

	delete: async ({ params }) => {
		await db.delete(lutcInitials).where(eq(lutcInitials.initials, params.initials));
		redirect(303, '/maintenance/people');
	}
};

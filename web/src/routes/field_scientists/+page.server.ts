import { db } from '$lib/server/db';
import { lutcInitials, visits } from '$lib/server/schema';
import { count, eq, asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const scientists = db
		.select({
			initials: lutcInitials.initials,
			firstName: lutcInitials.firstName,
			lastName: lutcInitials.lastName,
			visitCount: count(visits.id)
		})
		.from(lutcInitials)
		.leftJoin(visits, eq(visits.by, lutcInitials.initials))
		.groupBy(lutcInitials.initials)
		.orderBy(asc(lutcInitials.lastName), asc(lutcInitials.firstName))
		.all();
	return { scientists };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const initials = (data.get('initials') as string)?.trim();
		if (!initials) return fail(400, { error: 'Initials are required' });

		db.insert(lutcInitials)
			.values({
				initials,
				firstName: (data.get('firstName') as string) || null,
				lastName: (data.get('lastName') as string) || null
			})
			.run();

		redirect(303, '/field_scientists');
	}
};

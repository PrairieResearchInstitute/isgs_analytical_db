import { db } from '$lib/server/db';
import { visits, sites, lutcInitials } from '$lib/server/schema';
import { createVisitWithStations } from '$lib/server/visitHelpers';
import { eq, desc, asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [allVisits, allSites, scientists] = await Promise.all([
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				siteId: visits.siteId,
				siteName: sites.idotName,
				by: visits.by,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				note: visits.note
			})
			.from(visits)
			.leftJoin(sites, eq(visits.siteId, sites.id))
			.leftJoin(lutcInitials, eq(visits.by, lutcInitials.initials))
			.orderBy(desc(visits.dt)),
		db
			.select({ id: sites.id, idotName: sites.idotName, isgsNum: sites.isgsNum })
			.from(sites)
			.orderBy(asc(sites.idotName)),
		db.select().from(lutcInitials).orderBy(asc(lutcInitials.lastName), asc(lutcInitials.firstName))
	]);

	return { visits: allVisits, sites: allSites, scientists };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const siteIdRaw = data.get('siteId') as string;
		const by = (data.get('by') as string)?.trim();

		if (!siteIdRaw) return fail(400, { error: 'Site is required' });
		if (!by) return fail(400, { error: 'Field Scientist is required' });

		const siteId = parseInt(siteIdRaw);
		if (isNaN(siteId)) return fail(400, { error: 'Invalid site' });

		await createVisitWithStations({
			siteId,
			by,
			dt: (data.get('dt') as string) || null,
			note: (data.get('note') as string) || null
		});

		redirect(303, '/visits');
	}
};

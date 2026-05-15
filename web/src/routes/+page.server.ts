import { db } from '$lib/server/db';
import { sites } from '$lib/server/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allSites = await db.select().from(sites).orderBy(sites.name);
	return { sites: allSites };
};

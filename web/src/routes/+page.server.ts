import { db } from '$lib/server/db';
import { sites, lutSiteType, lutCountyNames, visits } from '$lib/server/schema';
import { count, eq, or, isNull, gte } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [rows, siteTypes, counties] = await Promise.all([
		db
			.select({
				id: sites.id,
				isgsNum: sites.isgsNum,
				idotName: sites.idotName,
				isgsName: sites.isgsName,
				beginDt: sites.beginDt,
				endDt: sites.endDt,
				faNum: sites.faNum,
				county: sites.county,
				countyName: lutCountyNames.cntyname,
				typeId: sites.typeId,
				seqCode: sites.seqCode,
				siteType: lutSiteType.siteType,
				visitCount: count(visits.id)
			})
			.from(sites)
			.leftJoin(lutSiteType, eq(sites.typeId, lutSiteType.id))
			.leftJoin(lutCountyNames, eq(sites.county, lutCountyNames.cntycode))
			.leftJoin(visits, eq(visits.siteId, sites.id))
			.where(or(isNull(sites.endDt), gte(sites.endDt, new Date().toISOString().slice(0, 10))))
			.groupBy(sites.id, lutCountyNames.cntyname, lutSiteType.siteType)
			.orderBy(sites.isgsNum),
		db.select().from(lutSiteType).orderBy(lutSiteType.siteType),
		db.select().from(lutCountyNames).orderBy(lutCountyNames.cntyname)
	]);

	return { sites: rows, siteTypes, counties };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const idotName = (data.get('idotName') as string)?.trim();
		if (!idotName) return fail(400, { error: 'IDOT Name is required' });
		const isgsName = (data.get('isgsName') as string)?.trim();
		if (!isgsName) return fail(400, { error: 'ISGS Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		const countyRaw = data.get('county') as string;
		await db.insert(sites).values({
			isgsNum: (data.get('isgsNum') as string) || null,
			idotName,
			isgsName,
			beginDt: (data.get('beginDt') as string) || null,
			endDt: (data.get('endDt') as string) || null,
			faNum: (data.get('faNum') as string) || null,
			county: countyRaw ? parseInt(countyRaw) : null,
			typeId: typeIdRaw ? parseInt(typeIdRaw) : null,
			seqCode: (data.get('seqCode') as string) || null
		});

		redirect(303, '/');
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const idotName = (data.get('idotName') as string)?.trim();
		if (!idotName) return fail(400, { error: 'IDOT Name is required' });
		const isgsName = (data.get('isgsName') as string)?.trim();
		if (!isgsName) return fail(400, { error: 'ISGS Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		const countyRaw = data.get('county') as string;
		await db
			.update(sites)
			.set({
				isgsNum: (data.get('isgsNum') as string) || null,
				idotName,
				isgsName,
				beginDt: (data.get('beginDt') as string) || null,
				endDt: (data.get('endDt') as string) || null,
				faNum: (data.get('faNum') as string) || null,
				county: countyRaw ? parseInt(countyRaw) : null,
				typeId: typeIdRaw ? parseInt(typeIdRaw) : null,
				seqCode: (data.get('seqCode') as string) || null
			})
			.where(eq(sites.id, id));

		redirect(303, '/');
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		await db.delete(sites).where(eq(sites.id, id));
		redirect(303, '/');
	}
};

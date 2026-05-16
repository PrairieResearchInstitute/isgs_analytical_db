import { db } from '$lib/server/db';
import { projects, lutSiteType, lutCountyNames, visits } from '$lib/server/schema';
import { count, eq, or, isNull, gte } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const rows = db
		.select({
			id: projects.id,
			isgsNum: projects.isgsNum,
			idotName: projects.idotName,
			isgsName: projects.isgsName,
			beginDt: projects.beginDt,
			endDt: projects.endDt,
			faNum: projects.faNum,
			county: projects.county,
			countyName: lutCountyNames.cntyname,
			typeId: projects.typeId,
			seqCode: projects.seqCode,
			siteType: lutSiteType.siteType,
			visitCount: count(visits.id)
		})
		.from(projects)
		.leftJoin(lutSiteType, eq(projects.typeId, lutSiteType.id))
		.leftJoin(lutCountyNames, eq(projects.county, lutCountyNames.cntycode))
		.leftJoin(visits, eq(visits.projectId, projects.id))
		.where(or(isNull(projects.endDt), gte(projects.endDt, new Date().toISOString().slice(0, 10))))
		.groupBy(projects.id)
		.orderBy(projects.isgsNum)
		.all();

	const siteTypes = db.select().from(lutSiteType).orderBy(lutSiteType.siteType).all();
	const counties = db.select().from(lutCountyNames).orderBy(lutCountyNames.cntyname).all();

	return { projects: rows, siteTypes, counties };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const idotName = (data.get('idotName') as string)?.trim();
		if (!idotName) return fail(400, { error: 'IDOT Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		const countyRaw = data.get('county') as string;
		db.insert(projects)
			.values({
				isgsNum: (data.get('isgsNum') as string) || null,
				idotName,
				isgsName: (data.get('isgsName') as string) || null,
				beginDt: (data.get('beginDt') as string) || null,
				endDt: (data.get('endDt') as string) || null,
				faNum: (data.get('faNum') as string) || null,
				county: countyRaw ? parseInt(countyRaw) : null,
				typeId: typeIdRaw ? parseInt(typeIdRaw) : null,
				seqCode: (data.get('seqCode') as string) || null
			})
			.run();

		redirect(303, '/');
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		const idotName = (data.get('idotName') as string)?.trim();
		if (!idotName) return fail(400, { error: 'IDOT Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		const countyRaw = data.get('county') as string;
		db.update(projects)
			.set({
				isgsNum: (data.get('isgsNum') as string) || null,
				idotName,
				isgsName: (data.get('isgsName') as string) || null,
				beginDt: (data.get('beginDt') as string) || null,
				endDt: (data.get('endDt') as string) || null,
				faNum: (data.get('faNum') as string) || null,
				county: countyRaw ? parseInt(countyRaw) : null,
				typeId: typeIdRaw ? parseInt(typeIdRaw) : null,
				seqCode: (data.get('seqCode') as string) || null
			})
			.where(eq(projects.id, id))
			.run();

		redirect(303, '/');
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string);
		db.delete(projects).where(eq(projects.id, id)).run();
		redirect(303, '/');
	}
};

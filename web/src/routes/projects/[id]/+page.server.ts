import { db } from '$lib/server/db';
import { projects, lutSiteType, lutCountyNames } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) error(404, 'Not found');

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
			siteType: lutSiteType.siteType
		})
		.from(projects)
		.leftJoin(lutSiteType, eq(projects.typeId, lutSiteType.id))
		.leftJoin(lutCountyNames, eq(projects.county, lutCountyNames.cntycode))
		.where(eq(projects.id, id))
		.all();

	if (rows.length === 0) error(404, 'Project not found');

	const siteTypes = db.select().from(lutSiteType).orderBy(lutSiteType.siteType).all();
	const counties = db.select().from(lutCountyNames).orderBy(lutCountyNames.cntyname).all();

	return { project: rows[0], siteTypes, counties };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
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

		redirect(303, `/projects/${id}`);
	},

	delete: async ({ params }) => {
		const id = parseInt(params.id);
		db.delete(projects).where(eq(projects.id, id)).run();
		redirect(303, '/');
	}
};
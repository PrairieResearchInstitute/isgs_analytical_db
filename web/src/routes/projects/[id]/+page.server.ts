import { db } from '$lib/server/db';
import {
	projects,
	lutSiteType,
	lutCountyNames,
	visits,
	lutcInitials,
	stations,
	lutStationType,
	lutLocationType,
	lutStationInstType,
	lutStationUnits,
	lutStationReadType,
	lutBoringMethod
} from '$lib/server/schema';
import { desc, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) error(404, 'Not found');

	const [
		rows,
		siteTypes,
		counties,
		projectVisits,
		projectStations,
		stationTypes,
		locationTypes,
		scientists,
		instTypes,
		stationUnits,
		stationReadTypes,
		boringMethods
	] = await Promise.all([
		db
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
			.where(eq(projects.id, id)),
		db.select().from(lutSiteType).orderBy(lutSiteType.siteType),
		db.select().from(lutCountyNames).orderBy(lutCountyNames.cntyname),
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				by: visits.by,
				firstName: lutcInitials.firstName,
				lastName: lutcInitials.lastName,
				note: visits.note
			})
			.from(visits)
			.leftJoin(lutcInitials, eq(visits.by, lutcInitials.initials))
			.where(eq(visits.projectId, id))
			.orderBy(desc(visits.dt)),
		db
			.select({
				id: stations.id,
				staName: stations.staName,
				code: stations.code,
				typeId: stations.typeId,
				stationType: lutStationType.type,
				stationTypeShort: lutStationType.shortType,
				beginDt: stations.beginDt,
				endDt: stations.endDt,
				latitude: stations.latitude,
				longitude: stations.longitude,
				locationTypeId: stations.locationTypeId,
				locationType: lutLocationType.locationType,
				initials: stations.initials,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				instTypeId: stations.instTypeId,
				instType: lutStationInstType.instType,
				instUnitsId: stations.instUnitsId,
				unitsReading: lutStationUnits.unitsReading,
				stationTypeId: stations.stationTypeId,
				loggerType: lutStationReadType.loggerType,
				readType: lutStationReadType.readType,
				isgsId: stations.isgsId,
				borDt: stations.borDt,
				borMethodId: stations.borMethodId,
				boringMethod: lutBoringMethod.boringMethod,
				labelAlt: stations.labelAlt,
				comment: stations.comment
			})
			.from(stations)
			.leftJoin(lutStationType, eq(stations.typeId, lutStationType.id))
			.leftJoin(lutLocationType, eq(stations.locationTypeId, lutLocationType.id))
			.leftJoin(lutcInitials, eq(stations.initials, lutcInitials.initials))
			.leftJoin(lutStationInstType, eq(stations.instTypeId, lutStationInstType.id))
			.leftJoin(lutStationUnits, eq(stations.instUnitsId, lutStationUnits.id))
			.leftJoin(lutStationReadType, eq(stations.stationTypeId, lutStationReadType.id))
			.leftJoin(lutBoringMethod, eq(stations.borMethodId, lutBoringMethod.id))
			.where(eq(stations.projectId, id))
			.orderBy(stations.staName),
		db.select().from(lutStationType).orderBy(lutStationType.type),
		db.select().from(lutLocationType).orderBy(lutLocationType.locationType),
		db.select().from(lutcInitials).orderBy(lutcInitials.lastName),
		db.select().from(lutStationInstType).orderBy(lutStationInstType.instType),
		db.select().from(lutStationUnits).orderBy(lutStationUnits.unitsReading),
		db.select().from(lutStationReadType).orderBy(lutStationReadType.loggerType),
		db.select().from(lutBoringMethod).orderBy(lutBoringMethod.boringMethod)
	]);

	if (rows.length === 0) error(404, 'Project not found');

	return {
		project: rows[0],
		siteTypes,
		counties,
		visits: projectVisits,
		stations: projectStations,
		stationTypes,
		locationTypes,
		scientists,
		instTypes,
		stationUnits,
		stationReadTypes,
		boringMethods
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const idotName = (data.get('idotName') as string)?.trim();
		if (!idotName) return fail(400, { error: 'IDOT Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		const countyRaw = data.get('county') as string;
		await db
			.update(projects)
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
			.where(eq(projects.id, id));

		redirect(303, `/projects/${id}`);
	},

	delete: async ({ params }) => {
		const id = parseInt(params.id);
		await db.delete(projects).where(eq(projects.id, id));
		redirect(303, '/');
	},

	saveStation: async ({ request, params }) => {
		const projectId = parseInt(params.id);
		const data = await request.formData();

		const staName = (data.get('staName') as string)?.trim();
		if (!staName) return fail(400, { error: 'Station Name is required' });

		const typeIdRaw = data.get('typeId') as string;
		if (!typeIdRaw) return fail(400, { error: 'Station Type is required' });

		const initials = (data.get('initials') as string)?.trim();
		if (!initials) return fail(400, { error: 'Field Scientist is required' });

		const stationIdRaw = data.get('stationId') as string;
		const stationId = stationIdRaw ? parseInt(stationIdRaw) : null;

		const latRaw = (data.get('latitude') as string)?.trim();
		const lngRaw = (data.get('longitude') as string)?.trim();

		const values = {
			projectId,
			staName,
			typeId: parseInt(typeIdRaw),
			initials,
			code: (data.get('code') as string) || null,
			beginDt: (data.get('beginDt') as string) || null,
			endDt: (data.get('endDt') as string) || null,
			labelAlt: (data.get('labelAlt') as string) || null,
			latitude: latRaw !== '' ? Number(latRaw) : null,
			longitude: lngRaw !== '' ? Number(lngRaw) : null,
			locationTypeId: (data.get('locationTypeId') as string)
				? parseInt(data.get('locationTypeId') as string)
				: null,
			instTypeId: (data.get('instTypeId') as string)
				? parseInt(data.get('instTypeId') as string)
				: null,
			instUnitsId: (data.get('instUnitsId') as string)
				? parseInt(data.get('instUnitsId') as string)
				: null,
			stationTypeId: (data.get('stationTypeId') as string)
				? parseInt(data.get('stationTypeId') as string)
				: null,
			isgsId: (data.get('isgsId') as string) || null,
			borDt: (data.get('borDt') as string) || null,
			borMethodId: (data.get('borMethodId') as string)
				? parseInt(data.get('borMethodId') as string)
				: null,
			comment: (data.get('comment') as string) || null
		};

		if (stationId) {
			await db.update(stations).set(values).where(eq(stations.id, stationId));
		} else {
			await db.insert(stations).values(values);
		}

		redirect(303, `/projects/${projectId}`);
	},

	deleteStation: async ({ request, params }) => {
		const projectId = parseInt(params.id);
		const data = await request.formData();
		const stationId = parseInt(data.get('stationId') as string);
		if (!isNaN(stationId)) {
			await db.delete(stations).where(eq(stations.id, stationId));
		}
		redirect(303, `/projects/${projectId}`);
	},

	addVisit: async ({ request, params }) => {
		const projectId = parseInt(params.id);
		const data = await request.formData();
		const by = (data.get('by') as string)?.trim();
		if (!by) return fail(400, { error: 'Field Scientist is required' });

		await db.insert(visits).values({
			projectId,
			by,
			dt: (data.get('dt') as string) || null,
			note: (data.get('note') as string) || null
		});

		redirect(303, `/projects/${projectId}`);
	}
};

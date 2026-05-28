import { db } from '$lib/server/db';
import {
	visits,
	projects,
	lutcInitials,
	stations,
	stationVisits,
	lutStatus,
	importQueue,
	pressureTemperatureDepth,
	temperatures
} from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ensureBucket, uploadFile } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(404, 'Visit not found');

	const [rows, svRows, statuses, ptdRows, tempRows] = await Promise.all([
		db
			.select({
				id: visits.id,
				dt: visits.dt,
				projectId: visits.projectId,
				projectName: projects.idotName,
				by: visits.by,
				scientistFirst: lutcInitials.firstName,
				scientistLast: lutcInitials.lastName,
				note: visits.note,
				reviewedBy: visits.reviewedBy,
				reviewedDate: visits.reviewedDate
			})
			.from(visits)
			.leftJoin(projects, eq(visits.projectId, projects.id))
			.leftJoin(lutcInitials, eq(visits.by, lutcInitials.initials))
			.where(eq(visits.id, id))
			.limit(1),
		db
			.select({
				id: stationVisits.id,
				stationId: stationVisits.stationId,
				staName: stations.staName,
				code: stations.code,
				time: stationVisits.time,
				level: stationVisits.level,
				statusId: stationVisits.statusId,
				status: lutStatus.status,
				notes: stationVisits.notes
			})
			.from(stationVisits)
			.leftJoin(stations, eq(stationVisits.stationId, stations.id))
			.leftJoin(lutStatus, eq(stationVisits.statusId, lutStatus.id))
			.where(eq(stationVisits.visitId, id))
			.orderBy(asc(stations.staName)),
		db.select().from(lutStatus).orderBy(lutStatus.status),
		db
			.select({
				id: pressureTemperatureDepth.id,
				stationVisitId: pressureTemperatureDepth.stationVisitId,
				pressure: pressureTemperatureDepth.pressure,
				temperature: pressureTemperatureDepth.temperature,
				depth: pressureTemperatureDepth.depth
			})
			.from(pressureTemperatureDepth)
			.innerJoin(stationVisits, eq(pressureTemperatureDepth.stationVisitId, stationVisits.id))
			.where(eq(stationVisits.visitId, id))
			.orderBy(asc(pressureTemperatureDepth.depth)),
		db
			.select({
				id: temperatures.id,
				stationVisitId: temperatures.stationVisitId,
				datetime: temperatures.datetime,
				temperatureCelsius: temperatures.temperatureCelsius
			})
			.from(temperatures)
			.innerJoin(stationVisits, eq(temperatures.stationVisitId, stationVisits.id))
			.where(eq(stationVisits.visitId, id))
			.orderBy(asc(temperatures.datetime))
	]);

	if (rows.length === 0) throw error(404, 'Visit not found');

	return {
		visit: rows[0],
		stationVisits: svRows,
		statuses,
		ptdRecords: ptdRows,
		temperatureRecords: tempRows
	};
};

export const actions: Actions = {
	updateStationVisit: async ({ request, params }) => {
		const visitId = parseInt(params.id);
		const data = await request.formData();
		const svId = parseInt(data.get('stationVisitId') as string);
		const levelRaw = (data.get('level') as string)?.trim();
		const statusIdRaw = data.get('statusId') as string;

		const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);

		if (files.length > 0) {
			await ensureBucket('watershed');
			const keys = await Promise.all(
				files.map(async (file) => {
					const key = `station-visits/${svId}/${Date.now()}-${file.name}`;
					await uploadFile(
						'watershed',
						key,
						await file.arrayBuffer(),
						file.type || 'application/octet-stream'
					);
					return key;
				})
			);
			await db
				.insert(importQueue)
				.values(keys.map((key) => ({ stationVisitId: svId, uri: `s3://watershed/${key}` })));
		}

		await db
			.update(stationVisits)
			.set({
				time: (data.get('time') as string) || null,
				level: levelRaw !== '' ? parseFloat(levelRaw) : null,
				statusId: statusIdRaw ? parseInt(statusIdRaw) : null,
				notes: (data.get('notes') as string) || null
			})
			.where(eq(stationVisits.id, svId));

		redirect(303, `/visits/${visitId}`);
	},

	addPtd: async ({ request }) => {
		const data = await request.formData();
		const svId = parseInt(data.get('stationVisitId') as string);
		const pressureRaw = (data.get('pressure') as string)?.trim();
		const temperatureRaw = (data.get('temperature') as string)?.trim();
		const depthRaw = (data.get('depth') as string)?.trim();

		await db.insert(pressureTemperatureDepth).values({
			stationVisitId: svId,
			pressure: pressureRaw !== '' ? parseFloat(pressureRaw) : null,
			temperature: temperatureRaw !== '' ? parseFloat(temperatureRaw) : null,
			depth: depthRaw !== '' ? parseFloat(depthRaw) : null
		});

		return {};
	},

	updatePtd: async ({ request }) => {
		const data = await request.formData();
		const ptdId = parseInt(data.get('ptdId') as string);
		const pressureRaw = (data.get('pressure') as string)?.trim();
		const temperatureRaw = (data.get('temperature') as string)?.trim();
		const depthRaw = (data.get('depth') as string)?.trim();

		await db
			.update(pressureTemperatureDepth)
			.set({
				pressure: pressureRaw !== '' ? parseFloat(pressureRaw) : null,
				temperature: temperatureRaw !== '' ? parseFloat(temperatureRaw) : null,
				depth: depthRaw !== '' ? parseFloat(depthRaw) : null
			})
			.where(eq(pressureTemperatureDepth.id, ptdId));

		return {};
	},

	deletePtd: async ({ request }) => {
		const data = await request.formData();
		const ptdId = parseInt(data.get('ptdId') as string);
		await db.delete(pressureTemperatureDepth).where(eq(pressureTemperatureDepth.id, ptdId));
		return {};
	}
};

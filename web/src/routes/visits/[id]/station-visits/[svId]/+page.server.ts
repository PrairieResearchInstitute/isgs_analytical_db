import { db } from '$lib/server/db';
import {
	visits,
	stations,
	stationVisits,
	lutStatus,
	stationVisitImportQueue,
	pressureTemperatureDepth,
	temperatures,
	samples
} from '$lib/server/schema';
import { eq, asc, and, inArray } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ensureBucket, uploadFile } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const visitId = parseInt(params.id);
	const svId = parseInt(params.svId);
	if (isNaN(visitId) || isNaN(svId)) throw error(404, 'Not found');

	const [visitRows, svRows, statuses, ptdRows, tempRows, sampleRows] = await Promise.all([
		db.select({ id: visits.id, dt: visits.dt }).from(visits).where(eq(visits.id, visitId)).limit(1),
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
			.where(eq(stationVisits.id, svId))
			.limit(1),
		db.select().from(lutStatus).orderBy(lutStatus.status),
		db
			.select({
				id: pressureTemperatureDepth.id,
				stationVisitId: pressureTemperatureDepth.stationVisitId,
				timestamp: pressureTemperatureDepth.timestamp,
				pressure: pressureTemperatureDepth.pressure,
				temperature: pressureTemperatureDepth.temperature,
				depth: pressureTemperatureDepth.depth,
				includeInReport: pressureTemperatureDepth.includeInReport
			})
			.from(pressureTemperatureDepth)
			.where(eq(pressureTemperatureDepth.stationVisitId, svId))
			.orderBy(asc(pressureTemperatureDepth.timestamp)),
		db
			.select({
				id: temperatures.id,
				stationVisitId: temperatures.stationVisitId,
				datetime: temperatures.datetime,
				temperatureCelsius: temperatures.temperatureCelsius
			})
			.from(temperatures)
			.where(eq(temperatures.stationVisitId, svId))
			.orderBy(asc(temperatures.datetime)),
		db
			.select()
			.from(samples)
			.where(eq(samples.stationVisitId, svId))
			.orderBy(asc(samples.sampleName))
	]);

	if (visitRows.length === 0) throw error(404, 'Visit not found');
	if (svRows.length === 0) throw error(404, 'Station visit not found');

	return {
		visit: visitRows[0],
		stationVisit: svRows[0],
		statuses,
		ptdRecords: ptdRows,
		temperatureRecords: tempRows,
		samples: sampleRows
	};
};

export const actions: Actions = {
	updateStationVisit: async ({ request, params }) => {
		const visitId = parseInt(params.id);
		const svId = parseInt(params.svId);
		const data = await request.formData();
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
				.insert(stationVisitImportQueue)
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

		redirect(303, `/visits/${visitId}/station-visits/${svId}`);
	},

	updatePtdExclusions: async ({ request, params }) => {
		const svId = parseInt(params.svId);
		const data = await request.formData();
		const excludedIds: number[] = JSON.parse((data.get('excludedIds') as string) || '[]');
		const includedIds: number[] = JSON.parse((data.get('includedIds') as string) || '[]');

		if (excludedIds.length > 0) {
			await db
				.update(pressureTemperatureDepth)
				.set({ includeInReport: false })
				.where(
					and(
						eq(pressureTemperatureDepth.stationVisitId, svId),
						inArray(pressureTemperatureDepth.id, excludedIds)
					)
				);
		}
		if (includedIds.length > 0) {
			await db
				.update(pressureTemperatureDepth)
				.set({ includeInReport: true })
				.where(
					and(
						eq(pressureTemperatureDepth.stationVisitId, svId),
						inArray(pressureTemperatureDepth.id, includedIds)
					)
				);
		}
		return {};
	},

	addPtd: async ({ request, params }) => {
		const svId = parseInt(params.svId);
		const data = await request.formData();
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
	},

	addSample: async ({ request, params }) => {
		const svId = parseInt(params.svId);
		const data = await request.formData();
		await db.insert(samples).values({
			stationVisitId: svId,
			sampleName: (data.get('sampleName') as string) || null,
			notes: (data.get('notes') as string) || null
		});
		return {};
	},

	updateSample: async ({ request }) => {
		const data = await request.formData();
		const sampleId = parseInt(data.get('sampleId') as string);
		await db
			.update(samples)
			.set({
				sampleName: (data.get('sampleName') as string) || null,
				notes: (data.get('notes') as string) || null
			})
			.where(eq(samples.id, sampleId));
		return {};
	},

	deleteSample: async ({ request }) => {
		const data = await request.formData();
		const sampleId = parseInt(data.get('sampleId') as string);
		await db.delete(samples).where(eq(samples.id, sampleId));
		return {};
	}
};

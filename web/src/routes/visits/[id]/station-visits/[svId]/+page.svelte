<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import PtdReviewPanel from './PtdReviewPanel.svelte';
	import {
		Chart,
		ScatterController,
		LinearScale,
		PointElement,
		LineElement,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(ScatterController, LinearScale, PointElement, LineElement, Tooltip, Legend);

	let { data }: { data: PageData } = $props();

	let selectedFiles = $state<File[]>([]);
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	let pressureChartCanvas = $state<HTMLCanvasElement | null>(null);
	let tempChartCanvas = $state<HTMLCanvasElement | null>(null);
	let depthChartCanvas = $state<HTMLCanvasElement | null>(null);
	let diverTempCanvas = $state<HTMLCanvasElement | null>(null);

	let showPtdReview = $state(false);

	let sampleDialog = $state<HTMLDialogElement | null>(null);
	let editingSample = $state<(typeof data.samples)[0] | null>(null);

	function onSampleDialogClick(e: MouseEvent) {
		if (e.target === sampleDialog) sampleDialog?.close();
	}
	function openAddSample() {
		editingSample = null;
		sampleDialog?.showModal();
	}
	function openEditSample(s: (typeof data.samples)[0]) {
		editingSample = s;
		sampleDialog?.showModal();
	}

	function calcStats(vals: number[]) {
		if (!vals.length) return null;
		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
		return { min, max, mean, count: vals.length };
	}

	let ptdStats = $derived.by(() => {
		const depths = data.ptdRecords.map((r) => r.depth).filter((v): v is number => v != null);
		const pressures = data.ptdRecords.map((r) => r.pressure).filter((v): v is number => v != null);
		const temps = data.ptdRecords.map((r) => r.temperature).filter((v): v is number => v != null);
		return {
			total: data.ptdRecords.length,
			depth: calcStats(depths),
			pressure: calcStats(pressures),
			temperature: calcStats(temps)
		};
	});

	let tempStats = $derived.by(() => {
		const vals = data.temperatureRecords
			.map((r) => r.temperatureCelsius)
			.filter((v): v is number => v != null);
		return { total: data.temperatureRecords.length, temperature: calcStats(vals) };
	});

	$effect(() => {
		if (!pressureChartCanvas || !tempChartCanvas || !depthChartCanvas || !data.ptdRecords.length)
			return;

		const toMs = (r: (typeof data.ptdRecords)[0]) =>
			r.timestamp ? new Date(r.timestamp).getTime() : null;

		const sharedXAxis = {
			title: { display: true, text: 'Time', color: '#707372' },
			ticks: {
				color: '#707372',
				callback: (val: number | string) => new Date(val as number).toLocaleDateString()
			},
			grid: { color: '#E8E9EB' }
		};

		function makeChart(
			canvas: HTMLCanvasElement,
			label: string,
			color: string,
			yField: (r: (typeof data.ptdRecords)[0]) => number | null | undefined,
			yLabel: string
		) {
			const chartData = data.ptdRecords
				.filter((r) => toMs(r) != null && yField(r) != null)
				.map((r) => ({ x: toMs(r) as number, y: yField(r) as number }));

			return new Chart(canvas, {
				type: 'scatter',
				data: {
					datasets: [
						{
							label,
							data: chartData,
							borderColor: color,
							backgroundColor: color + '33',
							pointRadius: chartData.length > 500 ? 1 : 3,
							showLine: true,
							borderWidth: 1.5
						}
					]
				},
				options: {
					animation: false,
					responsive: true,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: (ctx) =>
									`${new Date(ctx.parsed.x!).toLocaleString()}: ${ctx.parsed.y!.toFixed(3)}`
							}
						}
					},
					scales: {
						x: sharedXAxis,
						y: {
							title: { display: true, text: yLabel, color: '#707372' },
							ticks: { color: '#707372' },
							grid: { color: '#E8E9EB' }
						}
					}
				}
			});
		}

		const pChart = makeChart(
			pressureChartCanvas,
			'Pressure',
			'#13294B',
			(r) => r.pressure,
			'Pressure (psi)'
		);
		const tChart = makeChart(
			tempChartCanvas,
			'Temperature',
			'#E84A27',
			(r) => r.temperature,
			'Temperature (°C)'
		);
		const dChart = makeChart(depthChartCanvas, 'Depth', '#1f7a4f', (r) => r.depth, 'Depth (m)');

		return () => {
			pChart.destroy();
			tChart.destroy();
			dChart.destroy();
		};
	});

	$effect(() => {
		if (!diverTempCanvas || !data.temperatureRecords.length) return;

		const chartData = data.temperatureRecords
			.filter((r) => r.datetime != null && r.temperatureCelsius != null)
			.map((r) => ({ x: new Date(r.datetime!).getTime(), y: r.temperatureCelsius as number }));

		const chart = new Chart(diverTempCanvas, {
			type: 'scatter',
			data: {
				datasets: [
					{
						label: 'Temperature (°C)',
						data: chartData,
						borderColor: '#E84A27',
						backgroundColor: '#E84A2733',
						pointRadius: chartData.length > 500 ? 1 : 3,
						showLine: true,
						borderWidth: 1.5
					}
				]
			},
			options: {
				animation: false,
				responsive: true,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) =>
								`${new Date(ctx.parsed.x!).toLocaleString()}: ${ctx.parsed.y!.toFixed(2)} °C`
						}
					}
				},
				scales: {
					x: {
						title: { display: true, text: 'Time', color: '#707372' },
						ticks: {
							color: '#707372',
							callback: (val) => new Date(val as number).toLocaleDateString()
						},
						grid: { color: '#E8E9EB' }
					},
					y: {
						title: { display: true, text: 'Temperature (°C)', color: '#707372' },
						ticks: { color: '#707372' },
						grid: { color: '#E8E9EB' }
					}
				}
			}
		});

		return () => chart.destroy();
	});

	function addFiles(incoming: FileList | File[]) {
		const next = [...selectedFiles];
		for (const f of incoming) {
			if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
		}
		selectedFiles = next;
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<svelte:head>
	<title>Station Visit — {data.stationVisit.staName ?? 'Unknown'} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6">
	<a
		href="/visits/{data.visit.id}"
		class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
	>
		&larr; Visit #{data.visit.id}
	</a>
</div>

<!-- Page heading -->
<div class="mb-6">
	<h1 class="font-heading font-bold text-3xl text-il-blue">
		{data.stationVisit.staName ?? 'Station Visit'}
	</h1>
	{#if data.stationVisit.code}
		<p class="mt-1 text-sm font-sans font-mono text-il-storm">{data.stationVisit.code}</p>
	{/if}
</div>

<!-- Edit form -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden mb-8">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h2 class="font-heading font-semibold text-base text-il-blue">Edit Station Visit</h2>
	</div>

	<form
		method="POST"
		action="?/updateStationVisit"
		enctype="multipart/form-data"
		use:enhance={(e) => {
			for (const file of selectedFiles) e.formData.append('files', file);
			return ({ update }) =>
				update().then(() => {
					selectedFiles = [];
				});
		}}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<!-- Time -->
		<div class="flex flex-col gap-1">
			<label
				for="sv-time"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Time
			</label>
			<input
				id="sv-time"
				name="time"
				type="time"
				value={data.stationVisit.time ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
			/>
		</div>

		<!-- Level -->
		<div class="flex flex-col gap-1">
			<label
				for="sv-level"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Level
			</label>
			<input
				id="sv-level"
				name="level"
				type="number"
				step="any"
				value={data.stationVisit.level ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
			/>
		</div>

		<!-- Status -->
		<div class="flex flex-col gap-1">
			<label
				for="sv-status"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Status
			</label>
			<select
				id="sv-status"
				name="statusId"
				value={data.stationVisit.statusId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
			>
				<option value="">— Select status —</option>
				{#each data.statuses as s (s.id)}
					<option value={s.id}>{s.status}</option>
				{/each}
			</select>
		</div>

		<!-- Notes -->
		<div class="flex flex-col gap-1">
			<label
				for="sv-notes"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Notes
			</label>
			<textarea
				id="sv-notes"
				name="notes"
				rows={3}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-y max-w-lg"
				>{data.stationVisit.notes ?? ''}</textarea
			>
		</div>

		<!-- Files -->
		<div class="flex flex-col gap-2 max-w-lg">
			<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Data Files
			</span>

			<!-- Drop zone -->
			<div
				role="button"
				tabindex="0"
				onclick={() => fileInput?.click()}
				onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => (isDragging = false)}
				ondrop={(e) => {
					e.preventDefault();
					isDragging = false;
					if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
				}}
				class="border-2 border-dashed rounded px-4 py-6 flex flex-col items-center gap-1 cursor-pointer transition-colors
               {isDragging
					? 'border-il-blue bg-il-storm-95'
					: 'border-il-cloud hover:border-il-blue hover:bg-il-storm-95'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-7 h-7 text-il-storm"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
					/>
				</svg>
				<span class="text-sm font-sans text-il-storm">
					Drop files here or <span class="text-il-blue font-semibold">Browse</span>
				</span>
				<span class="text-xs font-sans text-il-storm opacity-60">Multiple files allowed</span>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				multiple
				class="sr-only"
				onchange={(e) => {
					const input = e.currentTarget as HTMLInputElement;
					if (input.files) addFiles(input.files);
					input.value = '';
				}}
			/>

			<!-- Selected file list -->
			{#if selectedFiles.length > 0}
				<ul class="flex flex-col gap-1">
					{#each selectedFiles as file, i (file.name + file.size)}
						<li
							class="flex items-center justify-between text-sm font-sans px-3 py-1.5 rounded bg-il-storm-95 border border-il-cloud"
						>
							<span class="truncate text-il-storm-30 mr-2">{file.name}</span>
							<span class="shrink-0 flex items-center gap-2 text-il-storm text-xs">
								{formatBytes(file.size)}
								<button
									type="button"
									onclick={() => removeFile(i)}
									class="text-il-storm hover:text-red-600 font-bold leading-none"
									aria-label="Remove {file.name}">&times;</button
								>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="flex pt-2">
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				Save
			</button>
		</div>
	</form>
</div>

<!-- Samples section -->
<div class="mb-8">
	<div class="flex items-center justify-between mb-4">
		<h2 class="font-heading font-bold text-xl text-il-blue">Samples</h2>
		<button
			type="button"
			onclick={openAddSample}
			class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
		>
			+ Add Sample
		</button>
	</div>
	{#if data.samples.length === 0}
		<div class="border-2 border-il-cloud rounded p-10 text-center text-il-storm font-sans">
			No samples recorded for this visit.
		</div>
	{:else}
		<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
			<div class="overflow-y-auto max-h-[440px]">
				<table class="w-full text-sm font-sans">
					<thead class="bg-il-blue text-white sticky top-0 z-10">
						<tr>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
								>Sample Name</th
							>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Notes</th>
							<th class="px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each data.samples as sample (sample.id)}
							<tr
								class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
							>
								<td class="px-4 py-3 font-semibold text-il-storm-30">{sample.sampleName ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">{sample.notes ?? '—'}</td>
								<td class="px-4 py-3">
									<button
										type="button"
										onclick={() => openEditSample(sample)}
										class="text-xs font-sans font-semibold text-il-blue hover:underline"
										>Edit</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- PTD section -->
{#if data.ptdRecords.length > 0}
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="font-heading font-bold text-xl text-il-blue">PTD Measurements</h2>
			<button
				type="button"
				onclick={() => (showPtdReview = true)}
				class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
			>
				Review PTD
			</button>
		</div>

		<!-- Summary statistics -->
		<div class="grid grid-cols-3 gap-4 mb-4">
			{#each [{ label: 'Depth', stats: ptdStats.depth }, { label: 'Pressure', stats: ptdStats.pressure }, { label: 'Temperature', stats: ptdStats.temperature }] as col (col.label)}
				<div class="border border-il-cloud rounded p-4 bg-il-storm-95">
					<div class="font-heading font-semibold text-il-blue text-sm mb-2">{col.label}</div>
					<div class="text-xs font-sans text-il-storm space-y-1">
						<div class="flex justify-between">
							<span>Records</span>
							<span class="font-semibold text-il-storm-30">{col.stats?.count ?? '—'}</span>
						</div>
						<div class="flex justify-between">
							<span>Min</span>
							<span class="font-semibold text-il-storm-30"
								>{col.stats ? col.stats.min.toFixed(2) : '—'}</span
							>
						</div>
						<div class="flex justify-between">
							<span>Max</span>
							<span class="font-semibold text-il-storm-30"
								>{col.stats ? col.stats.max.toFixed(2) : '—'}</span
							>
						</div>
						<div class="flex justify-between">
							<span>Mean</span>
							<span class="font-semibold text-il-storm-30"
								>{col.stats ? col.stats.mean.toFixed(2) : '—'}</span
							>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Time-series charts -->
		<div class="flex flex-wrap gap-4">
			<div class="flex-1 min-w-60 border border-il-cloud rounded p-3 bg-white">
				<div class="font-heading font-semibold text-il-blue text-sm mb-2">Pressure over Time</div>
				<canvas bind:this={pressureChartCanvas}></canvas>
			</div>
			<div class="flex-1 min-w-60 border border-il-cloud rounded p-3 bg-white">
				<div class="font-heading font-semibold text-il-blue text-sm mb-2">
					Temperature over Time
				</div>
				<canvas bind:this={tempChartCanvas}></canvas>
			</div>
			<div class="flex-1 min-w-60 border border-il-cloud rounded p-3 bg-white">
				<div class="font-heading font-semibold text-il-blue text-sm mb-2">Depth over Time</div>
				<canvas bind:this={depthChartCanvas}></canvas>
			</div>
		</div>
	</div>
{/if}

{#if showPtdReview}
	<div transition:fly={{ y: '100%', duration: 300 }} class="fixed inset-0 z-50">
		<PtdReviewPanel records={data.ptdRecords} onclose={() => (showPtdReview = false)} />
	</div>
{/if}

<!-- Temperature section -->
{#if data.temperatureRecords.length > 0}
	<div class="mb-8">
		<h2 class="font-heading font-bold text-xl text-il-blue mb-4">Temperatures</h2>

		<!-- Summary statistics -->
		<div class="grid grid-cols-1 gap-4 max-w-xs mb-4">
			<div class="border border-il-cloud rounded p-4 bg-il-storm-95">
				<div class="font-heading font-semibold text-il-blue text-sm mb-2">Temperature (°C)</div>
				<div class="text-xs font-sans text-il-storm space-y-1">
					<div class="flex justify-between">
						<span>Records</span>
						<span class="font-semibold text-il-storm-30">{tempStats.temperature?.count ?? '—'}</span
						>
					</div>
					<div class="flex justify-between">
						<span>Min</span>
						<span class="font-semibold text-il-storm-30"
							>{tempStats.temperature ? tempStats.temperature.min.toFixed(2) : '—'}</span
						>
					</div>
					<div class="flex justify-between">
						<span>Max</span>
						<span class="font-semibold text-il-storm-30"
							>{tempStats.temperature ? tempStats.temperature.max.toFixed(2) : '—'}</span
						>
					</div>
					<div class="flex justify-between">
						<span>Mean</span>
						<span class="font-semibold text-il-storm-30"
							>{tempStats.temperature ? tempStats.temperature.mean.toFixed(2) : '—'}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Time-series chart -->
		<div class="border border-il-cloud rounded p-3 bg-white">
			<div class="font-heading font-semibold text-il-blue text-sm mb-2">Temperature over Time</div>
			<canvas bind:this={diverTempCanvas}></canvas>
		</div>
	</div>
{/if}

<!-- Sample dialog -->
<dialog
	bind:this={sampleDialog}
	onclick={onSampleDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">
			{editingSample ? 'Edit Sample' : 'Add Sample'}
		</h2>
		<button
			type="button"
			onclick={() => sampleDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close">&times;</button
		>
	</div>

	<form
		method="POST"
		action={editingSample ? '?/updateSample' : '?/addSample'}
		use:enhance={() =>
			({ update }) =>
				update().then(() => sampleDialog?.close())}
		class="px-6 py-5 flex flex-col gap-4"
	>
		{#if editingSample}
			<input type="hidden" name="sampleId" value={editingSample.id} />
		{/if}

		<div class="flex flex-col gap-1">
			<label
				for="sampleName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Sample Name
			</label>
			<input
				id="sampleName"
				name="sampleName"
				type="text"
				maxlength="32"
				value={editingSample?.sampleName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label
				for="sampleNotes"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Notes
			</label>
			<textarea
				id="sampleNotes"
				name="notes"
				rows={3}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-y"
				>{editingSample?.notes ?? ''}</textarea
			>
		</div>

		<div class="flex items-center justify-between pt-2">
			<button
				type="button"
				onclick={() => sampleDialog?.close()}
				class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
				>Cancel</button
			>
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
				>Save</button
			>
		</div>
	</form>

	{#if editingSample}
		<div class="px-6 pb-5">
			<form
				method="POST"
				action="?/deleteSample"
				use:enhance={() =>
					({ update }) =>
						update().then(() => sampleDialog?.close())}
			>
				<input type="hidden" name="sampleId" value={editingSample.id} />
				<button type="submit" class="text-xs font-sans font-semibold text-red-600 hover:underline"
					>Delete sample</button
				>
			</form>
		</div>
	{/if}
</dialog>

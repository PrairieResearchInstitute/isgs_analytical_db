<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
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

	let stationVisitDialog = $state<HTMLDialogElement | null>(null);
	let editingSV = $state<(typeof data.stationVisits)[0] | null>(null);
	let selectedFiles = $state<File[]>([]);
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	let ptdDialog = $state<HTMLDialogElement | null>(null);
	let ptdSV = $state<(typeof data.stationVisits)[0] | null>(null);
	let ptdRows = $derived(data.ptdRecords.filter((r) => r.stationVisitId === ptdSV?.id));

	let pressureCanvas = $state<HTMLCanvasElement | null>(null);
	let tempCanvas = $state<HTMLCanvasElement | null>(null);

	let tempDialog = $state<HTMLDialogElement | null>(null);
	let tempSV = $state<(typeof data.stationVisits)[0] | null>(null);
	let tempRows = $derived(data.temperatureRecords.filter((r) => r.stationVisitId === tempSV?.id));
	let tempChartCanvas = $state<HTMLCanvasElement | null>(null);

	function calcStats(vals: number[]) {
		if (!vals.length) return null;
		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
		return { min, max, mean, count: vals.length };
	}

	let tempStats = $derived.by(() => {
		const vals = tempRows.map((r) => r.temperatureCelsius).filter((v): v is number => v != null);
		return { total: tempRows.length, temperature: calcStats(vals) };
	});

	let ptdStats = $derived.by(() => {
		const depths = ptdRows.map((r) => r.depth).filter((v): v is number => v != null);
		const pressures = ptdRows.map((r) => r.pressure).filter((v): v is number => v != null);
		const temps = ptdRows.map((r) => r.temperature).filter((v): v is number => v != null);
		return {
			total: ptdRows.length,
			depth: calcStats(depths),
			pressure: calcStats(pressures),
			temperature: calcStats(temps)
		};
	});

	$effect(() => {
		if (!pressureCanvas || !tempCanvas || !ptdRows.length) return;

		const profilePoints = ptdRows
			.filter((r) => r.depth != null)
			.map((r) => ({ depth: r.depth as number, pressure: r.pressure, temperature: r.temperature }))
			.sort((a, b) => a.depth - b.depth);

		const pressureData = profilePoints
			.filter((p) => p.pressure != null)
			.map((p) => ({ x: p.pressure as number, y: p.depth }));

		const tempData = profilePoints
			.filter((p) => p.temperature != null)
			.map((p) => ({ x: p.temperature as number, y: p.depth }));

		const sharedYAxis = {
			reverse: true,
			title: { display: true, text: 'Depth', color: '#707372' },
			ticks: { color: '#707372' },
			grid: { color: '#E8E9EB' }
		};

		const pChart = new Chart(pressureCanvas, {
			type: 'scatter',
			data: {
				datasets: [
					{
						label: 'Pressure',
						data: pressureData,
						borderColor: '#13294B',
						backgroundColor: '#13294B33',
						pointRadius: pressureData.length > 500 ? 1 : 3,
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
						callbacks: { label: (ctx) => `Depth: ${ctx.parsed.y}, Pressure: ${ctx.parsed.x}` }
					}
				},
				scales: {
					x: {
						title: { display: true, text: 'Pressure', color: '#707372' },
						ticks: { color: '#707372' },
						grid: { color: '#E8E9EB' }
					},
					y: sharedYAxis
				}
			}
		});

		const tChart = new Chart(tempCanvas, {
			type: 'scatter',
			data: {
				datasets: [
					{
						label: 'Temperature',
						data: tempData,
						borderColor: '#E84A27',
						backgroundColor: '#E84A2733',
						pointRadius: tempData.length > 500 ? 1 : 3,
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
						callbacks: { label: (ctx) => `Depth: ${ctx.parsed.y}, Temp: ${ctx.parsed.x}` }
					}
				},
				scales: {
					x: {
						title: { display: true, text: 'Temperature', color: '#707372' },
						ticks: { color: '#707372' },
						grid: { color: '#E8E9EB' }
					},
					y: sharedYAxis
				}
			}
		});

		return () => {
			pChart.destroy();
			tChart.destroy();
		};
	});

	$effect(() => {
		if (!tempChartCanvas || !tempRows.length) return;

		const chartData = tempRows
			.filter((r) => r.datetime != null && r.temperatureCelsius != null)
			.map((r) => ({ x: new Date(r.datetime!).getTime(), y: r.temperatureCelsius as number }));

		const chart = new Chart(tempChartCanvas, {
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

	function openEditSV(sv: (typeof data.stationVisits)[0]) {
		editingSV = sv;
		selectedFiles = [];
		stationVisitDialog?.showModal();
	}

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

	function onSVDialogClick(e: MouseEvent) {
		if (e.target === stationVisitDialog) stationVisitDialog?.close();
	}

	function openPtd(sv: (typeof data.stationVisits)[0]) {
		ptdSV = sv;
		ptdDialog?.showModal();
	}

	function onPtdDialogClick(e: MouseEvent) {
		if (e.target === ptdDialog) ptdDialog?.close();
	}

	function openTemp(sv: (typeof data.stationVisits)[0]) {
		tempSV = sv;
		tempDialog?.showModal();
	}

	function onTempDialogClick(e: MouseEvent) {
		if (e.target === tempDialog) tempDialog?.close();
	}

	function formatDate(val: string | null): string {
		if (!val) return '—';
		return val;
	}

	function scientistLabel(
		first: string | null,
		last: string | null,
		initials: string | null
	): string {
		const name = [first, last].filter(Boolean).join(' ');
		if (name && initials) return `${initials} — ${name}`;
		return name || initials || '—';
	}
</script>

<svelte:head>
	<title>Visit #{data.visit.id} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Back link -->
<div class="mb-6">
	<a
		href="/visits"
		class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
	>
		&larr; Back to Visits
	</a>
</div>

<!-- Page heading -->
<div class="mb-6">
	<h1 class="font-heading font-bold text-3xl text-il-blue">Visit #{data.visit.id}</h1>
	{#if data.visit.dt}
		<p class="mt-1 text-sm font-sans text-il-storm">{data.visit.dt}</p>
	{/if}
</div>

<!-- Detail card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h2 class="font-heading font-semibold text-base text-il-blue">Visit Details</h2>
	</div>
	<dl class="divide-y divide-il-cloud font-sans">
		<!-- Project -->
		<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5">
				Project
			</dt>
			<dd class="text-il-storm-30 mt-1 sm:mt-0">
				{#if data.visit.projectId}
					<a href="/projects/{data.visit.projectId}" class="text-il-blue hover:underline">
						{data.visit.projectName ?? `Project ${data.visit.projectId}`}
					</a>
				{:else}
					{data.visit.projectName ?? '—'}
				{/if}
			</dd>
		</div>

		<!-- Field Scientist -->
		<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5">
				Field Scientist
			</dt>
			<dd class="text-il-storm-30 mt-1 sm:mt-0">
				{scientistLabel(data.visit.scientistFirst, data.visit.scientistLast, data.visit.by)}
			</dd>
		</div>

		<!-- Date -->
		<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5">
				Date
			</dt>
			<dd class="text-il-storm-30 mt-1 sm:mt-0">{formatDate(data.visit.dt)}</dd>
		</div>

		<!-- Notes -->
		<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5">
				Notes
			</dt>
			<dd class="text-il-storm-30 mt-1 sm:mt-0 whitespace-pre-wrap">{data.visit.note ?? '—'}</dd>
		</div>

		<!-- Reviewed By (conditional) -->
		{#if data.visit.reviewedBy != null}
			<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
				<dt
					class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5"
				>
					Reviewed By
				</dt>
				<dd class="text-il-storm-30 mt-1 sm:mt-0">{data.visit.reviewedBy}</dd>
			</div>
		{/if}

		<!-- Review Date (conditional) -->
		{#if data.visit.reviewedDate != null}
			<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
				<dt
					class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5"
				>
					Review Date
				</dt>
				<dd class="text-il-storm-30 mt-1 sm:mt-0">{formatDate(data.visit.reviewedDate)}</dd>
			</div>
		{/if}
	</dl>
</div>

<!-- Station Visits section -->
<div class="mt-8">
	<h2 class="font-heading font-bold text-xl text-il-blue mb-4">Station Visits</h2>
	{#if data.stationVisits.length === 0}
		<div class="border-2 border-il-cloud rounded p-10 text-center text-il-storm font-sans">
			No stations recorded for this visit.
		</div>
	{:else}
		<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
			<div class="overflow-y-auto max-h-[440px]">
				<table class="w-full text-sm font-sans">
					<thead class="bg-il-blue text-white sticky top-0 z-10">
						<tr>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Station</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Code</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Time</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Level</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Status</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Notes</th>
							<th class="px-4 py-3"></th>
							<th class="px-4 py-3"></th>
							<th class="px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each data.stationVisits as sv (sv.id)}
							<tr
								class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
							>
								<td class="px-4 py-3 font-semibold text-il-storm-30">{sv.staName ?? '—'}</td>
								<td class="px-4 py-3 font-mono text-il-storm">{sv.code ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">{sv.time ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">{sv.level ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">{sv.status ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">{sv.notes ?? '—'}</td>
								<td class="px-4 py-3">
									<button
										type="button"
										onclick={() => openEditSV(sv)}
										class="text-il-blue hover:underline text-sm font-sans font-semibold"
									>
										Edit
									</button>
								</td>
								<td class="px-4 py-3">
									<button
										type="button"
										onclick={() => openPtd(sv)}
										class="text-il-blue hover:underline text-sm font-sans font-semibold"
									>
										PTD
									</button>
								</td>
								<td class="px-4 py-3">
									<button
										type="button"
										onclick={() => openTemp(sv)}
										class="text-il-blue hover:underline text-sm font-sans font-semibold"
									>
										Temp
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Edit Station Visit dialog -->
<dialog
	bind:this={stationVisitDialog}
	onclick={onSVDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">Edit Station Visit</h2>
		<button
			type="button"
			onclick={() => stationVisitDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
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
					stationVisitDialog?.close();
				});
		}}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<input type="hidden" name="stationVisitId" value={editingSV?.id ?? ''} />

		<!-- Station (read-only display) -->
		<div class="flex flex-col gap-1">
			<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Station
			</span>
			<span class="text-sm font-sans text-il-storm-30">
				{editingSV?.staName ?? '—'}
				{#if editingSV?.code}
					<span class="font-mono text-il-storm ml-2">({editingSV.code})</span>
				{/if}
			</span>
		</div>

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
				value={editingSV?.time ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
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
				value={editingSV?.level ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
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
				value={editingSV?.statusId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
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
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-y"
				>{editingSV?.notes ?? ''}</textarea
			>
		</div>

		<!-- Files -->
		<div class="flex flex-col gap-2">
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

		<div class="flex justify-end pt-2">
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				Save
			</button>
		</div>
	</form>
</dialog>

<!-- Temperatures dialog -->
<dialog
	bind:this={tempDialog}
	onclick={onTempDialogClick}
	class="w-full max-w-4xl rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">
			Temperatures — {tempSV?.staName ?? ''}
		</h2>
		<button
			type="button"
			onclick={() => tempDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<div class="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
		{#if tempRows.length === 0}
			<p class="text-il-storm font-sans text-sm text-center py-8">
				No temperature data for this station visit.
			</p>
		{:else}
			<!-- Summary statistics -->
			<div class="grid grid-cols-1 gap-4 max-w-xs">
				<div class="border border-il-cloud rounded p-4 bg-il-storm-95">
					<div class="font-heading font-semibold text-il-blue text-sm mb-2">Temperature (°C)</div>
					<div class="text-xs font-sans text-il-storm space-y-1">
						<div class="flex justify-between">
							<span>Records</span>
							<span class="font-semibold text-il-storm-30"
								>{tempStats.temperature?.count ?? '—'}</span
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
				<div class="font-heading font-semibold text-il-blue text-sm mb-2">
					Temperature over Time
				</div>
				<canvas bind:this={tempChartCanvas}></canvas>
			</div>
		{/if}
	</div>
</dialog>

<!-- PTD Measurements dialog -->
<dialog
	bind:this={ptdDialog}
	onclick={onPtdDialogClick}
	class="w-full max-w-4xl rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">
			PTD Measurements — {ptdSV?.staName ?? ''}
		</h2>
		<button
			type="button"
			onclick={() => ptdDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<div class="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
		{#if ptdRows.length === 0}
			<p class="text-il-storm font-sans text-sm text-center py-8">No PTD data for this visit.</p>
		{:else}
			<!-- Summary statistics -->
			<div class="grid grid-cols-3 gap-4">
				{#each [{ label: 'Depth', stats: ptdStats.depth }, { label: 'Pressure', stats: ptdStats.pressure }, { label: 'Temperature', stats: ptdStats.temperature }] as col}
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

			<!-- Depth profile charts -->
			<div class="flex flex-wrap gap-4">
				<div class="flex-1 min-w-60 border border-il-cloud rounded p-3 bg-white">
					<div class="font-heading font-semibold text-il-blue text-sm mb-2">Pressure Profile</div>
					<canvas bind:this={pressureCanvas}></canvas>
				</div>
				<div class="flex-1 min-w-60 border border-il-cloud rounded p-3 bg-white">
					<div class="font-heading font-semibold text-il-blue text-sm mb-2">
						Temperature Profile
					</div>
					<canvas bind:this={tempCanvas}></canvas>
				</div>
			</div>
		{/if}
	</div>
</dialog>

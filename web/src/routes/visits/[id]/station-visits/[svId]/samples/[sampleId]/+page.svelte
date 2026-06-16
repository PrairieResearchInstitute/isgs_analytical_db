<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let selectedFile = $state<File | null>(null);
	let isDragging = $state(false);
	let isEditing = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	function addFile(f: File) {
		if (f.name.toLowerCase().endsWith('.csv')) selectedFile = f;
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatTime(ts: Date | null): string {
		if (!ts) return '—';
		return ts.toTimeString().slice(0, 8);
	}
</script>

<svelte:head>
	<title>{data.sample.sampleName ?? 'Sample'} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6">
	<a
		href="/visits/{data.visitId}/station-visits/{data.svId}"
		class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
	>
		&larr; {data.stationName ?? 'Station Visit'}
	</a>
</div>

<!-- Page heading -->
<div class="mb-6">
	<h1 class="font-heading font-bold text-3xl text-il-blue">
		{data.sample.sampleName ?? 'Sample'}
	</h1>
</div>

<!-- Context card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden mb-8">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h2 class="font-heading font-semibold text-base text-il-blue">Context</h2>
	</div>
	<div class="px-6 py-5 flex flex-col gap-3">
		<div class="flex flex-col gap-0.5">
			<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Project
			</span>
			<span class="text-sm font-sans text-il-storm-30">{data.projectName ?? '—'}</span>
		</div>
		<div class="flex flex-col gap-0.5">
			<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Station
			</span>
			<span class="text-sm font-sans text-il-storm-30">{data.stationName ?? '—'}</span>
		</div>
	</div>
</div>

<!-- Sample details card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden mb-8">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud flex items-center justify-between">
		<h2 class="font-heading font-semibold text-base text-il-blue">Sample Details</h2>
		{#if !isEditing}
			<button
				type="button"
				onclick={() => (isEditing = true)}
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-1.5 rounded transition-opacity"
			>
				Edit
			</button>
		{/if}
	</div>

	{#if !isEditing}
		<div class="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-4">
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Sample Name</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.sampleName ?? '—'}</span>
			</div>
			<div class="col-span-2 flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Notes</span
				>
				<span class="text-sm font-sans text-il-storm-30 whitespace-pre-wrap"
					>{data.sample.notes ?? '—'}</span
				>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Pump Type</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.pumpType ?? '—'}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Flow Rate (ml/min)</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.flowRate ?? '—'}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Final Flow Rate (ml/min)</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.finalFlowRate ?? '—'}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Tubing Type</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.tubingType ?? '—'}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Device Model</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.deviceModel ?? '—'}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
					>Device SN</span
				>
				<span class="text-sm font-sans text-il-storm-30">{data.sample.deviceSn ?? '—'}</span>
			</div>
		</div>
	{:else}
		<form method="POST" action="?/updateSample" use:enhance class="px-6 py-5 flex flex-col gap-4">
			<!-- Sample Name -->
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
					value={data.sample.sampleName ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Notes -->
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
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-y max-w-lg"
					>{data.sample.notes ?? ''}</textarea
				>
			</div>

			<!-- Pump Type -->
			<div class="flex flex-col gap-1">
				<label
					for="pumpType"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Pump Type
				</label>
				<input
					id="pumpType"
					name="pumpType"
					type="text"
					value={data.sample.pumpType ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Flow Rate -->
			<div class="flex flex-col gap-1">
				<label
					for="flowRate"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Flow Rate (ml/min)
				</label>
				<input
					id="flowRate"
					name="flowRate"
					type="number"
					step="0.1"
					value={data.sample.flowRate ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Final Flow Rate -->
			<div class="flex flex-col gap-1">
				<label
					for="finalFlowRate"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Final Flow Rate (ml/min)
				</label>
				<input
					id="finalFlowRate"
					name="finalFlowRate"
					type="number"
					step="0.1"
					value={data.sample.finalFlowRate ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Tubing Type -->
			<div class="flex flex-col gap-1">
				<label
					for="tubingType"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Tubing Type
				</label>
				<input
					id="tubingType"
					name="tubingType"
					type="text"
					value={data.sample.tubingType ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Device Model -->
			<div class="flex flex-col gap-1">
				<label
					for="deviceModel"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Device Model
				</label>
				<input
					id="deviceModel"
					name="deviceModel"
					type="text"
					value={data.sample.deviceModel ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<!-- Device SN -->
			<div class="flex flex-col gap-1">
				<label
					for="deviceSn"
					class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
				>
					Device SN
				</label>
				<input
					id="deviceSn"
					name="deviceSn"
					type="text"
					value={data.sample.deviceSn ?? ''}
					class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue max-w-xs"
				/>
			</div>

			<div class="flex items-center gap-4 pt-2">
				<button
					type="submit"
					class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
				>
					Save
				</button>
				<button
					type="button"
					onclick={() => (isEditing = false)}
					class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}
</div>

<!-- Sonde data upload card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden mb-8">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h2 class="font-heading font-semibold text-base text-il-blue">Upload Sonde Data</h2>
	</div>

	<form
		method="POST"
		action="?/uploadSonde"
		enctype="multipart/form-data"
		use:enhance={(e) => {
			if (selectedFile) e.formData.append('file', selectedFile);
			return ({ update }) =>
				update().then(() => {
					selectedFile = null;
				});
		}}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<div class="flex flex-col gap-2 max-w-lg">
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
					const f = e.dataTransfer?.files?.[0];
					if (f) addFile(f);
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
					Drop file here or <span class="text-il-blue font-semibold">Browse</span>
				</span>
				<span class="text-xs font-sans text-il-storm opacity-60">CSV files only</span>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				accept=".csv"
				class="sr-only"
				onchange={(e) => {
					const input = e.currentTarget as HTMLInputElement;
					if (input.files?.[0]) addFile(input.files[0]);
					input.value = '';
				}}
			/>

			<!-- Selected file -->
			{#if selectedFile}
				<div
					class="flex items-center justify-between text-sm font-sans px-3 py-1.5 rounded bg-il-storm-95 border border-il-cloud"
				>
					<span class="truncate text-il-storm-30 mr-2">{selectedFile.name}</span>
					<span class="shrink-0 flex items-center gap-2 text-il-storm text-xs">
						{formatBytes(selectedFile.size)}
						<button
							type="button"
							onclick={() => (selectedFile = null)}
							class="text-il-storm hover:text-red-600 font-bold leading-none"
							aria-label="Remove {selectedFile.name}">&times;</button
						>
					</span>
				</div>
			{/if}
		</div>

		<div class="flex pt-2">
			<button
				type="submit"
				disabled={!selectedFile}
				class="bg-il-blue hover:opacity-90 disabled:opacity-40 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				Upload
			</button>
		</div>
	</form>
</div>

<!-- Sonde measurements card -->
{#if data.sondeRows.length > 0}
	<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden mb-8">
		<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
			<h2 class="font-heading font-semibold text-base text-il-blue">Sonde Measurements</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full text-xs font-sans">
				<thead>
					<tr class="bg-il-storm-95 text-il-storm uppercase tracking-wide text-left">
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Timestamp</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Elapsed</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Flow (ml/min)</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Temp (&deg;C)</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">pH</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Turbidity (NTU)</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">Sp. Cond. (&micro;S/cm)</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">RDO (mg/L)</th>
						<th class="px-3 py-2 font-semibold whitespace-nowrap">ORP (mV)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.sondeRows as row (row.id)}
						<tr class="border-t border-il-cloud">
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{formatTime(row.timestamp)}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.elapsedTime ?? '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.flow != null ? row.flow.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.temperature != null ? row.temperature.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.ph != null ? row.ph.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.turbidity != null ? row.turbidity.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.specificConductivity != null ? row.specificConductivity.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.rdoConcentration != null ? row.rdoConcentration.toFixed(2) : '—'}</td
							>
							<td class="px-3 py-1.5 text-il-storm-30 whitespace-nowrap"
								>{row.orp != null ? row.orp.toFixed(2) : '—'}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<!-- Delete section -->
<form method="POST" action="?/deleteSample" use:enhance>
	<button type="submit" class="text-xs font-sans font-semibold text-red-600 hover:underline">
		Delete sample
	</button>
</form>

<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

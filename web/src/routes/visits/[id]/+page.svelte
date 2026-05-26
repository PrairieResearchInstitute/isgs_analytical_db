<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let stationVisitDialog = $state<HTMLDialogElement | null>(null);
	let editingSV = $state<(typeof data.stationVisits)[0] | null>(null);

	function openEditSV(sv: (typeof data.stationVisits)[0]) {
		editingSV = sv;
		stationVisitDialog?.showModal();
	}

	function onSVDialogClick(e: MouseEvent) {
		if (e.target === stationVisitDialog) stationVisitDialog?.close();
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
		use:enhance={() =>
			({ update }) =>
				update().then(() => stationVisitDialog?.close())}
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

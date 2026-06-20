<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { closeOnSuccess } from '$lib/forms';
	import { formatDate } from '$lib/format';
	import AppDialog from '$lib/components/AppDialog.svelte';
	import Button from '$lib/components/Button.svelte';
	import SelectField from '$lib/components/SelectField.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import TextareaField from '$lib/components/TextareaField.svelte';
	import TableHeader from '$lib/components/TableHeader.svelte';

	let { data }: { data: PageData } = $props();

	let editDialogOpen = $state(false);

	function scientistLabel(
		first: string | null,
		last: string | null,
		initials: string | null
	): string {
		const name = [first, last].filter(Boolean).join(' ');
		if (name && initials) return `${initials} — ${name}`;
		return name || initials || '—';
	}

	function siteLabel(p: { id: number; idotName: string | null; isgsNum: string | null }): string {
		return p.idotName ?? p.isgsNum ?? `Site ${p.id}`;
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
<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="font-heading font-bold text-3xl text-il-blue">Visit #{data.visit.id}</h1>
		{#if data.visit.dt}
			<p class="mt-1 text-sm font-sans text-il-storm">{data.visit.dt}</p>
		{/if}
	</div>
	<Button onclick={() => (editDialogOpen = true)} class="inline-flex items-center gap-2">
		Edit Visit
	</Button>
</div>

<!-- Detail card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h2 class="font-heading font-semibold text-base text-il-blue">Visit Details</h2>
	</div>
	<dl class="divide-y divide-il-cloud font-sans">
		<!-- Site -->
		<div class="px-6 py-4 flex flex-col sm:flex-row sm:gap-8">
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide w-40 shrink-0 pt-0.5">
				Site
			</dt>
			<dd class="text-il-storm-30 mt-1 sm:mt-0">
				{#if data.visit.siteId}
					<a href="/sites/{data.visit.siteId}" class="text-il-blue hover:underline">
						{data.visit.siteName ?? `Site ${data.visit.siteId}`}
					</a>
				{:else}
					{data.visit.siteName ?? '—'}
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

<!-- Edit dialog -->
<AppDialog bind:open={editDialogOpen} title="Edit Visit">
	<form
		method="POST"
		action="?/update"
		use:enhance={closeOnSuccess(() => (editDialogOpen = false))}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<SelectField
			id="edit-siteId"
			name="siteId"
			label="Site"
			required
			value={data.visit.siteId ?? ''}
		>
			<option value="">— Select site —</option>
			{#each data.sites as p (p.id)}
				<option value={p.id} selected={p.id === data.visit.siteId}>{siteLabel(p)}</option>
			{/each}
		</SelectField>

		<SelectField
			id="edit-by"
			name="by"
			label="Field Scientist"
			required
			value={data.visit.by ?? ''}
		>
			<option value="">— Select scientist —</option>
			{#each data.scientists as s (s.initials)}
				<option value={s.initials} selected={s.initials === data.visit.by}>
					{s.initials} — {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.initials}
				</option>
			{/each}
		</SelectField>

		<TextField id="edit-dt" name="dt" label="Date" type="date" value={data.visit.dt ?? ''} />

		<TextareaField
			id="edit-note"
			name="note"
			label="Notes"
			value={data.visit.note ?? ''}
			inputClass="resize-none"
		/>

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<Button variant="secondary" onclick={() => (editDialogOpen = false)}>Cancel</Button>
			<Button type="submit" class="px-5">Save Changes</Button>
		</div>
	</form>
</AppDialog>

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
					<TableHeader sticky>
						<tr>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Station</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Code</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Time</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Level</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Status</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Notes</th>
						</tr>
					</TableHeader>
					<tbody>
						{#each data.stationVisits as sv (sv.id)}
							<tr
								class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
							>
								<td class="px-4 py-3 font-semibold">
									<a
										href="/visits/{data.visit.id}/station-visits/{sv.id}"
										class="text-il-blue hover:underline">{sv.staName ?? '—'}</a
									>
								</td>
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

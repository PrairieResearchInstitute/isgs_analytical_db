<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { closeOnSuccess } from '$lib/forms';
	import AppDialog from '$lib/components/AppDialog.svelte';
	import Button from '$lib/components/Button.svelte';
	import SelectField from '$lib/components/SelectField.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import TextareaField from '$lib/components/TextareaField.svelte';
	import TableHeader from '$lib/components/TableHeader.svelte';

	let { data }: { data: PageData } = $props();

	let dialogOpen = $state(false);

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
		return name || initials || '—';
	}

	function projectLabel(p: {
		id: number;
		idotName: string | null;
		isgsNum: string | null;
	}): string {
		return p.idotName ?? p.isgsNum ?? `Project ${p.id}`;
	}
</script>

<svelte:head>
	<title>Visits | IDOT Wetlands Data</title>
</svelte:head>

<!-- Header bar -->
<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-3">
		<h1 class="font-heading font-bold text-3xl text-il-blue">Visits</h1>
		<span
			class="inline-flex items-center justify-center rounded-full bg-il-blue text-white text-xs font-semibold font-sans px-2.5 py-0.5 min-w-[1.5rem]"
		>
			{data.visits.length}
		</span>
	</div>
	<Button onclick={() => (dialogOpen = true)} class="inline-flex items-center gap-2">
		+ New Visit
	</Button>
</div>

<!-- Visits table -->
{#if data.visits.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No visits yet. Click <strong>+ New Visit</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<TableHeader>
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Date</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Project</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
						>Field Scientist</th
					>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Notes</th>
				</tr>
			</TableHeader>
			<tbody>
				{#each data.visits as visit (visit.id)}
					<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
						<td class="px-4 py-3 text-il-storm whitespace-nowrap">
							<a href="/visits/{visit.id}" class="text-il-blue hover:underline font-semibold">
								{formatDate(visit.dt)}
							</a>
						</td>
						<td class="px-4 py-3 text-il-storm-30">{visit.projectName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">
							{scientistLabel(visit.scientistFirst, visit.scientistLast, visit.by)}
						</td>
						<td class="px-4 py-3 text-il-storm max-w-xs truncate">{visit.note ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- Create dialog -->
<AppDialog bind:open={dialogOpen} title="New Visit">
	<form
		method="POST"
		action="?/create"
		use:enhance={closeOnSuccess(() => (dialogOpen = false))}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<SelectField id="projectId" name="projectId" label="Project" required>
			<option value="">— Select project —</option>
			{#each data.projects as p (p.id)}
				<option value={p.id}>{projectLabel(p)}</option>
			{/each}
		</SelectField>

		<SelectField id="by" name="by" label="Field Scientist" required>
			<option value="">— Select scientist —</option>
			{#each data.scientists as s (s.initials)}
				<option value={s.initials}>
					{s.initials} — {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.initials}
				</option>
			{/each}
		</SelectField>

		<TextField id="dt" name="dt" label="Date" type="date" />

		<TextareaField id="note" name="note" label="Notes" inputClass="resize-none" />

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button type="submit" class="px-5">Create Visit</Button>
		</div>
	</form>
</AppDialog>

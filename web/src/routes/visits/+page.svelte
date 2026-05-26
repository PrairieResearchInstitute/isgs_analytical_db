<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	function openCreate() {
		dialog?.showModal();
	}

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) dialog?.close();
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
	<button
		type="button"
		onclick={openCreate}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		+ New Visit
	</button>
</div>

<!-- Visits table -->
{#if data.visits.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No visits yet. Click <strong>+ New Visit</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<thead class="bg-il-blue text-white">
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Date</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Project</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
						>Field Scientist</th
					>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Notes</th>
				</tr>
			</thead>
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
<dialog
	bind:this={dialog}
	onclick={onDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<!-- Dialog header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">New Visit</h2>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<!-- Create form -->
	<form method="POST" action="?/create" use:enhance class="px-6 py-5 flex flex-col gap-4">
		<!-- Project -->
		<div class="flex flex-col gap-1">
			<label
				for="projectId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Project <span class="text-il-orange">*</span>
			</label>
			<select
				id="projectId"
				name="projectId"
				required
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select project —</option>
				{#each data.projects as p (p.id)}
					<option value={p.id}>{projectLabel(p)}</option>
				{/each}
			</select>
		</div>

		<!-- Field Scientist -->
		<div class="flex flex-col gap-1">
			<label for="by" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Field Scientist <span class="text-il-orange">*</span>
			</label>
			<select
				id="by"
				name="by"
				required
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select scientist —</option>
				{#each data.scientists as s (s.initials)}
					<option value={s.initials}>
						{s.initials} — {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.initials}
					</option>
				{/each}
			</select>
		</div>

		<!-- Date -->
		<div class="flex flex-col gap-1">
			<label for="dt" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Date
			</label>
			<input
				id="dt"
				name="dt"
				type="date"
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Notes -->
		<div class="flex flex-col gap-1">
			<label
				for="note"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Notes
			</label>
			<textarea
				id="note"
				name="note"
				rows={3}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-none"
			></textarea>
		</div>

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<button
				type="button"
				onclick={() => dialog?.close()}
				class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue px-4 py-2 rounded transition-colors"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				Create Visit
			</button>
		</div>
	</form>
</dialog>

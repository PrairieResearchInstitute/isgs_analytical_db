<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) dialog?.close();
	}

	function formatDate(val: string | null): string {
		if (!val) return '—';
		return val;
	}
</script>

<svelte:head>
	<title>{data.project.idotName ?? 'Project'} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Top bar -->
<div class="flex items-center justify-between mb-6">
	<a href="/" class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors">
		← Projects
	</a>
	<button
		type="button"
		onclick={() => dialog?.showModal()}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		Edit
	</button>
</div>

<!-- Project detail card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h1 class="font-heading font-bold text-2xl text-il-blue">{data.project.idotName ?? '—'}</h1>
	</div>

	<dl class="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5 font-sans">
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">ISGS #</dt>
			<dd class="font-mono text-il-storm-30">{data.project.isgsNum ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">ISGS Name</dt>
			<dd class="text-il-storm-30">{data.project.isgsName ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">FA #</dt>
			<dd class="text-il-storm-30">{data.project.faNum ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">County</dt>
			<dd class="text-il-storm-30">{data.project.countyName ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Type</dt>
			<dd class="text-il-storm-30">{data.project.siteType ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Seq Code</dt>
			<dd class="text-il-storm-30">{data.project.seqCode ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Begin Date</dt>
			<dd class="text-il-storm-30">{formatDate(data.project.beginDt)}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">End Date</dt>
			<dd class="text-il-storm-30">{formatDate(data.project.endDt)}</dd>
		</div>
	</dl>
</div>

<!-- Visits table -->
<div class="mt-8">
	<h2 class="font-heading font-bold text-xl text-il-blue mb-4">Visits</h2>
	{#if data.visits.length === 0}
		<div class="border-2 border-il-cloud rounded p-10 text-center text-il-storm font-sans">
			No visits recorded for this project.
		</div>
	{:else}
		<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
			<table class="w-full text-sm font-sans">
				<thead class="bg-il-blue text-white">
					<tr>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Date</th>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Field Scientist</th>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each data.visits as visit (visit.id)}
						<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
							<td class="px-4 py-3 text-il-storm">{visit.dt ?? '—'}</td>
							<td class="px-4 py-3 font-semibold">
								<a href="/field_scientist/{visit.by}" class="text-il-blue hover:underline">
									{[visit.firstName, visit.lastName].filter(Boolean).join(' ') || visit.by || '—'}
								</a>
							</td>
							<td class="px-4 py-3 text-il-storm-30">{visit.note ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Edit dialog -->
<dialog
	bind:this={dialog}
	onclick={onDialogClick}
	class="w-full max-w-2xl rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<!-- Dialog header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">Edit Project</h2>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<!-- Edit form -->
	<form
		method="POST"
		action="?/update"
		use:enhance={() => ({ update }) => update().then(() => dialog?.close())}
		class="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4"
	>
		<!-- ISGS Num -->
		<div class="flex flex-col gap-1">
			<label for="isgsNum" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				ISGS #
			</label>
			<input
				id="isgsNum"
				name="isgsNum"
				type="text"
				value={data.project.isgsNum ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- IDOT Name -->
		<div class="flex flex-col gap-1">
			<label for="idotName" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				IDOT Name <span class="text-il-orange">*</span>
			</label>
			<input
				id="idotName"
				name="idotName"
				type="text"
				required
				value={data.project.idotName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- ISGS Name -->
		<div class="flex flex-col gap-1">
			<label for="isgsName" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				ISGS Name
			</label>
			<input
				id="isgsName"
				name="isgsName"
				type="text"
				value={data.project.isgsName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- FA Number -->
		<div class="flex flex-col gap-1">
			<label for="faNum" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				FA #
			</label>
			<input
				id="faNum"
				name="faNum"
				type="text"
				value={data.project.faNum ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Begin Date -->
		<div class="flex flex-col gap-1">
			<label for="beginDt" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Begin Date
			</label>
			<input
				id="beginDt"
				name="beginDt"
				type="date"
				value={data.project.beginDt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- End Date -->
		<div class="flex flex-col gap-1">
			<label for="endDt" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				End Date
			</label>
			<input
				id="endDt"
				name="endDt"
				type="date"
				value={data.project.endDt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- County -->
		<div class="flex flex-col gap-1">
			<label for="county" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				County
			</label>
			<select
				id="county"
				name="county"
				value={data.project.county ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select county —</option>
				{#each data.counties as c (c.cntycode)}
					<option value={c.cntycode}>{c.cntyname}</option>
				{/each}
			</select>
		</div>

		<!-- Site Type -->
		<div class="flex flex-col gap-1">
			<label for="typeId" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Type
			</label>
			<select
				id="typeId"
				name="typeId"
				value={data.project.typeId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select type —</option>
				{#each data.siteTypes as st (st.id)}
					<option value={st.id}>{st.siteType}</option>
				{/each}
			</select>
		</div>

		<!-- Seq Code -->
		<div class="flex flex-col gap-1 col-span-2">
			<label for="seqCode" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Seq Code
			</label>
			<input
				id="seqCode"
				name="seqCode"
				type="text"
				value={data.project.seqCode ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Form actions -->
		<div class="col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
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
				Save Changes
			</button>
		</div>
	</form>

	<!-- Delete form -->
	<div class="px-6 pb-5">
		<form method="POST" action="?/delete" use:enhance>
			<button
				type="submit"
				class="text-sm font-sans font-semibold text-red-600 hover:text-red-800 underline transition-colors"
				onclick={(e) => {
					if (!confirm('Delete this project? This cannot be undone.')) e.preventDefault();
				}}
			>
				Delete Project
			</button>
		</form>
	</div>
</dialog>
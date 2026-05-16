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
</script>

<svelte:head>
	<title>Projects | IDOT Wetlands Data</title>
</svelte:head>

<!-- Header bar -->
<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-3">
		<h1 class="font-heading font-bold text-3xl text-il-blue">Projects</h1>
		<span class="inline-flex items-center justify-center rounded-full bg-il-blue text-white text-xs font-semibold font-sans px-2.5 py-0.5 min-w-[1.5rem]">
			{data.projects.length}
		</span>
	</div>
	<button
		type="button"
		onclick={openCreate}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		+ New Project
	</button>
</div>

<!-- Projects table -->
{#if data.projects.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No projects yet. Click <strong>+ New Project</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<thead class="bg-il-blue text-white">
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">ISGS #</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">IDOT Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">ISGS Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">County</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Type</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Begin</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">End</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Visits</th>
				</tr>
			</thead>
			<tbody>
				{#each data.projects as project (project.id)}
					<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
						<td class="px-4 py-3 font-mono text-il-storm-30">{project.isgsNum ?? '—'}</td>
						<td class="px-4 py-3 font-semibold">
							<a href="/projects/{project.id}" class="text-il-blue hover:underline">
								{project.idotName ?? '—'}
							</a>
						</td>
						<td class="px-4 py-3 text-il-storm-30">{project.isgsName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{project.countyName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{project.siteType ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{formatDate(project.beginDt)}</td>
						<td class="px-4 py-3 text-il-storm">{formatDate(project.endDt)}</td>
						<td class="px-4 py-3 text-il-storm">{project.visitCount}</td>
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
	class="w-full max-w-2xl rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<!-- Dialog header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">New Project</h2>
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
	<form
		method="POST"
		action="?/create"
		use:enhance
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				value={''}
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
				Create Project
			</button>
		</div>
	</form>

</dialog>

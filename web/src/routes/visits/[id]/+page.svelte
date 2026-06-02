<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let editDialog = $state<HTMLDialogElement | null>(null);
	let selectedFiles = $state<File[]>([]);
	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	function addFiles(incoming: FileList | File[]) {
		const next = [...selectedFiles];
		for (const f of incoming) {
			if (
				/\.(xls|xlsx)$/i.test(f.name) &&
				!next.some((x) => x.name === f.name && x.size === f.size)
			)
				next.push(f);
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

	function openEdit() {
		editDialog?.showModal();
	}

	function onDialogClick(e: MouseEvent) {
		if (e.target === editDialog) editDialog?.close();
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

	function projectLabel(p: {
		id: number;
		idotName: string | null;
		isgsNum: string | null;
	}): string {
		return p.idotName ?? p.isgsNum ?? `Project ${p.id}`;
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
	<button
		type="button"
		onclick={openEdit}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		Edit Visit
	</button>
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

<!-- Lab Results section -->
<div class="mt-8">
	<h2 class="font-heading font-bold text-xl text-il-blue mb-4">Lab Results</h2>
	<form
		method="POST"
		action="?/importLabs"
		enctype="multipart/form-data"
		use:enhance={(e) => {
			for (const file of selectedFiles) e.formData.append('files', file);
			return ({ update }) =>
				update().then(() => {
					selectedFiles = [];
				});
		}}
		class="flex flex-col gap-3 max-w-lg"
	>
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
				Drop Excel files here or <span class="text-il-blue font-semibold">Browse</span>
			</span>
			<span class="text-xs font-sans text-il-storm opacity-60">.xls and .xlsx only</span>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept=".xls,.xlsx"
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

		<div class="flex pt-1">
			<button
				type="submit"
				disabled={selectedFiles.length === 0}
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Import
			</button>
		</div>
	</form>
</div>

<!-- Edit dialog -->
<dialog
	bind:this={editDialog}
	onclick={onDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">Edit Visit</h2>
		<button
			type="button"
			onclick={() => editDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			return ({ result, update }) => {
				if (result.type === 'success') editDialog?.close();
				update();
			};
		}}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<!-- Project -->
		<div class="flex flex-col gap-1">
			<label
				for="edit-projectId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Project <span class="text-il-orange">*</span>
			</label>
			<select
				id="edit-projectId"
				name="projectId"
				required
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select project —</option>
				{#each data.projects as p (p.id)}
					<option value={p.id} selected={p.id === data.visit.projectId}>{projectLabel(p)}</option>
				{/each}
			</select>
		</div>

		<!-- Field Scientist -->
		<div class="flex flex-col gap-1">
			<label
				for="edit-by"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Field Scientist <span class="text-il-orange">*</span>
			</label>
			<select
				id="edit-by"
				name="by"
				required
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select scientist —</option>
				{#each data.scientists as s (s.initials)}
					<option value={s.initials} selected={s.initials === data.visit.by}>
						{s.initials} — {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.initials}
					</option>
				{/each}
			</select>
		</div>

		<!-- Date -->
		<div class="flex flex-col gap-1">
			<label
				for="edit-dt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Date
			</label>
			<input
				id="edit-dt"
				name="dt"
				type="date"
				value={data.visit.dt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Notes -->
		<div class="flex flex-col gap-1">
			<label
				for="edit-note"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Notes
			</label>
			<textarea
				id="edit-note"
				name="note"
				rows={3}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-none"
				>{data.visit.note ?? ''}</textarea
			>
		</div>

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<button
				type="button"
				onclick={() => editDialog?.close()}
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
</dialog>

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

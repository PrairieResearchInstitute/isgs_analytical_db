<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let stationDialog = $state<HTMLDialogElement | null>(null);
	let editingStation = $state<(typeof data.stations)[0] | null>(null);
	let visitDialog = $state<HTMLDialogElement | null>(null);

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) dialog?.close();
	}

	function onStationDialogClick(e: MouseEvent) {
		if (e.target === stationDialog) stationDialog?.close();
	}

	function onVisitDialogClick(e: MouseEvent) {
		if (e.target === visitDialog) visitDialog?.close();
	}

	function openAddStation() {
		editingStation = null;
		stationDialog?.showModal();
	}

	function openEditStation(station: (typeof data.stations)[0]) {
		editingStation = station;
		stationDialog?.showModal();
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
	<a
		href="/"
		class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
	>
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

<!-- Stations section -->
<div class="mt-8">
	<div class="flex items-center justify-between mb-4">
		<h2 class="font-heading font-bold text-xl text-il-blue">Stations</h2>
		<button
			type="button"
			onclick={openAddStation}
			class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
		>
			Add Station
		</button>
	</div>
	{#if data.stations.length === 0}
		<div class="border-2 border-il-cloud rounded p-10 text-center text-il-storm font-sans">
			No stations recorded for this project.
		</div>
	{:else}
		<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
			<div class="overflow-y-auto max-h-[440px]">
				<table class="w-full text-sm font-sans">
					<thead class="bg-il-blue text-white sticky top-0 z-10">
						<tr>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Name</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Code</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Type</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Location</th>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
								>Station Type</th
							>
							<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
								>Instrument Type</th
							>
							<th class="px-4 py-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each data.stations as station (station.id)}
							<tr
								class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
							>
								<td class="px-4 py-3 font-semibold text-il-storm-30">{station.staName}</td>
								<td class="px-4 py-3 font-mono text-il-storm">{station.code ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm"
									>{station.stationTypeShort ?? station.stationType ?? '—'}</td
								>
								<td class="px-4 py-3 text-il-storm">{station.locationType ?? '—'}</td>
								<td class="px-4 py-3 text-il-storm">
									{station.loggerType && station.readType
										? `${station.loggerType} — ${station.readType}`
										: (station.loggerType ?? station.readType ?? '—')}
								</td>
								<td class="px-4 py-3 text-il-storm">{station.instType ?? '—'}</td>
								<td class="px-4 py-3">
									<button
										type="button"
										onclick={() => openEditStation(station)}
										class="text-xs font-sans font-semibold text-il-blue hover:underline"
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

<!-- Visits table -->
<div class="mt-8">
	<div class="flex items-center justify-between mb-4">
		<h2 class="font-heading font-bold text-xl text-il-blue">Visits</h2>
		<button
			type="button"
			onclick={() => visitDialog?.showModal()}
			class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
		>
			+ New Visit
		</button>
	</div>
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
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide"
							>Field Scientist</th
						>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Note</th>
					</tr>
				</thead>
				<tbody>
					{#each data.visits as visit (visit.id)}
						<tr
							class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
						>
							<td class="px-4 py-3 whitespace-nowrap">
								<a href="/visits/{visit.id}" class="text-il-blue hover:underline font-semibold">
									{visit.dt ?? '—'}
								</a>
							</td>
							<td class="px-4 py-3 font-semibold">
								<a href="/maintenance/people/{visit.by}" class="text-il-blue hover:underline">
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
		use:enhance={() =>
			({ update }) =>
				update().then(() => dialog?.close())}
		class="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4"
	>
		<!-- ISGS Num -->
		<div class="flex flex-col gap-1">
			<label
				for="isgsNum"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="idotName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="isgsName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="faNum"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="beginDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="endDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="county"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="typeId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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
			<label
				for="seqCode"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
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

<!-- Station add/edit dialog -->
<dialog
	bind:this={stationDialog}
	onclick={onStationDialogClick}
	class="w-full max-w-3xl rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">
			{editingStation ? 'Edit Station' : 'Add Station'}
		</h2>
		<button
			type="button"
			onclick={() => stationDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<form
		method="POST"
		action="?/saveStation"
		use:enhance={() =>
			({ update }) =>
				update().then(() => stationDialog?.close())}
		class="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4 overflow-y-auto max-h-[70vh]"
	>
		<input type="hidden" name="stationId" value={editingStation?.id ?? ''} />

		<!-- Station Name -->
		<div class="flex flex-col gap-1">
			<label
				for="staName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Station Name <span class="text-il-orange">*</span>
			</label>
			<input
				id="staName"
				name="staName"
				type="text"
				required
				value={editingStation?.staName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Code -->
		<div class="flex flex-col gap-1">
			<label
				for="stationCode"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Code
			</label>
			<input
				id="stationCode"
				name="code"
				type="text"
				value={editingStation?.code ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Station Type -->
		<div class="flex flex-col gap-1">
			<label
				for="stationTypeId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Station Type <span class="text-il-orange">*</span>
			</label>
			<select
				id="stationTypeId"
				name="typeId"
				required
				value={editingStation?.typeId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select type —</option>
				{#each data.stationTypes as st (st.id)}
					<option value={st.id}>{st.type}</option>
				{/each}
			</select>
		</div>

		<!-- Location Type -->
		<div class="flex flex-col gap-1">
			<label
				for="stationLocationTypeId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Location Type
			</label>
			<select
				id="stationLocationTypeId"
				name="locationTypeId"
				value={editingStation?.locationTypeId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select location type —</option>
				{#each data.locationTypes as lt (lt.id)}
					<option value={lt.id}>{lt.locationType}</option>
				{/each}
			</select>
		</div>

		<!-- Begin Date -->
		<div class="flex flex-col gap-1">
			<label
				for="stationBeginDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Begin Date
			</label>
			<input
				id="stationBeginDt"
				name="beginDt"
				type="date"
				value={editingStation?.beginDt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- End Date -->
		<div class="flex flex-col gap-1">
			<label
				for="stationEndDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				End Date
			</label>
			<input
				id="stationEndDt"
				name="endDt"
				type="date"
				value={editingStation?.endDt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Latitude -->
		<div class="flex flex-col gap-1">
			<label
				for="stationLat"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Latitude
			</label>
			<input
				id="stationLat"
				name="latitude"
				type="number"
				step="any"
				value={editingStation?.latitude ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Longitude -->
		<div class="flex flex-col gap-1">
			<label
				for="stationLng"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Longitude
			</label>
			<input
				id="stationLng"
				name="longitude"
				type="number"
				step="any"
				value={editingStation?.longitude ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Field Scientist -->
		<div class="flex flex-col gap-1">
			<label
				for="stationInitials"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Field Scientist <span class="text-il-orange">*</span>
			</label>
			<select
				id="stationInitials"
				name="initials"
				required
				value={editingStation?.initials ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select scientist —</option>
				{#each data.scientists as s (s.initials)}
					<option value={s.initials}>
						{[s.firstName, s.lastName].filter(Boolean).join(' ')} ({s.initials})
					</option>
				{/each}
			</select>
		</div>

		<!-- ISGS ID -->
		<div class="flex flex-col gap-1">
			<label
				for="isgsId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				ISGS ID
			</label>
			<input
				id="isgsId"
				name="isgsId"
				type="text"
				value={editingStation?.isgsId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Instrument Type -->
		<div class="flex flex-col gap-1">
			<label
				for="stationInstTypeId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Instrument Type
			</label>
			<select
				id="stationInstTypeId"
				name="instTypeId"
				value={editingStation?.instTypeId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select instrument type —</option>
				{#each data.instTypes as it (it.id)}
					<option value={it.id}>{it.instType}</option>
				{/each}
			</select>
		</div>

		<!-- Units -->
		<div class="flex flex-col gap-1">
			<label
				for="stationUnitsId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Units
			</label>
			<select
				id="stationUnitsId"
				name="instUnitsId"
				value={editingStation?.instUnitsId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select units —</option>
				{#each data.stationUnits as u (u.id)}
					<option value={u.id}>{u.unitsReading}</option>
				{/each}
			</select>
		</div>

		<!-- Read Type -->
		<div class="flex flex-col gap-1">
			<label
				for="stationReadTypeId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Read Type
			</label>
			<select
				id="stationReadTypeId"
				name="stationTypeId"
				value={editingStation?.stationTypeId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select read type —</option>
				{#each data.stationReadTypes as rt (rt.id)}
					<option value={rt.id}>{rt.loggerType} — {rt.readType}</option>
				{/each}
			</select>
		</div>

		<!-- Boring Method -->
		<div class="flex flex-col gap-1">
			<label
				for="stationBorMethodId"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Boring Method
			</label>
			<select
				id="stationBorMethodId"
				name="borMethodId"
				value={editingStation?.borMethodId ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select boring method —</option>
				{#each data.boringMethods as bm (bm.id)}
					<option value={bm.id}>{bm.boringMethod}</option>
				{/each}
			</select>
		</div>

		<!-- Boring Date -->
		<div class="flex flex-col gap-1">
			<label
				for="stationBorDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Boring Date
			</label>
			<input
				id="stationBorDt"
				name="borDt"
				type="date"
				value={editingStation?.borDt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Label Alt -->
		<div class="flex flex-col gap-1">
			<label
				for="stationLabelAlt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Label Alt
			</label>
			<input
				id="stationLabelAlt"
				name="labelAlt"
				type="text"
				value={editingStation?.labelAlt ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Comment -->
		<div class="flex flex-col gap-1 col-span-2">
			<label
				for="stationComment"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Comment
			</label>
			<textarea
				id="stationComment"
				name="comment"
				rows="3"
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-none"
				>{editingStation?.comment ?? ''}</textarea
			>
		</div>

		<!-- Form actions -->
		<div class="col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<button
				type="button"
				onclick={() => stationDialog?.close()}
				class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue px-4 py-2 rounded transition-colors"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				{editingStation ? 'Save Changes' : 'Add Station'}
			</button>
		</div>
	</form>

	{#if editingStation}
		<div class="px-6 pb-5">
			<form method="POST" action="?/deleteStation" use:enhance>
				<input type="hidden" name="stationId" value={editingStation.id} />
				<button
					type="submit"
					class="text-sm font-sans font-semibold text-red-600 hover:text-red-800 underline transition-colors"
					onclick={(e) => {
						if (!confirm('Delete this station? This cannot be undone.')) e.preventDefault();
					}}
				>
					Delete Station
				</button>
			</form>
		</div>
	{/if}
</dialog>

<!-- New visit dialog -->
<dialog
	bind:this={visitDialog}
	onclick={onVisitDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">New Visit</h2>
		<button
			type="button"
			onclick={() => visitDialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<form
		method="POST"
		action="?/addVisit"
		use:enhance={() =>
			({ update }) =>
				update().then(() => visitDialog?.close())}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<!-- Field Scientist -->
		<div class="flex flex-col gap-1">
			<label
				for="visitBy"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Field Scientist <span class="text-il-orange">*</span>
			</label>
			<select
				id="visitBy"
				name="by"
				required
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			>
				<option value="">— Select scientist —</option>
				{#each data.scientists as s (s.initials)}
					<option value={s.initials}>
						{[s.firstName, s.lastName].filter(Boolean).join(' ') || s.initials} ({s.initials})
					</option>
				{/each}
			</select>
		</div>

		<!-- Date -->
		<div class="flex flex-col gap-1">
			<label
				for="visitDt"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Date
			</label>
			<input
				id="visitDt"
				name="dt"
				type="date"
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Notes -->
		<div class="flex flex-col gap-1">
			<label
				for="visitNote"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Notes
			</label>
			<textarea
				id="visitNote"
				name="note"
				rows={3}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue resize-none"
			></textarea>
		</div>

		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<button
				type="button"
				onclick={() => visitDialog?.close()}
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

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
</script>

<svelte:head>
	<title>People | IDOT Wetlands Data</title>
</svelte:head>

<!-- Header bar -->
<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-3">
		<h1 class="font-heading font-bold text-3xl text-il-blue">People</h1>
		<span
			class="inline-flex items-center justify-center rounded-full bg-il-blue text-white text-xs font-semibold font-sans px-2.5 py-0.5 min-w-[1.5rem]"
		>
			{data.scientists.length}
		</span>
	</div>
	<button
		type="button"
		onclick={openCreate}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		+ New Person
	</button>
</div>

<!-- People table -->
{#if data.scientists.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No people yet. Click <strong>+ New Person</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<thead class="bg-il-blue text-white">
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Initials</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">First Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Last Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Visits</th>
				</tr>
			</thead>
			<tbody>
				{#each data.scientists as scientist (scientist.initials)}
					<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
						<td class="px-4 py-3 font-mono font-semibold">
							<a
								href="/maintenance/people/{scientist.initials}"
								class="text-il-blue hover:underline"
							>
								{scientist.initials}
							</a>
						</td>
						<td class="px-4 py-3 text-il-storm-30">{scientist.firstName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm-30">{scientist.lastName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{scientist.visitCount}</td>
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
		<h2 class="font-heading font-bold text-xl text-il-blue">New Person</h2>
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
		<!-- Initials -->
		<div class="flex flex-col gap-1">
			<label
				for="initials"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Initials <span class="text-il-orange">*</span>
			</label>
			<input
				id="initials"
				name="initials"
				type="text"
				required
				value=""
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- First Name -->
		<div class="flex flex-col gap-1">
			<label
				for="firstName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				First Name
			</label>
			<input
				id="firstName"
				name="firstName"
				type="text"
				value=""
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Last Name -->
		<div class="flex flex-col gap-1">
			<label
				for="lastName"
				class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide"
			>
				Last Name
			</label>
			<input
				id="lastName"
				name="lastName"
				type="text"
				value=""
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
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
				Create Person
			</button>
		</div>
	</form>
</dialog>

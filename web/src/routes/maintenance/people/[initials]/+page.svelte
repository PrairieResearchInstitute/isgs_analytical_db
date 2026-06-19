<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { closeOnSuccess } from '$lib/forms';
	import AppDialog from '$lib/components/AppDialog.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import TableHeader from '$lib/components/TableHeader.svelte';

	let { data }: { data: PageData } = $props();

	let dialogOpen = $state(false);
</script>

<svelte:head>
	<title>{data.scientist.initials} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Top bar -->
<div class="flex items-center justify-between mb-6">
	<a
		href="/maintenance/people"
		class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors"
	>
		&larr; People
	</a>
	<Button onclick={() => (dialogOpen = true)} class="inline-flex items-center gap-2">Edit</Button>
</div>

<!-- Person detail card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h1 class="font-heading font-bold text-2xl text-il-blue">{data.scientist.initials}</h1>
	</div>

	<dl class="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5 font-sans">
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Initials</dt>
			<dd class="font-mono text-il-storm-30">{data.scientist.initials}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">First Name</dt>
			<dd class="text-il-storm-30">{data.scientist.firstName ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Last Name</dt>
			<dd class="text-il-storm-30">{data.scientist.lastName ?? '—'}</dd>
		</div>
	</dl>
</div>

<!-- Visits table -->
<div class="mt-8">
	<h2 class="font-heading font-bold text-xl text-il-blue mb-4">Visits</h2>
	{#if data.visits.length === 0}
		<div class="border-2 border-il-cloud rounded p-10 text-center text-il-storm font-sans">
			No visits recorded for this person.
		</div>
	{:else}
		<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
			<table class="w-full text-sm font-sans">
				<TableHeader>
					<tr>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Date</th>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">IDOT Name</th>
						<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Note</th>
					</tr>
				</TableHeader>
				<tbody>
					{#each data.visits as visit (visit.id)}
						<tr
							class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors"
						>
							<td class="px-4 py-3 text-il-storm">{visit.dt ?? '—'}</td>
							<td class="px-4 py-3 font-semibold">
								<a href="/projects/{visit.projectId}" class="text-il-blue hover:underline">
									{visit.idotName ?? '—'}
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
<AppDialog bind:open={dialogOpen} title="Edit Person">
	<form
		method="POST"
		action="?/update"
		use:enhance={closeOnSuccess(() => (dialogOpen = false))}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<TextField
			id="firstName"
			name="firstName"
			label="First Name"
			value={data.scientist.firstName ?? ''}
		/>
		<TextField
			id="lastName"
			name="lastName"
			label="Last Name"
			value={data.scientist.lastName ?? ''}
		/>

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button type="submit" class="px-5">Save Changes</Button>
		</div>
	</form>

	<!-- Delete form -->
	<div class="px-6 pb-5">
		<form method="POST" action="?/delete" use:enhance>
			<Button
				type="submit"
				variant="danger"
				onclick={(e) => {
					if (!confirm('Delete this person? This cannot be undone.')) e.preventDefault();
				}}
			>
				Delete Person
			</Button>
		</form>
	</div>
</AppDialog>

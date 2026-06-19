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
	<Button onclick={() => (dialogOpen = true)} class="inline-flex items-center gap-2">
		+ New Person
	</Button>
</div>

<!-- People table -->
{#if data.scientists.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No people yet. Click <strong>+ New Person</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<TableHeader>
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Initials</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">First Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Last Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Visits</th>
				</tr>
			</TableHeader>
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
<AppDialog bind:open={dialogOpen} title="New Person">
	<form
		method="POST"
		action="?/create"
		use:enhance={closeOnSuccess(() => (dialogOpen = false))}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<TextField id="initials" name="initials" label="Initials" required />
		<TextField id="firstName" name="firstName" label="First Name" />
		<TextField id="lastName" name="lastName" label="Last Name" />

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button type="submit" class="px-5">Create Person</Button>
		</div>
	</form>
</AppDialog>

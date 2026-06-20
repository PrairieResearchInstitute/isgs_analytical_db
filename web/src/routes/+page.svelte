<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { closeOnSuccess } from '$lib/forms';
	import { formatDate } from '$lib/format';
	import AppDialog from '$lib/components/AppDialog.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import SelectField from '$lib/components/SelectField.svelte';
	import TableHeader from '$lib/components/TableHeader.svelte';

	let { data }: { data: PageData } = $props();

	let dialogOpen = $state(false);

	type SortKey =
		| 'isgsNum'
		| 'idotName'
		| 'isgsName'
		| 'countyName'
		| 'siteType'
		| 'beginDt'
		| 'endDt'
		| 'visitCount';

	let sortKey = $state<SortKey>('isgsNum');
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
	}

	function sortIcon(key: SortKey): string {
		if (sortKey !== key) return '↕';
		return sortDir === 'asc' ? '↑' : '↓';
	}

	const sortedSites = $derived(
		[...data.sites].sort((a, b) => {
			const av = a[sortKey];
			const bv = b[sortKey];
			if (av == null && bv == null) return 0;
			if (av == null) return 1;
			if (bv == null) return -1;
			const cmp =
				typeof av === 'number' && typeof bv === 'number'
					? av - bv
					: String(av).localeCompare(String(bv));
			return sortDir === 'asc' ? cmp : -cmp;
		})
	);
</script>

<svelte:head>
	<title>Sites | IDOT Wetlands Data</title>
</svelte:head>

<!-- Header bar -->
<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-3">
		<h1 class="font-heading font-bold text-3xl text-il-blue">Sites</h1>
		<span
			class="inline-flex items-center justify-center rounded-full bg-il-blue text-white text-xs font-semibold font-sans px-2.5 py-0.5 min-w-[1.5rem]"
		>
			{data.sites.length}
		</span>
	</div>
	<Button onclick={() => (dialogOpen = true)} class="inline-flex items-center gap-2">
		+ New Site
	</Button>
</div>

<!-- Sites table -->
{#if data.sites.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm font-sans">
		No sites yet. Click <strong>+ New Site</strong> to add one.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<TableHeader>
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('isgsNum')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							ISGS # <span class="text-xs opacity-70">{sortIcon('isgsNum')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('idotName')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							IDOT Name <span class="text-xs opacity-70">{sortIcon('idotName')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('isgsName')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							ISGS Name <span class="text-xs opacity-70">{sortIcon('isgsName')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('countyName')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							County <span class="text-xs opacity-70">{sortIcon('countyName')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('siteType')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							Type <span class="text-xs opacity-70">{sortIcon('siteType')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('beginDt')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							Begin <span class="text-xs opacity-70">{sortIcon('beginDt')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('endDt')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							End <span class="text-xs opacity-70">{sortIcon('endDt')}</span>
						</button>
					</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">
						<button
							type="button"
							onclick={() => toggleSort('visitCount')}
							class="flex items-center gap-1 hover:opacity-75 transition-opacity"
						>
							Visits <span class="text-xs opacity-70">{sortIcon('visitCount')}</span>
						</button>
					</th>
				</tr>
			</TableHeader>
			<tbody>
				{#each sortedSites as site (site.id)}
					<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
						<td class="px-4 py-3 font-mono text-il-storm-30">{site.isgsNum ?? '—'}</td>
						<td class="px-4 py-3 font-semibold">
							<a href="/sites/{site.id}" class="text-il-blue hover:underline">
								{site.idotName ?? '—'}
							</a>
						</td>
						<td class="px-4 py-3 text-il-storm-30">{site.isgsName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{site.countyName ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{site.siteType ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{formatDate(site.beginDt)}</td>
						<td class="px-4 py-3 text-il-storm">{formatDate(site.endDt)}</td>
						<td class="px-4 py-3 text-il-storm">{site.visitCount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<!-- Create dialog -->
<AppDialog bind:open={dialogOpen} title="New Site" maxWidth="max-w-2xl">
	<form
		method="POST"
		action="?/create"
		use:enhance={closeOnSuccess(() => (dialogOpen = false))}
		class="px-6 py-5 grid grid-cols-2 gap-x-5 gap-y-4"
	>
		<TextField id="isgsNum" name="isgsNum" label="ISGS #" />
		<TextField id="idotName" name="idotName" label="IDOT Name" required />
		<TextField id="isgsName" name="isgsName" label="ISGS Name" />
		<TextField id="faNum" name="faNum" label="FA #" />
		<TextField id="beginDt" name="beginDt" label="Begin Date" type="date" />
		<TextField id="endDt" name="endDt" label="End Date" type="date" />

		<SelectField id="county" name="county" label="County">
			<option value="">— Select county —</option>
			{#each data.counties as c (c.cntycode)}
				<option value={c.cntycode}>{c.cntyname}</option>
			{/each}
		</SelectField>

		<SelectField id="typeId" name="typeId" label="Type">
			<option value="">— Select type —</option>
			{#each data.siteTypes as st (st.id)}
				<option value={st.id}>{st.siteType}</option>
			{/each}
		</SelectField>

		<TextField id="seqCode" name="seqCode" label="Seq Code" class="col-span-2" />

		<!-- Form actions -->
		<div class="col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<Button variant="secondary" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button type="submit" class="px-5">Create Site</Button>
		</div>
	</form>
</AppDialog>

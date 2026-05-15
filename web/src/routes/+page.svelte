<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Wetlands Sites | IDOT Wetlands Data</title>
</svelte:head>

<div class="flex items-center justify-between mb-6">
	<h1 class="font-heading font-bold text-3xl text-il-blue">Wetlands Sites</h1>
	<span class="text-sm text-il-storm">{data.sites.length} site{data.sites.length === 1 ? '' : 's'}</span>
</div>

{#if data.sites.length === 0}
	<div class="border-2 border-il-cloud rounded p-12 text-center text-il-storm">
		No sites yet. Add data via Drizzle Studio (<code class="font-mono text-sm bg-il-storm-95 px-1 rounded">npm run db:studio</code>) or build out the data entry forms.
	</div>
{:else}
	<div class="border border-il-cloud rounded overflow-hidden shadow-sm">
		<table class="w-full text-sm font-sans">
			<thead class="bg-il-blue text-white">
				<tr>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Name</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Location</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Latitude</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Longitude</th>
					<th class="text-left px-4 py-3 font-heading font-semibold tracking-wide">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each data.sites as site (site.id)}
					<tr class="border-b border-il-cloud last:border-0 hover:bg-il-storm-95 transition-colors">
						<td class="px-4 py-3 font-semibold text-il-blue">{site.name}</td>
						<td class="px-4 py-3 text-il-storm-30">{site.location ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm-30 font-mono">{site.latitude ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm-30 font-mono">{site.longitude ?? '—'}</td>
						<td class="px-4 py-3 text-il-storm">{site.createdAt ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

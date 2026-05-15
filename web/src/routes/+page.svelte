<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Wetlands Sites</title>
</svelte:head>

<div class="max-w-5xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Wetlands Sites</h2>
		<span class="text-sm text-gray-500">{data.sites.length} sites</span>
	</div>

	{#if data.sites.length === 0}
		<div class="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
			No sites yet. Add data via Drizzle Studio (<code>npm run db:studio</code>) or build out the
			data entry forms.
		</div>
	{:else}
		<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
						<th class="text-left px-4 py-3 font-medium text-gray-600">Location</th>
						<th class="text-left px-4 py-3 font-medium text-gray-600">Latitude</th>
						<th class="text-left px-4 py-3 font-medium text-gray-600">Longitude</th>
						<th class="text-left px-4 py-3 font-medium text-gray-600">Created</th>
					</tr>
				</thead>
				<tbody>
					{#each data.sites as site (site.id)}
						<tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
							<td class="px-4 py-3 font-medium text-gray-900">{site.name}</td>
							<td class="px-4 py-3 text-gray-600">{site.location ?? '—'}</td>
							<td class="px-4 py-3 text-gray-600 font-mono">{site.latitude ?? '—'}</td>
							<td class="px-4 py-3 text-gray-600 font-mono">{site.longitude ?? '—'}</td>
							<td class="px-4 py-3 text-gray-400">{site.createdAt ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

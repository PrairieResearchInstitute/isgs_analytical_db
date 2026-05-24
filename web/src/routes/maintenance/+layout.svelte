<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	let { children }: { children: Snippet } = $props();

	let pathname = $derived($page.url.pathname);
</script>

<div>
	<nav class="mb-6 flex gap-4 border-b border-il-cloud pb-2">
		<a
			href="/maintenance/people"
			class="text-sm font-sans font-semibold pb-1 transition-colors {pathname.startsWith(
				'/maintenance/people'
			)
				? 'text-il-blue border-b-2 border-il-orange'
				: 'text-il-storm hover:text-il-blue border-b-2 border-transparent'}"
		>
			People
		</a>
	</nav>
	{@render children()}
</div>

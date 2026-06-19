<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		sticky?: boolean;
		children: Snippet;
	}

	let { sticky = false, children }: Props = $props();
</script>

<thead class="bg-il-blue text-white{sticky ? ' sticky top-0 z-10' : ''}">
	{@render children()}
</thead>

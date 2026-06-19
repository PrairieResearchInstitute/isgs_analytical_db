<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		maxWidth?: string;
		children: Snippet;
	}

	let { open = $bindable(), title, maxWidth = 'max-w-lg', children }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/40 z-40" />
		<Dialog.Content
			class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] {maxWidth} rounded-lg shadow-xl bg-white border border-il-cloud flex flex-col max-h-[90vh]"
		>
			<div
				class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95 shrink-0"
			>
				<Dialog.Title class="font-heading font-bold text-xl text-il-blue">{title}</Dialog.Title>
				<Dialog.Close
					class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
					aria-label="Close">&times;</Dialog.Close
				>
			</div>
			{@render children()}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

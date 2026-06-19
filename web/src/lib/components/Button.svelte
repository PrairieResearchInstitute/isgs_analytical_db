<script lang="ts">
	import { Button } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'danger';

	interface Props {
		variant?: Variant;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		disabled,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		primary:
			'bg-il-blue hover:opacity-90 disabled:opacity-50 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity',
		secondary:
			'text-sm font-sans font-semibold text-il-storm hover:text-il-blue px-4 py-2 rounded transition-colors',
		danger:
			'text-sm font-sans font-semibold text-red-600 hover:text-red-800 underline transition-colors'
	};
</script>

<Button.Root {type} {disabled} {onclick} class="{variantClasses[variant]} {className}">
	{@render children()}
</Button.Root>

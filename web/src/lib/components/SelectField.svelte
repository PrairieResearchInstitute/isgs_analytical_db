<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		name: string;
		label: string;
		required?: boolean;
		value?: string | number;
		class?: string;
		inputClass?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		id,
		name,
		label,
		required = false,
		value = '',
		class: className = '',
		inputClass = '',
		children,
		// eslint-disable-next-line svelte/valid-compile -- passthrough props; this is not a custom element
		...rest
	}: Props = $props();
</script>

<div class="flex flex-col gap-1 {className}">
	<label for={id} class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
		{label}{#if required}&nbsp;<span class="text-il-orange">*</span>{/if}
	</label>
	<select
		{id}
		{name}
		{required}
		{value}
		class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue {inputClass}"
		{...rest}
	>
		{@render children()}
	</select>
</div>

<script lang="ts">
	interface Props {
		id: string;
		name: string;
		label: string;
		required?: boolean;
		value?: string;
		rows?: number;
		class?: string;
		inputClass?: string;
		[key: string]: unknown;
	}

	let {
		id,
		name,
		label,
		required = false,
		value = '',
		rows = 3,
		class: className = '',
		inputClass = '',
		// eslint-disable-next-line svelte/valid-compile -- passthrough props; this is not a custom element
		...rest
	}: Props = $props();
</script>

<div class="flex flex-col gap-1 {className}">
	<label for={id} class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
		{label}{#if required}&nbsp;<span class="text-il-orange">*</span>{/if}
	</label>
	<textarea
		{id}
		{name}
		{required}
		{rows}
		class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue {inputClass}"
		{...rest}>{value}</textarea
	>
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialog) dialog?.close();
	}
</script>

<svelte:head>
	<title>{data.scientist.initials} | IDOT Wetlands Data</title>
</svelte:head>

<!-- Top bar -->
<div class="flex items-center justify-between mb-6">
	<a href="/field_scientists" class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue transition-colors">
		&larr; Field Scientists
	</a>
	<button
		type="button"
		onclick={() => dialog?.showModal()}
		class="inline-flex items-center gap-2 bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-4 py-2 rounded transition-opacity"
	>
		Edit
	</button>
</div>

<!-- Field Scientist detail card -->
<div class="border border-il-cloud rounded-lg shadow-sm bg-white overflow-hidden">
	<div class="px-6 py-4 bg-il-storm-95 border-b border-il-cloud">
		<h1 class="font-heading font-bold text-2xl text-il-blue">{data.scientist.initials}</h1>
	</div>

	<dl class="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-5 font-sans">
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Initials</dt>
			<dd class="font-mono text-il-storm-30">{data.scientist.initials}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">First Name</dt>
			<dd class="text-il-storm-30">{data.scientist.firstName ?? '—'}</dd>
		</div>
		<div>
			<dt class="text-xs font-semibold text-il-storm uppercase tracking-wide mb-1">Last Name</dt>
			<dd class="text-il-storm-30">{data.scientist.lastName ?? '—'}</dd>
		</div>
	</dl>
</div>

<!-- Edit dialog -->
<dialog
	bind:this={dialog}
	onclick={onDialogClick}
	class="w-full max-w-lg rounded-lg shadow-xl bg-white p-0 border border-il-cloud backdrop:bg-black/40 open:flex open:flex-col"
>
	<!-- Dialog header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-il-cloud bg-il-storm-95">
		<h2 class="font-heading font-bold text-xl text-il-blue">Edit Field Scientist</h2>
		<button
			type="button"
			onclick={() => dialog?.close()}
			class="text-il-storm hover:text-il-blue text-2xl leading-none font-sans"
			aria-label="Close"
		>
			&times;
		</button>
	</div>

	<!-- Edit form -->
	<form
		method="POST"
		action="?/update"
		use:enhance={() => ({ update }) => update().then(() => dialog?.close())}
		class="px-6 py-5 flex flex-col gap-4"
	>
		<!-- First Name -->
		<div class="flex flex-col gap-1">
			<label for="firstName" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				First Name
			</label>
			<input
				id="firstName"
				name="firstName"
				type="text"
				value={data.scientist.firstName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Last Name -->
		<div class="flex flex-col gap-1">
			<label for="lastName" class="text-xs font-semibold font-sans text-il-storm uppercase tracking-wide">
				Last Name
			</label>
			<input
				id="lastName"
				name="lastName"
				type="text"
				value={data.scientist.lastName ?? ''}
				class="border border-il-cloud rounded px-3 py-2 text-sm font-sans text-il-storm-30 bg-white focus:outline-none focus:ring-2 focus:ring-il-blue"
			/>
		</div>

		<!-- Form actions -->
		<div class="flex items-center justify-end gap-3 pt-2 border-t border-il-cloud mt-1">
			<button
				type="button"
				onclick={() => dialog?.close()}
				class="text-sm font-sans font-semibold text-il-storm hover:text-il-blue px-4 py-2 rounded transition-colors"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-il-blue hover:opacity-90 text-white font-sans font-semibold text-sm px-5 py-2 rounded transition-opacity"
			>
				Save Changes
			</button>
		</div>
	</form>

	<!-- Delete form -->
	<div class="px-6 pb-5">
		<form method="POST" action="?/delete" use:enhance>
			<button
				type="submit"
				class="text-sm font-sans font-semibold text-red-600 hover:text-red-800 underline transition-colors"
				onclick={(e) => {
					if (!confirm('Delete this field scientist? This cannot be undone.')) e.preventDefault();
				}}
			>
				Delete Field Scientist
			</button>
		</form>
	</div>
</dialog>

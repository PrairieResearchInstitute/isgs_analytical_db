import type { SubmitFunction } from '@sveltejs/kit';

/**
 * `use:enhance` callback that applies the default update and then runs
 * `onSuccess` (e.g. to close a dialog) only when the action succeeded.
 * On a validation failure the form is left untouched so errors stay visible
 * and the dialog remains open.
 */
export function closeOnSuccess(onSuccess: () => void): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success') onSuccess();
		};
}

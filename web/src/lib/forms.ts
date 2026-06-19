import type { SubmitFunction } from '@sveltejs/kit';

/**
 * `use:enhance` callback that applies the default update and then runs
 * `onSuccess` (e.g. to close a dialog) when the action succeeded or issued a
 * redirect. Our mutation actions use the Post/Redirect/Get pattern, so a
 * successful save yields `result.type === 'redirect'` rather than `'success'`.
 * On a validation `failure` the form is left untouched so errors stay visible
 * and the dialog remains open.
 */
export function closeOnSuccess(onSuccess: () => void): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			await update();
			if (result.type === 'success' || result.type === 'redirect') onSuccess();
		};
}

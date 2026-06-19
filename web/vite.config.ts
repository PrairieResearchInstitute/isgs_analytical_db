import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['bits-ui']
	},
	// bits-ui ships `.svelte.js` rune modules that must be compiled by the
	// Svelte plugin. Excluding it from dependency pre-bundling stops esbuild
	// from optimizing those modules, which would otherwise leave the runes
	// uncompiled and throw `rune_outside_svelte` in the browser.
	optimizeDeps: {
		exclude: ['bits-ui']
	}
});

import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			// See https://svelte.dev/docs/kit/integrations for more information about preprocessors
			preprocess: vitePreprocess(),
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),
			paths: {
				base: process.env.NODE_ENV === 'production' ? '/streaming-server' : ''
			}
		})
	],
	server: { open: true, host: true }
});

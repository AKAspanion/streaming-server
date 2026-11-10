<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/env';

	let { children }: { children: Snippet } = $props();

	if (browser) {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
</script>

{@render children()}

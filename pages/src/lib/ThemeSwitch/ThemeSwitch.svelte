<script lang="ts">
	import { browser } from '$app/env';

	let { onThemeChange }: { onThemeChange?: (flag: boolean) => void } = $props();

	let darkMode: boolean = $state(browser && localStorage.theme === 'dark');

	function handleSwitchDarkMode() {
		darkMode = !darkMode;

		if (darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}

		onThemeChange?.(darkMode);
		if (browser) {
			localStorage.setItem('theme', darkMode ? 'dark' : 'light');
		}
	}
</script>

<div>
	<input checked={darkMode} onclick={handleSwitchDarkMode} type="checkbox" id="theme-toggle" />
	<label for="theme-toggle" aria-label="Toggle dark mode"></label>
</div>

<style lang="postcss">
	@reference '../../app.css';

	#theme-toggle {
		@apply invisible;
	}

	#theme-toggle + label {
		@apply inline-block cursor-pointer h-8 w-8 absolute top-8 right-12 rounded-full duration-300 content-[''];
	}

	#theme-toggle:not(:checked) + label {
		@apply bg-amber-400;
	}

	#theme-toggle:checked + label {
		@apply bg-transparent;
		box-shadow: inset -8px -8px 1px 1px #ddd;
	}
</style>

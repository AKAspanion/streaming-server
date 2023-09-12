<script lang="ts">
	import ThemeSwitch from '$lib/ThemeSwitch/ThemeSwitch.svelte';

	import '../app.css';
</script>

<section class="py-10 bg-gray-50 dark:bg-gray-800 sm:py-16 lg:py-24 transition-all">
	<div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
		<div class="max-w-xl mx-auto text-center">
			<p class="text-sm font-semibold tracking-widest text-blue-600 uppercase">
				Video Streaming Server
			</p>

			<h2
				class="mt-6 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl lg:text-5xl"
			>
				Your media, your server, your way.
			</h2>
		</div>

		<div class="max-w-xl mx-auto text-center">
			<a
				href="#"
				title=""
				class="inline-flex items-center justify-center px-6 py-4 mt-10 text-base font-semibold bg-white rounded-md shadow-lg hover:shadow-md transition-all"
			>
				<svg
					class="w-5 h-5 mr-2 -ml-1 text-fuchsia-600"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-blue-600">
					Download
				</span>
			</a>
		</div>

		<img
			class="w-full max-w-3xl mx-auto mt-8 rounded-lg shadow-xl sm:mt-20"
			src="https://cdn.rareblocks.xyz/collection/celebration/images/features/6/dashboard-screenshot.png"
			alt=""
		/>

		<div
			class="flex flex-col items-start justify-center max-w-lg px-10 mx-auto mt-8 space-y-8 lg:max-w-xl sm:px-0 sm:space-y-0 sm:flex-row sm:mt-16 sm:space-x-6 lg:space-x-12 sm:items-center"
		>
			<div class="flex items-center flex-1">
				<svg
					class="flex-shrink-0 text-white/50 w-14 h-14"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
					/>
				</svg>
				<p class="ml-4 text-lg font-semibold leading-snug text-white">
					Create powerful websites fast
				</p>
			</div>

			<div class="flex items-center flex-1">
				<svg
					class="flex-shrink-0 text-white/50 w-14 h-14"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
				<p class="ml-4 text-lg font-semibold leading-snug text-white">
					Easy to customize, ready to launch
				</p>
			</div>
		</div>
	</div>
</section>

<svelte:head>
	<title>Video Streaming Server</title>
</svelte:head>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>

<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	let { children }: { children: Snippet } = $props();

	let pathname = $derived($page.url.pathname);

	let projectsActive = $derived(pathname === '/' || pathname.startsWith('/projects'));
	let visitsActive = $derived(pathname.startsWith('/visits'));
	let maintenanceActive = $derived(pathname.startsWith('/maintenance'));
</script>

<div class="min-h-screen flex flex-col bg-white">
	<!-- Header -->
	<header class="relative border-t-8 border-il-orange border-b-2 border-il-cloud bg-white">
		<!-- University identity row -->
		<div class="px-8 pt-2 pb-1">
			<a
				href="https://illinois.edu"
				class="inline-flex items-start gap-4"
				aria-label="University of Illinois Urbana-Champaign"
			>
				<!-- Block I: 44×51px Illini Blue square -->
				<div
					class="shrink-0 bg-il-blue flex items-center justify-center"
					style="width:44px;height:51px;padding:10px"
					aria-hidden="true"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34.67" width="22" height="31">
						<path
							fill="white"
							d="M24 9.33V0H0v9.33h5.33v16H0v9.33h24v-9.33h-5.33v-16H24zm-5.33 17.34h4v6.67H1.33v-6.67h4c.74 0 1.33-.6 1.33-1.33v-16C6.67 8.6 6.07 8 5.33 8h-4V1.33h21.33V8h-4c-.74 0-1.33.6-1.33 1.33v16c0 .74.6 1.34 1.34 1.34z"
						/>
						<path
							fill="#FF5F05"
							d="M18.67 8h4V1.33H1.33V8h4c.74 0 1.33.6 1.33 1.33v16c0 .74-.6 1.33-1.33 1.33h-4v6.67h21.33v-6.67h-4c-.74 0-1.33-.6-1.33-1.33v-16c0-.73.6-1.33 1.34-1.33z"
						/>
					</svg>
				</div>

				<!-- Wordmark SVG: hidden below 480px -->
				<div class="hidden min-[480px]:flex items-center" style="height:51px" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 378.6 10.1" width="253" height="7">
						<title>University of Illinois Urbana-Champaign</title>
						<path
							fill="#13294B"
							d="M376.4.2v5.9L371.5.2h-1.9V10h2.3V4l4.8 6h1.9V.2zM361.1 2.3c.5-.3 1-.4 1.7-.4 1 0 1.8.4 2.5 1.1l1.5-1.3c-.5-.6-1.1-1-1.8-1.3-.7-.3-1.5-.4-2.3-.4-1 0-2 .2-2.8.7-.8.4-1.5 1-1.9 1.8-.5.8-.7 1.6-.7 2.6s.2 1.8.7 2.6c.5.8 1.1 1.4 1.9 1.8.8.4 1.7.6 2.7.6.7 0 1.4-.1 2.1-.3.7-.2 1.3-.5 1.8-.9v-4h-2.1v2.9c-.5.3-1.1.4-1.8.4-.6 0-1.2-.1-1.7-.4-.5-.3-.8-.6-1.1-1.1-.3-.5-.4-1-.4-1.6 0-.6.1-1.2.4-1.6.5-.5.8-.9 1.3-1.2zM352.4.2h2.3V10h-2.3zM343.8.2l-4.4 9.8h2.3l.9-2.1h4.5l.9 2.1h2.4L346 .2h-2.2zm-.4 5.9 1.6-3.8 1.6 3.8h-3.2zM336.7.6c-.6-.3-1.4-.4-2.3-.4h-4.2V10h2.3V7.3h2c.9 0 1.6-.1 2.3-.4.6-.3 1.1-.7 1.5-1.2.3-.5.5-1.2.5-1.9s-.2-1.4-.5-1.9c-.4-.6-.9-1-1.6-1.3zm-.8 4.4c-.4.3-.9.4-1.6.4h-1.8V2h1.8c.7 0 1.2.1 1.6.4.4.3.5.7.5 1.3 0 .6-.1 1-.5 1.3zM325.1.2l-3.6 6.1-3.7-6.1H316V10h2.1V4.2l2.8 4.7h1.1l2.9-4.8V10h2.1V.2zM307.4.2 303 10h2.3l.9-2.1h4.6l.9 2.1h2.4L309.7.2h-2.3zm-.4 5.9 1.6-3.8 1.6 3.8H307zM298.8 4h-4.4V.2h-2.3V10h2.3V6h4.4v4h2.3V.2h-2.3zM284.1 2.3c.5-.3 1-.4 1.6-.4 1 0 1.8.4 2.5 1.1l1.5-1.3c-.5-.6-1-1-1.7-1.3-.7-.3-1.4-.4-2.3-.4-1 0-1.9.2-2.7.7-.8.4-1.4 1-1.9 1.8s-.7 1.6-.7 2.6.2 1.8.7 2.6c.5.8 1.1 1.4 1.9 1.8.8.4 1.7.6 2.7.6.8 0 1.6-.1 2.3-.4.7-.3 1.3-.7 1.7-1.3L288.2 7c-.7.8-1.5 1.2-2.5 1.2-.6 0-1.1-.1-1.6-.4-.5-.3-.9-.6-1.1-1.1-.3-.5-.4-1-.4-1.6 0-.6.1-1.1.4-1.6.3-.5.6-.9 1.1-1.2zM274.1 5.2h4V7h-4zM266.3.2 262 10h2.3l.9-2.1h4.6l.9 2.1h2.4L268.7.2h-2.4zm-.4 5.9 1.6-3.8 1.6 3.8h-3.2zM257.8 6.1 252.9.2H251V10h2.3V4l4.9 6h1.8V.2h-2.2zM242.5.2l-4.4 9.8h2.3l.9-2.1h4.5l.9 2.1h2.4L244.7.2h-2.2zm-.5 5.9 1.6-3.8 1.6 3.8H242zM235 4.9c.4-.2.7-.5 1-.9.2-.4.4-.8.4-1.3 0-.8-.3-1.4-1-1.9-.6-.5-1.5-.7-2.7-.7h-4.8V10h5.1c1.3 0 2.2-.2 2.9-.7.7-.5 1-1.1 1-2 0-.6-.2-1.1-.5-1.5-.4-.5-.8-.8-1.4-.9zm-4.9-3h2.3c.6 0 1 .1 1.3.3.3.2.4.5.4.9s-.1.7-.4.9-.7.3-1.3.3h-2.3V1.9zM234 8c-.3.2-.7.3-1.3.3h-2.6V5.8h2.6c1.2 0 1.8.4 1.8 1.2 0 .5-.1.8-.5 1zM224.6 5.6c.4-.5.5-1.2.5-1.9s-.2-1.4-.5-1.9-.8-.9-1.5-1.2c-.6-.3-1.4-.4-2.3-.4h-4.2V10h2.3V7.2h2.1l1.9 2.7h2.4l-2.2-3.1c.6-.3 1.1-.7 1.5-1.2zm-2.3-.6c-.4.3-.9.4-1.6.4h-1.8V2h1.8c.7 0 1.2.1 1.6.4.4.3.5.7.5 1.3 0 .6-.2 1-.5 1.3zM211.2 5.6c0 .9-.2 1.6-.6 2-.4.4-.9.6-1.6.6-1.5 0-2.2-.9-2.2-2.6V.2h-2.3v5.5c0 1.4.4 2.5 1.2 3.3.8.8 1.9 1.2 3.3 1.2s2.5-.4 3.3-1.2c.8-.8 1.2-1.9 1.2-3.3V.2h-2.2v5.4zM195.6 4.7c-.5-.2-1.1-.4-1.8-.5-.7-.2-1.3-.3-1.6-.5-.3-.2-.5-.4-.5-.8s.1-.6.4-.8c.3-.2.8-.3 1.4-.3.9 0 1.8.3 2.7.8l.7-1.7c-.4-.3-1-.5-1.6-.6-.6-.1-1.2-.2-1.8-.2-.9 0-1.7.1-2.3.4-.6.3-1.1.6-1.4 1.1-.3.5-.5 1-.5 1.5 0 .7.2 1.2.5 1.6.3.4.8.7 1.2.9.5.2 1.1.4 1.8.5.5.1.9.2 1.1.3.3.1.5.2.7.4.2.1.3.3.3.6s-.2.6-.5.8c-.3.2-.8.3-1.4.3-.6 0-1.2-.1-1.7-.3s-1.1-.4-1.5-.7l-.6 1.5c.4.3 1 .6 1.7.8.7.2 1.5.3 2.3.3.9 0 1.7-.1 2.3-.4s1.1-.6 1.4-1.1c.3-.5.5-1 .5-1.5 0-.7-.2-1.2-.5-1.6-.4-.3-.8-.6-1.3-.8zM184.4.2h2.3V10h-2.3zM179.2.7c-.8-.4-1.7-.7-2.7-.7-1 0-1.9.2-2.8.7-.8.4-1.5 1-1.9 1.8-.5.8-.7 1.6-.7 2.6s.2 1.8.7 2.6c.5.8 1.1 1.4 1.9 1.8.8.4 1.7.7 2.8.7 1 0 1.9-.2 2.7-.7.8-.4 1.5-1 1.9-1.8.5-.8.7-1.6.7-2.6s-.2-1.8-.7-2.6c-.4-.8-1.1-1.4-1.9-1.8zm-.1 6c-.3.5-.6.8-1.1 1.1-.5.3-1 .4-1.6.4-.6 0-1.1-.1-1.6-.4-.5-.3-.8-.6-1.1-1.1-.3-.5-.4-1-.4-1.6 0-.6.1-1.1.4-1.6.3-.5.6-.8 1.1-1.1.5-.3 1-.4 1.6-.4.6 0 1.1.1 1.6.4.5.3.8.6 1.1 1.1.3.5.4 1 .4 1.6 0 .6-.1 1.1-.4 1.6zM166.2 6.1 161.4.2h-1.9V10h2.2V4l4.9 6h1.9V.2h-2.3zM154 .2h2.3V10H154zM146.9.2h-2.3V10h7.2V8.1h-4.9zM137.5.2h-2.2V10h7.2V8.1h-5zM129.8.2h2.3V10h-2.3zM115 10h2.3V6.4h4.6V4.6h-4.6V2h5.2V.2H115zM109.8.7c-.8-.5-1.7-.7-2.7-.7-1 0-1.9.2-2.8.7-.8.4-1.5 1-1.9 1.8-.5.8-.7 1.6-.7 2.6s.2 1.8.7 2.6c.5.8 1.1 1.4 1.9 1.8.8.4 1.7.7 2.8.7 1 0 1.9-.2 2.7-.7.8-.4 1.5-1 1.9-1.8.5-.8.7-1.6.7-2.6s-.2-1.8-.7-2.6c-.4-.8-1.1-1.4-1.9-1.8zm-.1 6c-.3.5-.6.8-1.1 1.1-.5.3-1 .4-1.6.4s-1.1-.1-1.6-.4c-.5-.3-.8-.6-1.1-1.1-.3-.5-.4-1-.4-1.6 0-.6.1-1.1.4-1.6.3-.5.6-.8 1.1-1.1.5-.3 1-.4 1.6-.4s1.1.1 1.6.4c.5.3.8.6 1.1 1.1.3.5.4 1 .4 1.6 0 .6-.1 1.1-.4 1.6zM90.7 4.5 88.1.2h-2.4l3.8 6.3V10h2.3V6.5L95.6.2h-2.2zM76.6 2h3.1v8H82V2h3.1V.2h-8.5zM72.2.2h2.3V10h-2.3zM68 4.7c-.5-.2-1.1-.4-1.8-.5-.7-.2-1.3-.3-1.6-.5-.4-.2-.6-.4-.6-.8s.1-.6.4-.8c.3-.2.8-.3 1.4-.3.9 0 1.8.3 2.7.8l.7-1.7c-.4-.3-1-.5-1.6-.6-.5-.2-1.1-.3-1.7-.3-.9 0-1.7.1-2.3.4-.6.3-1.1.6-1.4 1.1-.3.5-.5 1-.5 1.5 0 .7.2 1.2.5 1.6.4.4.8.7 1.3.9.5.2 1.1.3 1.8.5.5.1.9.2 1.1.3.3.1.5.2.7.4.2.1.3.3.3.6s-.2.6-.5.8c-.3.2-.8.3-1.4.3-.6 0-1.2-.1-1.7-.3-.6-.2-1.1-.4-1.5-.7L61.6 9c.4.3 1 .6 1.7.8.7.2 1.5.3 2.3.3.9 0 1.7-.1 2.3-.4.6-.3 1.1-.6 1.4-1.1.3-.5.5-1 .5-1.5 0-.7-.2-1.2-.5-1.6-.4-.3-.8-.6-1.3-.8zM59.1 5.6c.4-.5.5-1.2.5-1.9s-.2-1.4-.5-1.9-.8-.9-1.5-1.2C57 .3 56.2.2 55.3.2h-4.2V10h2.3V7.2h2.1l1.9 2.7h2.4l-2.2-3.1c.7-.3 1.2-.7 1.5-1.2zM56.8 5c-.4.3-.9.4-1.6.4h-1.8V2h1.8c.7 0 1.2.1 1.6.4.4.3.5.7.5 1.3 0 .6-.1 1-.5 1.3zM43.1 5.9h4.5V4.1h-4.5V2h5.1V.2h-7.4V10h7.6V8.1h-5.3zM33.8 7.2l-2.9-7h-2.5l4.2 9.8h2.3L39.1.2h-2.2zM24.2.2h2.3V10h-2.3zM18.8 6.1 13.9.2H12V10h2.3V4l4.9 6H21V.2h-2.2zM6.6 5.6c0 .9-.2 1.6-.6 2-.3.4-.8.6-1.5.6-1.5 0-2.2-.9-2.2-2.6V.2H0v5.5C0 7.1.4 8.2 1.2 9c.8.8 1.9 1.2 3.3 1.2S7 9.8 7.8 9C8.6 8.2 9 7.1 9 5.7V.2H6.6v5.4z"
						/>
					</svg>
				</div>
			</a>
		</div>

		<!-- Site name -->
		<div class="px-8 pb-2">
			<a
				href="/"
				class="font-heading font-bold text-2xl text-il-blue no-underline hover:underline hover:text-il-altgeld"
			>
				IDOT Wetlands Data
			</a>
		</div>

		<!-- Navigation -->
		<nav class="border-t border-il-cloud">
			<div class="px-8 flex gap-0">
				<a
					href="/"
					class="px-4 py-2.5 text-sm font-sans font-semibold border-b-2 transition-colors {projectsActive
						? 'border-il-orange text-il-blue'
						: 'border-transparent text-il-storm hover:text-il-blue'}"
				>
					Projects
				</a>
				<a
					href="/visits"
					class="px-4 py-2.5 text-sm font-sans font-semibold border-b-2 transition-colors {visitsActive
						? 'border-il-orange text-il-blue'
						: 'border-transparent text-il-storm hover:text-il-blue'}"
				>
					Visits
				</a>
				<a
					href="/maintenance/people"
					class="px-4 py-2.5 text-sm font-sans font-semibold border-b-2 transition-colors {maintenanceActive
						? 'border-il-orange text-il-blue'
						: 'border-transparent text-il-storm hover:text-il-blue'}"
				>
					Maintenance
				</a>
			</div>
		</nav>
	</header>

	<!-- Page content -->
	<main class="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer>
		<!-- Upper footer: unit-level -->
		<div class="bg-il-blue text-white px-8 py-8">
			<div class="max-w-6xl mx-auto flex flex-col sm:flex-row gap-6 justify-between">
				<div>
					<a href="/" class="font-heading font-bold text-xl text-white hover:underline">
						IDOT Wetlands Data
					</a>
					<p class="mt-2 text-sm text-il-cloud">
						Prairie Research Institute · University of Illinois Urbana-Champaign
					</p>
				</div>
				<div class="text-sm text-il-cloud">
					<p>
						<a href="https://illinois.edu" class="text-white hover:underline">illinois.edu</a>
					</p>
				</div>
			</div>
		</div>

		<!-- Lower footer: university-level -->
		<div class="bg-il-blue-darker text-il-cloud px-8 py-6 border-t border-il-blue-30">
			<div class="max-w-6xl mx-auto">
				<div class="flex flex-wrap gap-x-6 gap-y-2 text-xs mb-4">
					<a href="https://illinois.edu/admissions" class="hover:text-white hover:underline"
						>Admissions</a
					>
					<a href="https://illinois.edu/about/news" class="hover:text-white hover:underline">News</a
					>
					<a href="https://visit.illinois.edu" class="hover:text-white hover:underline"
						>Visit Campus</a
					>
					<a href="https://give.illinois.edu" class="hover:text-white hover:underline">Giving</a>
					<a href="https://calendars.illinois.edu" class="hover:text-white hover:underline"
						>Calendars</a
					>
					<a href="https://directory.illinois.edu" class="hover:text-white hover:underline"
						>Directory</a
					>
					<a href="https://emergency.illinois.edu" class="hover:text-white hover:underline"
						>Emergency</a
					>
				</div>
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
					<span>&copy; {new Date().getFullYear()} University of Illinois Board of Trustees</span>
					<a href="https://illinois.edu/cookie-policy" class="hover:text-white hover:underline"
						>Cookie Policy</a
					>
					<a href="https://illinois.edu/privacy-policy" class="hover:text-white hover:underline"
						>Privacy Policy</a
					>
					<a href="https://illinois.edu/accessibility" class="hover:text-white hover:underline"
						>Accessibility</a
					>
				</div>
			</div>
		</div>
	</footer>
</div>

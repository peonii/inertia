<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { PageData } from './$types';
	import type { User } from '$lib/types';

	export let data: PageData;

	const userQuery = createQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const userResponse = await fetch('https://inertia.live/api/v5/users/@me', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.accessToken}`
				}
			});

			const userData = (await userResponse.json()) as User;

			return userData;
		}
	});
</script>

{#if $userQuery.isSuccess}
	<h1>Welcome, {$userQuery.data.name}!</h1>
{/if}

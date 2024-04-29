import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
	const at = cookies.get('inertia-at');
	if (!at) {
		redirect(302, '/login');
	}

	const rt = cookies.get('inertia-rt');
	if (!rt) {
		redirect(302, '/login');
	}

	return {
		accessToken: at,
		refreshToken: rt
	};
};

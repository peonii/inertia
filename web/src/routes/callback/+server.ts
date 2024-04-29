import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');
	if (code == null) {
		error(400, 'invalid code');
	}

	const state = url.searchParams.get('state');
	if (state == null) {
		error(400, 'invalid state');
	}

	const localState = cookies.get('inertia-state');
	if (localState != state) {
		error(400, 'invalid state');
	}

	const tokenResponse = await fetch('https://inertia.live/api/v5/oauth2/token', {
		method: 'POST',
		body: JSON.stringify({
			code,
			grant_type: 'authorization_code'
		})
	});

	const tokenData = await tokenResponse.json();

	cookies.set('inertia-at', tokenData.access_token, {
		maxAge: 300,
		sameSite: 'lax',
		httpOnly: true,
		secure: true,
		path: '/'
	});

	cookies.set('inertia-rt', tokenData.refresh_token, {
		sameSite: 'lax',
		httpOnly: true,
		secure: true,
		path: '/',
		maxAge: 60 * 60 * 24 * 365
	});

	redirect(302, '/dash');
};

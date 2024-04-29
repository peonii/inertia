import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'node:crypto';

export const GET: RequestHandler = ({ cookies }) => {
	const state = crypto.randomBytes(32).toString('base64url');

	const ENDPOINT =
		`https://inertia.live/oauth2/authorize` +
		`?client_id=Inertia_web` +
		`&redirect_uri=${encodeURIComponent('http://localhost:5173/callback')}` +
		`&response_type=code` +
		`&state=${state}` +
		`&provider=discord`;

	cookies.set('inertia-state', state, {
		sameSite: 'lax',
		httpOnly: true,
		path: '/'
	});

	redirect(302, ENDPOINT);
};

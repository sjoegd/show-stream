/*
 * /transcode/:video
 * Forwards to (API server)/transcode/:video
 */

import { NextRequest } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ video: string }> }) {
	const { video } = await params;

	// TODO:
	// - Sanitize
	// - Validate
	// - Authenticate

	const url = `http://localhost:5000/transcode/${video}`; // TODO: Env variable
	const response = await fetch(url);
	return response;
}

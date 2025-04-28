/*
 * /transcode/:video
 * Forwards to (API server)/transcode/:video
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ video: string }> }) {
	const { video } = await params;

	// TODO:
	// - Sanitize
	// - Validate
	// - Authenticate

	const url = `${process.env.API_SERVER_URL}/transcode/${video}`;

	const response = await fetch(url);
	if (response.ok) {
		return response;
	}

	return NextResponse.json(
		{
			error: 'Failed to transcode video',
		},
		{ status: 500 },
	);
}

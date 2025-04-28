/*
 * /streams/:video/:file
 * Forwards to (API server)/streams/:video/:file
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ video: string; file: string }> }) {
	const { video, file } = await params;

	// TODO:
	// - Sanitize
	// - Validate
	// - Authenticate

	const url = `${process.env.API_SERVER_URL}/streams/${video}/${file}`;

	const response = await fetch(url);
	if (response.ok) {
		return response;
	}

	return NextResponse.json(
		{
			error: 'Failed to fetch video file',
		},
		{ status: 500 },
	);
}

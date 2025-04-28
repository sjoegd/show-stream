/*
 * /streams/:video/:file
 * Forwards to (API server)/streams/:video/:file
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; file: string }> }) {
	const { id, file } = await params;

	const url = `${process.env.API_SERVER_URL}/streams/${id}/${file}`;

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

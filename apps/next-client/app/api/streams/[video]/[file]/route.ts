/*
 * /streams/:video/:file
 * Forwards to (API server)/streams/:video/:file
 */

import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ video: string, file: string }> }) {
	const { video, file } = await params;

  // TODO:
  // - Sanitize
  // - Validate
  // - Authenticate

  const url = `http://localhost:5000/streams/${video}/${file}`; // TODO: Env variable
  const response = await fetch(url)

  return response;
}
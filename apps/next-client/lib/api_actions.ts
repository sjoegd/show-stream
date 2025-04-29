'use server';

/**
 * Actions to interact with the backend API
 */

const API_SERVER_URL = process.env.API_SERVER_URL;

export const transcodeAPI = async (id: string) => {
	const response = await fetch(`${API_SERVER_URL}/transcode/${id}`);
	const { playlistUrl } = (await response.json()) as { playlistUrl: string };
	return playlistUrl;
};

export const getMoviesAPI = async () => {
	const response = await fetch(`${API_SERVER_URL}/movies`);
	const { movies } = (await response.json()) as { movies: [{ id: number }] };
	return movies;
};

interface MovieMetadata {
	id: number;
	poster_path: string;
	title: string;
	release_date: string;
}
export const getMediaAPI = async (id: string): Promise<MovieMetadata | null> => {
	const response = await fetch(`${API_SERVER_URL}/media/${id}`);
	const { media, error } = (await response.json()) as {
		type: string;
		media: { metadata: MovieMetadata };
		error?: string;
	};
	if (error) {
		return null;
	}
	return media.metadata;
};

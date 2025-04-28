'use server';

// Server actions to interact with the API server

const API_SERVER_URL = process.env.API_SERVER_URL;

// /media/:id
export const mediaAPI = async (id: number) => {
	const url = `${API_SERVER_URL}/media/${id}`;
	const response = await fetch(url);
	if (response.ok) {
    const media = await response.json();
		return media;
	}
	return null;
};

// /movies
export type MoviesData = { id: number }[];
export const moviesAPI = async () => {
	const url = `${API_SERVER_URL}/movies`;
	const response = await fetch(url);
	if (response.ok) {
		const movies = await response.json() as MoviesData;
		return movies;
	}
	return [];
};

// /shows
export const showsAPI = async () => {
	const url = `${API_SERVER_URL}/shows`;
	const response = await fetch(url);
	if (response.ok) {
    const shows = await response.json();
		return shows;
	}
	return null;
};

// /transcode/:id
export const transcodeAPI = async (id: number) => {
	const url = `${API_SERVER_URL}/transcode/${id}`;
	const response = await fetch(url);
	if (response.ok) {
    const transcode = await response.json();
    return transcode
	}
	return null;
};

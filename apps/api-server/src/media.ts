import path from 'path';
import fs from 'fs';
import { ensureDbConnection, MediaModel, MetadataModel, MovieModel, ShowModel } from './db';
import { MovieDb, type TvResult, type MovieResult } from 'moviedb-promise';
import { getTranscoding } from './video';
import type { Logger } from 'winston';
import type {
	BaseAPIResponse,
	MediaAPIData,
	ShowsAPIData,
	MovieAPIData,
	MoviesAPIData,
} from '@workspace/types/api-types';
import type { MediaDocument, ShowDocument, MovieDocument } from '@workspace/types/db-types';

/**
 * Media API
 * - requests for media information
 */

// /movies
// -> data of all movies
export const getMovies = async (): Promise<BaseAPIResponse & { data?: MoviesAPIData }> => {
	const { movies, error } = await findMovies();
	if (movies === undefined || error) {
		return { status: 400, error };
	}
	const moviesData: MovieAPIData[] = [];
	for (const movie of movies) {
		const { id, metadata } = movie;
		const transcoding = await getTranscoding(id);
		moviesData.push({ id, transcodeStatus: transcoding?.status || 'not ready', metadata });
	}
	return { status: 200, data: { movies: moviesData } };
};

// /shows
// -> data of all shows
export const getShows = async (): Promise<BaseAPIResponse & { data?: ShowsAPIData }> => {
	const { shows, error } = await findShows();
	if (shows === undefined || error) {
		return { status: 400, error };
	}
	return { status: 200, data: { shows: shows.map(({ id }) => ({ id })) } };
};

// /media/:id
// -> data of certain media
export const getMedia = async (params: { id: number }): Promise<BaseAPIResponse & { data?: MediaAPIData }> => {
	const { id } = params;
	const { error, data } = await findMediaData(id);
	if (error) {
		return { status: 400, error };
	}
	return { status: 200, data };
};

/**
 * Media Scan
 * Creates metadata scan of Movies (later Shows) folder
 */

type IdentifiedMovie = MovieDocument;
const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');

export const mediaScan = async (mediaFolder: string, logger: Logger): Promise<{ success: boolean }> => {
	const identifiedMovies = await movieScan(mediaFolder, logger);

	if (!(await ensureDbConnection())) {
		logger.log('error', 'Database not connected during media scan');
		return { success: false };
	}

	for (const movie of identifiedMovies) {
		const { id, path, metadata } = movie;

		const mediaExists = await MediaModel.exists({ id });
		const movieExists = await MovieModel.exists({ id });

		if (mediaExists) {
			await MediaModel.updateOne({ id }, { $set: { type: 'movie' } });
		} else {
			await MediaModel.create({ id, type: 'movie' });
		}

		if (movieExists) {
			await MovieModel.updateOne({ id }, { $set: { path, metadata } });
		} else {
			await MovieModel.create({ id, path, metadata });
		}
	}

	// Update Metadata > lastScanTime
	const lastScanTime = new Date();
	const metadataExists = await MetadataModel.exists({ id: 0 });
	if (!metadataExists) {
		await MetadataModel.create({ id: 0, lastScanTime });
	} else {
		await MetadataModel.updateOne({ id: 0 }, { $set: { lastScanTime } });
	}

	logger.log('info', `Media scan completed at ${lastScanTime}`);
	return { success: true };
};

export const movieScan = async (mediaFolder: string, logger: Logger): Promise<IdentifiedMovie[]> => {
	const movieBaseFolder = 'movies';
	const movieFolder = path.resolve(mediaFolder, movieBaseFolder);
	const movieDirs = fs.readdirSync(movieFolder);
	const identifiedMovies: IdentifiedMovie[] = [];

	for (const movieDir of movieDirs) {
		// Format: "Movie Name (Year)"
		const movieRegex = /^(.*)\s\((\d{4})\)$/;
		const [_, movieName, movieYear] = movieDir.match(movieRegex) || [];
		const moviePath = `${movieBaseFolder}/${movieDir}`;

		if (movieName && movieYear) {
			const movieResult = await fetchMovieResult({ name: movieName, year: parseInt(movieYear) });
			if (!movieResult || !movieResult?.id) continue;
			identifiedMovies.push({
				id: movieResult.id,
				path: moviePath,
				metadata: movieResult,
			});
		}
	}

	logger.log('info', `Identified ${identifiedMovies.length} movies`);
	return identifiedMovies;
};

export const showScan = async (mediaFolder: string, logger: Logger) => {
	return [];
};

const fetchMovieResult = async ({ name, year }: { name: string; year: number }): Promise<MovieResult | undefined> => {
	const response = await moviedb.searchMovie({ query: name, year });
	const result = response.results![0];
	return result;
};

const fetchShowResult = async ({ name, year }: { name: string; year: number }): Promise<TvResult | undefined> => {
	const response = await moviedb.searchTv({ query: name, year });
	const result = response.results![0];
	return result;
};

/**
 * Utility functions to find media/videos
 */

export const findMediaData = async (id: number): Promise<{ error?: string; data?: MediaAPIData }> => {
	if (!(await ensureDbConnection())) {
		return { error: 'Database not connected' };
	}

	const { error, media } = await findMedia(id);
	if (error || !media) {
		return { error: 'Media not found' };
	}

	const { type } = media;

	if (type === 'movie') {
		const movie = await MovieModel.findOne({ id }).lean();
		const transcoding = await getTranscoding(id);
		return movie
			? { data: { type, metadata: movie.metadata, transcodeStatus: transcoding?.status || 'not ready' } }
			: { error: 'Movie not found' };
	}

	// if (type === 'show') {
	// }

	return { error: 'Media not found' };
};

export const findMedia = async (id: number): Promise<{ error?: string; media?: MediaDocument }> => {
	if (!(await ensureDbConnection())) {
		return { error: 'Database not connected' };
	}

	const media = await MediaModel.findOne({ id }).lean();
	if (!media) {
		return { error: 'Media not found' };
	}

	return { media };
};

export const findMovies = async (): Promise<{ movies?: MovieDocument[]; error?: string }> => {
	if (!(await ensureDbConnection())) {
		return { error: 'Database not connected' };
	}
	const movies = await MovieModel.find({}).lean();
	return { movies };
};

export const findShows = async (): Promise<{ shows?: ShowDocument[]; error?: string }> => {
	if (!(await ensureDbConnection())) {
		return { error: 'Database not connected' };
	}
	const shows = await ShowModel.find({}).select(['id']).lean();
	return { shows };
};


export const findTranscodeMediaInfo = async (id: number): Promise<{ path?: string, title?: string } | null> => {
	const { error, media } = await findMedia(id);

	if (error || !media) {
		return null;
	}

	const { type } = media;

	if (type === 'movie') {
		const movie = await MovieModel.findOne({ id }).lean();
		return { path: movie?.path, title: movie?.metadata.title };
	}

	return null;
};

const acceptedVideoExtensions = ['.mp4'];
export const findMediaVideoPath = async (mediaPath: string): Promise<string | null> => {
	const videoFiles = fs.readdirSync(mediaPath);
	const videoFile = videoFiles.find((file) => {
		return acceptedVideoExtensions.includes(path.extname(file));
	});
	return videoFile ? path.resolve(mediaPath, videoFile) : null;
};

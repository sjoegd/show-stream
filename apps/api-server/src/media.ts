import path from 'path';
import fs from 'fs';
import { ensureDbConnection, MediaModel, MetadataModel, MovieModel, ShowModel } from './db';
import { MovieDb, type TvResult, type MovieResult } from 'moviedb-promise';
import { type Logger } from 'winston';
import { type Response, type Request } from 'express';

/**
 * Media API
 * - requests for media information
 */

// /movies
// -> all movies (id)
export const getMovies = async (params: { req: Request; res: Response }) => {
	const { res } = params;
	const { movies, error } = await findMovies();
	if (error) {
		res.status(500).json({ error });
		return;
	}
	res.status(200).json({ movies: movies.map(({ id }) => ({ id })) });
};

// /shows
// -> all shows (id)
export const getShows = async (params: { req: Request; res: Response }) => {
	const { res } = params;
	const { shows, error } = await findShows();
	if (error) {
		res.status(500).json({ error });
		return;
	}
	res.status(200).json({ shows: shows.map(({ id }) => ({ id })) });
};

// /media/:id
// -> (movie/show, metadata)
export const getMedia = async (params: { id: number; req: Request; res: Response }) => {
	const { id, res } = params;
	const { type, media, error } = await findMedia(id);
	if (!media) {
		res.status(500).json({ error });
		return;
	}
	res.status(200).json({ type, media });
};

/**
 * Media Scan
 * Creates metadata scan of Movies (later Shows) folder
 */

interface IdentifiedMovie {
	id: number;
	path: string;
	metadata: MovieResult;
}

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

export const findMedia = async (id: number) => {
	if (!(await ensureDbConnection())) {
		return { type: null, media: null, error: 'Database not connected' };
	}

	const media = await MediaModel.findOne({ id }).lean();
	if (!media) {
		return { type: null, media: null, error: 'Media not found' };
	}

	const { type } = media;

	if (type === 'movie') {
		const movie = await MovieModel.findOne({ id }).lean();
		return movie ? { type, media: movie } : { type, media: null, error: 'Movie not found' };
	}

	if (type === 'show') {
		const show = await ShowModel.findOne({ id }).lean();
		return show ? { type, media: show } : { type, media: null, error: 'Show not found' };
	}

	return { type: null, media: null, error: 'Media not found' };
};

export const findMovies = async () => {
	if (!(await ensureDbConnection())) {
		return { movies: [], error: 'Database not connected' };
	}
	const movies = await MovieModel.find({}).select(['id']).lean();
	return { movies };
};

export const findShows = async () => {
	if (!(await ensureDbConnection())) {
		return { shows: [], error: 'Database not connected' };
	}
	const shows = await ShowModel.find({}).select(['id']).lean();
	return { shows };
};

export const findMediaPath = async (id: number): Promise<string | null> => {
	const { media } = await findMedia(id);
	return media?.path || null;
};

const acceptedVideoExtensions = ['.mp4'];
export const findMediaVideoPath = async (mediaPath: string): Promise<string | null> => {
	const videoFiles = fs.readdirSync(mediaPath);
	const videoFile = videoFiles.find((file) => {
		return acceptedVideoExtensions.includes(path.extname(file));
	});
	return videoFile ? path.resolve(mediaPath, videoFile) : null;
};

import path from 'path';
import fs from 'fs';
import { MovieDb, type TvResult, type MovieResult } from 'moviedb-promise';
import { type Logger } from 'winston';
import { type Response, type Request } from 'express';

import { ensureDbConnection, MediaModel, MetadataModel, MovieModel, ShowModel } from './db';

// /movies
// -> all movies (id)
export const getMovies = async (params: { req: Request, res: Response }) => {
	const { res } = params;
	
	if(!(await ensureDbConnection())) {
		res.status(500).send({ error: 'Database not connected' });
		return;
	}

	const movies = await MovieModel.find({}).select(['id']).lean();
	res.status(200).json(movies.map(({ id }) => ({ id })))
}

// /shows
// -> all shows (id)
export const getShows = async (params: { req: Request, res: Response }) => {
	const { res } = params;
	
	if(!(await ensureDbConnection())) {
		res.status(500).send({ error: 'Database not connected' });
		return;
	}

	const shows = await ShowModel.find({}).select(['id']).lean();
	res.status(200).json(shows.map(({ id  }) => ({ id })))
}

// /media/:id
// -> (movie/show, metadata)
export const getMedia = async (params: { id: number, req: Request, res: Response }) => {
	const { id, res } = params;

	if (!(await ensureDbConnection())) {
		res.status(500).send({ error: 'Database not connected' });
		return;
	}

	const media = await MediaModel.findOne({ id }).lean();
	
	if (!media) {
		res.status(404).send({ error: 'Media not found' });
		return;
	}

	const { type } = media;

	if (type === 'movie') {
		const movie = await MovieModel.findOne({ id }).lean();

		if (!movie) {
			res.status(404).send({ error: 'Movie not found' });
			return;
		}

		res.status(200).json({ id: movie.id })
		return;
	}

	if (type === 'show') {
		const show = await ShowModel.findOne({ id }).lean();

		if (!show) {
			res.status(404).send({ error: 'Show not found' });
			return;
		}

		res.status(200).json({ id: show.id })
		return;
	}

	res.status(404).send({ error: 'Media not found' });
}


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

export const mediaScan = async (mediaFolder: string, logger: Logger) => {
	const identifiedMovies = await movieScan(mediaFolder, logger);

	if (!(await ensureDbConnection())) {
		logger.log('error', 'Database not connected during media scan');
		return;
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
			await MovieModel.updateOne({ id }, { $set: { path } });
		} else {
			await MovieModel.create({ id, path });
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
};

export const movieScan = async (mediaFolder: string, logger: Logger): Promise<IdentifiedMovie[]> => {
	const movieFolder = path.resolve(mediaFolder, 'movies');
	const movieBaseFolder = `movies`;
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
 * Utility functions to find media/video paths
 */

export const findMediaPath = async (id: number): Promise<string | null> => {
	if (!(await ensureDbConnection())) {
		return null;
	}

	const media = await MediaModel.findOne({ id }).lean();
	if (!media) {
		return null;
	}

	const { type } = media;

	if (type === 'movie') {
		const movie = await MovieModel.findOne({ id }).lean();
		if (!movie) {
			return null;
		}
		return movie.path;
	}

	return null;
}

export const findMediaVideoPath = async (mediaPath: string): Promise<string | null> => {
	const videoFiles = fs.readdirSync(mediaPath);
	const videoFile = videoFiles.find((file) => {
		const ext = path.extname(file).toLowerCase();
		return ['.mp4', '.mkv', '.avi'].includes(ext);
	});
	return videoFile ? path.resolve(mediaPath, videoFile) : null;
}
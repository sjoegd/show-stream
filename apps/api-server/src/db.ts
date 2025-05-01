import mongoose from 'mongoose';
import type {
	MetadataDocument,
	MediaDocument,
	MovieDocument,
	ShowDocument,
	TranscodeDocument,
} from '@workspace/types/db-types';

/**
 * Metadata Database
 *
 * Schemas
 *
 *  Metadata
 *   - lastScanTime
 *
 */

const metadataSchema = new mongoose.Schema<MetadataDocument>({
	lastScanTime: { type: Date, required: true, singleton: true },
});
export const MetadataModel = mongoose.model('Metadata', metadataSchema);

/**
 * Media Scan Database
 *
 * Schemas
 *
 *  Media
 *   - id
 *   - type (movie/show)
 *
 *  Movies
 *    - id
 *    - folder path
 *    - metadata (moviedb result)
 *
 *  Shows
 *    - id
 *    - folder path
 *    - metadata (moviedb result)
 *
 *  Transcode
 * 	 - id
 *   - state
 *   - cache path
 *   - stream path
 *   - last request date
 */

const mediaSchema = new mongoose.Schema<MediaDocument>({
	id: { type: Number, required: true, unique: true, primary: true },
	type: { type: String, enum: ['movie', 'show'], required: true },
});
const movieSchema = new mongoose.Schema<MovieDocument>({
	id: { type: Number, required: true, unique: true, primary: true },
	path: { type: String, required: true },
	metadata: { type: mongoose.Schema.Types.Mixed, required: true },
});
const showSchema = new mongoose.Schema<ShowDocument>({
	id: { type: Number, required: true, unique: true, primary: true },
	path: { type: String, required: true },
});
const transcodeSchema = new mongoose.Schema<TranscodeDocument>({
	id: { type: Number, required: true, unique: true, primary: true },
	status: { type: String, enum: ['not ready', 'in progress', 'ready'], required: true },
	lastRequestDate: { type: Date },
});

export const MediaModel = mongoose.model('Media', mediaSchema);
export const MovieModel = mongoose.model('Movie', movieSchema);
export const ShowModel = mongoose.model('Show', showSchema);
export const TranscodeModel = mongoose.model('Transcode', transcodeSchema);

/**
 * Utility functions for database connection
 */

const getDbUrl = () => {
	return `mongodb://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_URL}:27017`;
};

export const setupDb = async () => {
	await mongoose.connect(getDbUrl());
	await MetadataModel.createCollection();
	await MediaModel.createCollection();
	await MovieModel.createCollection();
	await ShowModel.createCollection();
	await TranscodeModel.createCollection();
	// TEMP clear transcodings
	await TranscodeModel.deleteMany({});
	return mongoose.connection.readyState === 1;
};

export const closeDb = async () => {
	await mongoose.connection.close();
};

export const ensureDbConnection = async (): Promise<boolean> => {
	if (mongoose.connection.readyState == mongoose.ConnectionStates.connected) {
		return true;
	}

	try {
		await mongoose.connect(getDbUrl());
	} catch (error) {
		// TODO: Logger
		console.error('Failed to connect to MongoDB:', error);
		return false;
	}

	// @ts-ignore
	return mongoose.connection.readyState == mongoose.ConnectionStates.connected;
};

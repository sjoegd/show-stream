import mongoose from 'mongoose';

/**
 * Metadata Database
 * 
 * Schemas
 *  
 *  Metadata
 *   - lastScanTime
 * 
 */

const metadataSchema = new mongoose.Schema({
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
 */

const mediaSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true, primary: true },
	type: { type: String, enum: ['movie', 'show'], required: true },
});
const movieSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true, primary: true },
	path: { type: String, required: true },
});
const showSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true, primary: true },
	path: { type: String, required: true },
});

export const MediaModel = mongoose.model('Media', mediaSchema);
export const MovieModel = mongoose.model('Movie', movieSchema);
export const ShowModel = mongoose.model('Show', showSchema);

/**
 * Utility functions for database connection
 */

export const setupDb = async () => {
	await mongoose.connect('mongodb://root:root@127.0.0.1:27017');
  await MetadataModel.createCollection();
	await MediaModel.createCollection();
	await MovieModel.createCollection();
	await ShowModel.createCollection();
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
		await mongoose.connect('mongodb://root:root@127.0.0.1:27017');
	} catch (error) {
		console.error('Failed to connect to MongoDB:', error);
		// TODO: Logger
		return false;
	}

	// @ts-ignore
	return mongoose.connection.readyState == mongoose.ConnectionStates.connected;
};

const setupTempDb = async () => {
	const tempMovie = new MovieModel({
		id: 1,
		path: '/movies/Temp Movie 1',
	});
	const tempMedia = new MediaModel({
		id: 1,
		type: 'movie',
	});
	try {
		await tempMedia.save();
	} catch (e) {}
	try {
		await tempMovie.save();
	} catch (e) {}
};

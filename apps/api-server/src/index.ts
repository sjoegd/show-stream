import dotenv from 'dotenv';

dotenv.config({
	path: '.env',
});
dotenv.config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

import { createServer } from './server';
import { streamVideoFile, transcodeVideo } from './video';
import { setupDb } from './db';
import { getMedia, getMovies, getShows, mediaScan } from './media';
import path from 'path';

const port = process.env.PORT || 5000;
const { app, logger } = createServer();

setupDb().then((connected: boolean) => {
	if (!connected) {
		logger.log('error', 'Failed to connect to MongoDB database');
		return;
	}
	logger.log('info', 'Succesfully connected to MongoDB database');
});

// Temp Media Scan
app.get('/scan', async (_req, res) => {
	const mediaFolder = process.env.MEDIA_FOLDER || path.resolve(__dirname, '../media');
	await mediaScan(mediaFolder, logger)
	res.status(200).send();
})

app.get('/streams/:id/:file', (req, res) => {
	const { id, file } = req.params;
	streamVideoFile({ id: Number(id), file, logger, req, res });
});

app.get('/transcode/:id', (req, res) => {
	const { id } = req.params;
	transcodeVideo({ id: Number(id), logger, req, res });
});

app.get('/movies', (req, res) => {
	getMovies({ req, res });
});

app.get('/shows', (req, res) => {
	getShows({ req, res });
});

app.get('/media/:id', (req, res) => {
	const { id } = req.params;
	getMedia({ req, res, id: Number(id) });
});

app.listen(port, () => {
	logger.log('info', `API server is running on port ${port}`);
});

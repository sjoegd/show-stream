import { createServer } from './server';
import { streamVideoFile, transcodeVideo } from './video';

const port = process.env.PORT || 5000;
const { app, logger } = createServer();

app.get('/streams/:video/:file', (req, res) => {
	const { video, file } = req.params;
	streamVideoFile({ video, file, logger, req, res });
});

app.get('/transcode/:video', (req, res) => {
	const { video } = req.params;
	transcodeVideo({ video, logger, req, res });
});

app.listen(port, () => {
	logger.log('info', `API server is running on port ${port}`);
});

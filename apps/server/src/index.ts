import { createServer } from './server';
import path from 'path';
import { convertVideo } from './video';

const port = process.env.PORT || 5001;
const server = createServer();

server.get('/stream/:video', async (req, res) => {
	const { video } = req.params;
  console.log(`Request for stream of video: ${video}`);
  const videoPath = await convertVideo(video);
  console.log(`Converted video path for ${video}: ${videoPath}`);
  res.send(videoPath);
});

server.get('/videos/:video/:file', (req, res) => {
  const { video, file } = req.params;
  console.log(`Request ${file} for video: ${video}`);
  const videoPath = path.resolve(__dirname, `../videos/${video}/${file}`);
  res.sendFile(videoPath);
})

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

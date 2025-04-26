import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

export const convertVideo = (video: string) => {
	const videoFolder = path.resolve(__dirname, `../videos/${video}`);
	const mp4Path = path.resolve(videoFolder, `${video}.mp4`);
	const m3u8Path = path.resolve(videoFolder, `output.m3u8`);
	const segmentPath = path.resolve(videoFolder, `segment_%03d.ts`);

	return new Promise<string>((res, rej) => {
		const command = ffmpeg(mp4Path)
			.output(m3u8Path)
			.outputOptions([
				'-codec:v libx264',
				'-codec:a aac',
				'-hls_time 10',
				'-hls_playlist_type vod',
				`-hls_segment_filename ${segmentPath}`,
				'-start_number 0',
			]);
		command.on('end', () => {
			res(`videos/${video}/output.m3u8`);
		});
		command.on('error', (err) => {
			console.error('Error converting video:', err);
			rej(err);
		});
		command.run();
	});
};

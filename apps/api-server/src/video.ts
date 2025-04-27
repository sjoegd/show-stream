// Video API

import fs from 'fs';
import path from 'path';
import ffmpeg, { ffprobe } from 'fluent-ffmpeg';
import { type Response, type Request } from 'express';
import { type Logger } from 'winston';

// Should be in a reddis cache or something similar
// Cache should be cleared after ~time of the certain video not being accessed anymore
const transcodings: Record<string, { cachePath: string } | null> = {};

/*
 * /transcode/:video
 * TODO: video -> id (need map of id -> path)
 * Request a transcoding of a video
 * If transcoding is already in progress | done, returns the stream path for the playlist
 * If not, start a new transcoding process and returns the stream path for the playlist that is being updated
 */
interface TranscodeVideoParams {
	video: string;
	logger: Logger;
	req: Request;
	res: Response;
}
const acceptedVideos = ['.mp4', '.mkv', '.avi', '.mov'];
export const transcodeVideo = async (params: TranscodeVideoParams) => {
	const { video, logger, res } = params;

	if (!acceptedVideos.includes(path.extname(video)) || !validPath(video)) {
		logger.log('security', `Invalid video request: ${video}`);
		res.status(400).send('Invalid video');
		return;
	}

	const videoBase = path.basename(video, path.extname(video));
	const videoFolder = path.resolve(__dirname, `../media/videos/${videoBase}`);
	const videoPath = path.resolve(videoFolder, video);
	const cacheFolder = path.resolve(__dirname, `../media/cache/${videoBase}`);
	const segmentPath = path.resolve(cacheFolder, 'segment%03d.ts');
	const cachePath = path.resolve(cacheFolder, 'playlist.m3u8');

	if (!fs.existsSync(cacheFolder)) {
		fs.mkdirSync(cacheFolder, { recursive: true });
	}

	if (transcodings[videoBase]) {
		res.status(200).json({ playlistUrl: `/streams/${videoBase}/playlist.m3u8` });
		return;
	}

	transcodings[videoBase] = {
		cachePath,
	};

	// Convert to HSL Format
	// TODO:
	// - Update ffmpeg
	// - 480p 720p 1080p
	// - Encode using libx264, aac

	ffmpeg()
		.input(videoPath)
		.output(cachePath)
		.outputOptions([
			'-c copy',
			'-hls_time 10',
			'-hls_playlist_type vod',
			'-hls_list_size 0',
			'-hls_flags independent_segments',
			'-hls_segment_type mpegts',
			`-hls_segment_filename ${segmentPath}`,
			'-f hls',
		])
		.on('end', () => {
			res.status(200).json({ playlistUrl: `/streams/${videoBase}/playlist.m3u8` });
		})
		.on('progress', () => {})
		.run();
};

/*
 * /streams/:video/:file
 * TODO: video -> id
 * Static serve of transcoded video files
 */
interface StreamVideoFileParams {
	video: string;
	file: string;
	logger: Logger;
	req: Request;
	res: Response;
}
const acceptedVideoFiles = ['.m3u8', '.ts'];
export const streamVideoFile = async (params: StreamVideoFileParams) => {
	const { video, file, logger, res } = params;

	if (!acceptedVideoFiles.includes(path.extname(file)) || !validPath(video) || !validPath(file)) {
		logger.log('security', `Invalid video file request: ${video}/${file}`);
		res.status(400).send('Invalid video file');
		return;
	}

	if (file.endsWith('.m3u8')) {
		logger.log('info', `Request for ${video} with playlist: ${file}`);

		const videoTranscoding = transcodings[video];
		if (!videoTranscoding) {
			res.status(404).send('Transcoding not found');
			return;
		}

		const { cachePath } = videoTranscoding;
		res.sendFile(cachePath);
		return;
	}

	const filePath = path.resolve(__dirname, `../media/cache/${video}/${file}`);
	res.sendFile(filePath);
};

const validPath = (path: string): boolean => {
	return !(path.includes('..') || path.includes('/') || path.includes('\\'));
};

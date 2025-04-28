// Video API

import fs from 'fs';
import path from 'path';
import ffmpeg, { ffprobe } from 'fluent-ffmpeg';
import { type Response, type Request } from 'express';
import { type Logger } from 'winston';
import { findMediaPath, findMediaVideoPath } from './media';

const transcodings: Record<number, { cacheFolder: string; streamPath: string }> = {};

/*
 * /transcode/:id
 * Request a transcoding of media (id)
 * If transcoding is already in progress | done, returns the stream path for the playlist
 * If not, start a new transcoding process and returns the stream path for the playlist that is being updated
 */
const acceptedVideos = ['.mp4']; // Update later
export const transcodeVideo = async (params: { id: number; logger: Logger; req: Request; res: Response }) => {
	const { id, logger, res } = params;

	const mediaPath = await findMediaPath(id);

	if (!mediaPath) {
		res.status(404).send({ error: 'Video not found' });
		return;
	}

	const mediaResolvedPath = path.resolve(__dirname, '../media', mediaPath);
	const videoPath = await findMediaVideoPath(mediaResolvedPath);

	if (!videoPath) {
		res.status(404).send({ error: 'Video not found' });
		return;
	}

	if (!acceptedVideos.includes(path.extname(videoPath))) {
		logger.log('info', `Invalid video request: ${path.basename(videoPath)}`);
		res.status(400).send('Invalid video');
		return;
	}

	const cacheFolder = path.resolve(__dirname, `../media/cache/${id}`);
	const playlistPath = path.resolve(cacheFolder, 'playlist.m3u8');
	const segmentPath = path.resolve(cacheFolder, 'segment%03d.ts');

	// Transcoding already exists
	if (transcodings[id]) {
		const { streamPath } = transcodings[id];
		res.status(200).json({ playlistUrl: `${streamPath}/playlist.m3u8` });
		return;
	}

	if (!fs.existsSync(cacheFolder)) {
		fs.mkdirSync(cacheFolder, { recursive: true });
	}

	// Convert to HSL Format
	// TODO:
	// - Update ffmpeg
	// - 480p 720p 1080p
	// - Encode using libx264, aac

	ffmpeg()
		.input(videoPath)
		.output(playlistPath)
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
			transcodings[id] = {
				cacheFolder,
				streamPath: `/streams/${id}`,
			};
			res.status(200).json({ playlistUrl: `${transcodings[id].streamPath}/playlist.m3u8` });
		})
		.on('progress', () => {})
		.run();
};

/*
 * /streams/:id/:file
 * Static serve of transcoded video files
 */
const acceptedVideoFiles = ['.m3u8', '.ts'];
export const streamVideoFile = async (params: {
	id: number;
	file: string;
	logger: Logger;
	req: Request;
	res: Response;
}) => {
	const { id, file, logger, res } = params;
	const transcoding = transcodings[id];

	if (!acceptedVideoFiles.includes(path.extname(file)) || !validPath(file) || !transcoding) {
		logger.log('security', `Invalid video file request: ${id}/${file}`);
		res.status(400).send('Invalid video file');
		return;
	}

	const { cacheFolder } = transcoding;
	const filePath = path.resolve(cacheFolder, file);
	res.sendFile(filePath);
};

const validPath = (path: string): boolean => {
	return !(path.includes('..') || path.includes('/') || path.includes('\\'));
};

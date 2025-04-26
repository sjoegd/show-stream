'use client';

import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		let hls: Hls | null = null;

		const setup = async () => {
			const response = await fetch(videoUrl);
			const file = await response.text();
			const src = `http://localhost:5001/${file}`;
			const video = videoRef.current;

			if (video) {
				if (Hls.isSupported()) {
					hls = new Hls();
					hls.loadSource(src);
					hls.attachMedia(video);
				} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
					video.src = src;
				}
			}
		};

		setup();

		return () => {
			if (hls) {
				hls.destroy();
			}
		};
	}, [videoUrl]);

	return <video ref={videoRef} controls className="mx-auto w-full max-w-2xl" />;
}

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HLSPlayer({ playlistUrl }: { playlistUrl: string | null }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		let hls: Hls | null = null;
		const { current: video } = videoRef;
		if (!video) return;
		if (!playlistUrl) return;

		playlistUrl = `/api${playlistUrl}`;
		if (Hls.isSupported()) {
			hls = new Hls({
				debug: true,
				lowLatencyMode: true,
			});
			hls.loadSource(playlistUrl);
			hls.attachMedia(video);
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = playlistUrl;
		}

		return () => hls?.destroy();
	}, [playlistUrl]);

	return <video ref={videoRef} controls className="mx-auto aspect-video max-h-full w-full" />;
}

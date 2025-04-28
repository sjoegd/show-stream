import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ video }: { video: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		let hls: Hls | null = null;
		const videoElement = videoRef.current;

		if (!videoElement) return;

		(async () => {
			const response = await fetch(`/api/transcode/${video}`);
			let { playlistUrl } = await response.json() as { playlistUrl: string };

			if (!playlistUrl) {
				return;
			}
			
			playlistUrl = `/api${playlistUrl}`;

			if (Hls.isSupported()) {
				hls = new Hls({
					debug: true,
					liveSyncDurationCount: 3,
					liveMaxLatencyDurationCount: 6,
					interstitialLiveLookAhead: 30,
					manifestLoadingTimeOut: 1000,
					manifestLoadingMaxRetry: 10,
					lowLatencyMode: true,
				});
				hls.loadSource(playlistUrl);
				hls.attachMedia(videoElement);
			} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
				videoElement.src = playlistUrl;
			}
		})();

		return () => {
			if (hls) {
				hls.destroy();
			}
		};
	}, [video]);

	return <video ref={videoRef} controls className="mx-auto w-full max-w-2xl" />;
}

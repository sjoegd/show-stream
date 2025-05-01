'use client';

import HLSPlayer from '@/components/hls-player';
import { useFetchTranscodePlaylist } from '@/hooks/use-video-api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VideoPage() {
	const { id } = useParams();
	const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
	const transcodePlaylist = useFetchTranscodePlaylist();

	useEffect(() => {
		const getPlaylistUrl = async () => {
			const playlistUrl = await transcodePlaylist(Number(id));
			setPlaylistUrl(playlistUrl);
		};
		getPlaylistUrl();
	}, [id]);

	return (
		<div className="flex items-center justify-center h-screen">
			<HLSPlayer playlistUrl={playlistUrl} />
		</div>
	);
}

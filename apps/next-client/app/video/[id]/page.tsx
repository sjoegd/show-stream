'use client';

import HLSPlayer from '@/components/hls-player';
import { transcodeAPI } from '@/lib/api_actions';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VideoPage() {
	const { id } = useParams();
	const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchPlaylistUrl = async () => {
			const { playlistUrl } = await transcodeAPI(Number(id));
			setPlaylistUrl(playlistUrl);
		};
		fetchPlaylistUrl();
	}, [id]);

	return (
		<div className="flex items-center justify-center h-screen">
			<HLSPlayer playlistUrl={playlistUrl} />
		</div>
	);
}

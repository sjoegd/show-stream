'use client';

import VideoPlayer from '@/components/video-player';

export default function Home() {
	const videoUrl = 'http://localhost:5001/stream/video_2';

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<VideoPlayer videoUrl={videoUrl} />
		</div>
	);
}

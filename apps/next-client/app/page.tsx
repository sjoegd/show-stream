'use client';

import VideoPlayer from '@/components/video-player';

export default function Home() {
	const video = 'video_2.mp4';

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<VideoPlayer video={video} />
		</div>
	);
}

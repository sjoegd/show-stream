'use client';

import useSWR from 'swr';
import MediaCardContainer from '@/components/media/media-card-container';
import MediaCard from '@/components/media/media-card';
import LoadingCircle from '@/components/loading-circle';
import { Input } from '@workspace/ui/components/input';
import type { MoviesAPIData } from '@workspace/types/api-types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MoviesPage() {
	const { data, isLoading } = useSWR<MoviesAPIData>('/api/movies', fetcher, { refreshInterval: 1000 });

	if (!data || isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<LoadingCircle size="64" />
			</div>
		);
	}

	return (
		<div className="w-full max-h-full overflow-y-auto flex flex-col items-center px-4 md:px-16 xl:px-24 py-8 gap-4">
			<h1 className="text-3xl w-full">Movies</h1>
			<div className="w-full min-h-fit">
				<Input />
			</div>
			<MediaCardContainer>
				{data?.movies.map((movie) => (
					<MediaCard key={movie.id} id={movie.id} {...movie.metadata} transcodeStatus={movie.transcodeStatus} />
				))}
			</MediaCardContainer>
		</div>
	);
}

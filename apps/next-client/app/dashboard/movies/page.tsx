// Page showing the list of movies
export const dynamic = 'force-dynamic';

import MediaCard from '@/components/media-card';
import MediaCardContainer from '@/components/media-card-container';
import { getMediaAPI, getMoviesAPI } from '@/lib/api_actions';
import { Input } from '@workspace/ui/components/input';

export default async function MoviesPage() {
	const movies = await getMoviesAPI();
	let moviesMetadata = [];
	for (const movie of movies) {
		const metadata = await getMediaAPI(`${movie.id}`);
		if (!metadata) continue;
		moviesMetadata.push(metadata);
	}
	// For UI testing
	moviesMetadata = [...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata];
	moviesMetadata = [...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata, ...moviesMetadata];

	return (
		<div className="w-full max-h-full overflow-y-auto flex flex-col items-center px-4 md:px-16 xl:px-24 py-8 gap-4">
			<h1 className="text-3xl w-full">Movies</h1>
			<div className="w-full min-h-fit">
				<Input />
			</div>
			<MediaCardContainer>
				{moviesMetadata.map((metadata, index) => (
					<MediaCard key={metadata.id + index} {...metadata} />
				))}
			</MediaCardContainer>
		</div>
	);
}


// Page showing the list of movies

import MediaCard from '@/components/media-card';
import { moviesAPI } from '@/lib/api_actions';
import { Input } from '@workspace/ui/components/input';

export default async function MoviesPage() {

	const movies = await moviesAPI();

	return (
		<div className="w-full max-h-full overflow-y-auto flex flex-col items-center px-16 py-8 gap-4">
			<h1 className="text-3xl w-full">Movies</h1>
			<div className="w-full min-h-fit">
				<Input />
			</div>
			<div className="flex w-full min-h-fit bg-accent gap-2">
				{movies.map((movie) => (<MediaCard key={movie.id} id={movie.id} />))}
      </div>
			<div className="flex w-full min-h-96 bg-accent"></div>
			<div className="flex w-full min-h-96 bg-accent"></div>
			<div className="flex w-full min-h-96 bg-accent"></div>
		</div>
	);
}

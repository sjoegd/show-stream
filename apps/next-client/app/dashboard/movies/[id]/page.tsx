'use client';

import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TranscodeStatusIcon from '@/components/media/transcode-status-icon';
import MoreOptionsPopover from '@/components/media/more-options-popover';
import LoadingCircle from '@/components/icons/loading-circle';
import { Button } from '@workspace/ui/components/button';
import { useFetchTranscodeRequest } from '@/hooks/use-video-api';
import type { MovieAPIData } from '@workspace/types/api-types';
import type { TranscodeStatus } from '@workspace/types/db-types';
import Backward from '@/components/dashboard/backward';
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MoviePage() {
	const { id } = useParams();
	const { data, isLoading } = useSWR<MovieAPIData>(`/api/movie/${id}`, fetcher, { refreshInterval: 1000 });

	if (!data || isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<LoadingCircle size="64" />
			</div>
		);
	}

	const { metadata } = data;
	const transcodeStatus: TranscodeStatus = metadata.transcodeStatus || 'not ready';

	const poster = metadata.images.posters[0];
	const logo = metadata.images.logos[0];
	const cast = metadata.credits.cast.slice(0, 7);

	return (
		<div>
			<div
				className="fixed inset-0 -z-10 left-56 max-w-screen"
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/original${metadata.details.backdrop_path})`,
					backgroundSize: 'cover',
					backgroundPosition: 'top',
					backgroundRepeat: 'no-repeat',
				}}
			/>
			<div className="min-w-full max-h-full overflow-y-auto overflow-x-clip">
				<div className="flex h-[40vh] w-full px-14">
					<div className="flex relative">
						<Backward className="mt-12" />
						<div className="flex relative my-auto">
							<Image
								src={`${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/w400${logo?.file_path}`}
								alt={`Logo image for ${metadata.details.title}`}
								width={logo?.width || 400}
								height={logo?.height || 600}
								className="w-auto max-w-96 max-h-48 object-cover"
								loading="eager"
							/>
						</div>
						{/* <div className="my-auto text-5xl text-white">{metadata.details.title}</div> */}
					</div>
					<div className="ml-auto mt-auto text-white py-8 px-12 flex items-center gap-2">
						<PlayButton
							id={metadata.details.id as number}
							title={metadata.details.title}
							transcodeStatus={transcodeStatus}
						/>
						<TranscodeStatusIcon transcodeStatus={transcodeStatus} size="32" offset={4} />
						<MoreOptionsPopover size="32" />
					</div>
				</div>
				<div className="grid grid-cols-12 gap-8 h-full min-h-fit bg-background pt-8 px-12 pr-16">
					<div className="col-span-3 rounded-lg overflow-clip">
						<Image
							src={`${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/original${poster?.file_path}`}
							alt={`Poster image for ${metadata.details.title}`}
							width={poster?.width || 720}
							height={poster?.height || 1280}
							className="w-full h-auto object-cover"
						/>
					</div>
					<div className="flex flex-col w-full col-span-9 gap-4 pr-12">
						<h1 className="text-3xl">{metadata.details.title}</h1>
						<div className="flex w-full gap-2">
							{metadata.details.genres.map((genre) => (
								<p key={genre.id} className="text-sm bg-accent text-primary px-3 py-1 rounded-md">
									{genre.name}
								</p>
							))}
						</div>
						<div className="flex flex-col w-full border-2 rounded-md p-4 gap-4 my-3">
							<div className="flex gap-3">
								<p>{metadata.details.release_date?.split('-')[0]}</p>
								<p>{`${metadata.details.runtime} min`}</p>
								<p className="flex items-center gap-[2px]">
									<Star size={18} className="fill-yellow-300 stroke-yellow-300 p-[1px] pb-[2px]" />
									<span>{metadata.details.vote_average?.toFixed(1)}</span>
								</p>
							</div>
							<p className="text-lg">{metadata.details.tagline}</p>
							<p>{metadata.details.overview}</p>
							<div className="flex font-bold">
								<a
									className="hover:underline"
									href={`https://imdb.com/title/${metadata.details.imdb_id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									IMDb
								</a>
								<span className="mr-2">,</span>
								<a
									className="hover:underline"
									href={`https://themoviedb.org/movie/${metadata.details.id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									TMDB
								</a>
							</div>
						</div>
						<div className="flex gap-6 w-fit border-2 rounded-md p-3">
							<p>Director</p>
							<p>{metadata.credits.crew.find((c) => c.job == 'Director')?.name}</p>
						</div>
						<div className="flex gap-6 w-fit border-2 rounded-md p-3">
							<p>Studios</p>
							<p className="flex">
								{metadata.details.production_companies.map((company, index) => (
									<span key={company.id}>
										{company.name}
										{index < metadata.details.production_companies.length - 1 && <span className="mr-2">,</span>}
									</span>
								))}
							</p>
						</div>
						<div className="flex w-full gap-3">
							<div className="flex gap-6 w-fit border-2 rounded-md p-2">
								<p>Video</p>
								<p>1080p</p>
							</div>
							<div className="flex gap-6 w-fit border-2 rounded-md p-2">
								<p>Audio</p>
								<p>English</p>
							</div>
							<div className="flex gap-6 w-fit border-2 rounded-md p-2">
								<p>Subtitles</p>
								<p>English</p>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-background py-8 px-12">
					<h2 className="text-2xl mb-4">Cast</h2>
					<div className="flex w-full gap-4">
						{cast.map((c) => (
							<CastCard key={c.name} name={c.name} character={c.character} profilePath={c.profile_path} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function PlayButton({ id, title, transcodeStatus }: { id: number; title?: string; transcodeStatus: TranscodeStatus }) {
	const ready = transcodeStatus === 'ready';
	const transcodeRequest = useFetchTranscodeRequest();

	if (ready) {
		return (
			<Button asChild variant="default" size="lg" className="text-lg px-10 py-5 rounded-4xl">
				<Link href={`/video/${id}`}>Play</Link>
			</Button>
		);
	}

	return (
		<Button
			variant="default"
			size="lg"
			className="text-lg px-10 py-5 rounded-4xl"
			onClick={async () => {
				await transcodeRequest(id, title);
			}}
		>
			Play
		</Button>
	);
}

function CastCard({ name, character, profilePath }: { name: string; character: string; profilePath?: string }) {
	return (
		<Card className="p-0 gap-0">
			<CardContent className="p-0 rounded-t-xl overflow-hidden max-h-64">
				<div className="relative w-full h-full">
					<Image
						src={`${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/w200${profilePath || '/default-profile.png'}`}
						alt={`Profile image of ${name}`}
						width={200}
						height={300}
						className="w-full max-h-full object-cover"
						loading="lazy"
						priority={false}
					/>
				</div>
			</CardContent>
			<CardFooter className="p-4 border-t">
				<div>
					<p>{name}</p>
					<p className="text-sm text-muted-foreground">{character}</p>
				</div>
			</CardFooter>
		</Card>
	);
}

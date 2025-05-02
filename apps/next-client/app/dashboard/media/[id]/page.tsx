'use client';

import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TranscodeStatusIcon from '@/components/media/transcode-status-icon';
import MoreOptionsPopover from '@/components/media/more-options-popover';
import LoadingCircle from '@/components/loading-circle';
import { Button } from '@workspace/ui/components/button';
import { useFetchTranscodeRequest } from '@/hooks/use-video-api';
import type { MediaAPIData } from '@workspace/types/api-types';
import type { TranscodeStatus } from '@workspace/types/db-types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MediaPage() {
	const { id } = useParams();
	const { data, isLoading } = useSWR<MediaAPIData>(`/api/media/${id}`, fetcher, { refreshInterval: 1000 });

	if (!data || isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<LoadingCircle size="64" />
			</div>
		);
	}

	const { metadata, transcodeStatus } = data;

	return (
		<div>
			<div
				className="fixed inset-0 -z-10 left-56 max-w-screen"
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/original${metadata.backdrop_path})`,
					backgroundSize: 'cover',
					backgroundPosition: 'top',
					backgroundRepeat: 'no-repeat',
				}}
			/>
			<div className="w-full max-h-full overflow-y-auto overflow-x-clip">
				<div className="flex h-[40vh] w-full px-14">
					<div className="text-white my-auto text-5xl">{metadata.title}</div>
					<div className="ml-auto mt-auto text-white py-8 px-12 flex items-center gap-2">
						<PlayButton id={metadata.id as number} title={metadata.title} transcodeStatus={transcodeStatus} />
						<TranscodeStatusIcon transcodeStatus={transcodeStatus} size="32" offset={4} />
						<MoreOptionsPopover size="32" />
					</div>
				</div>
				<div className="grid grid-cols-12 gap-8 h-full min-h-fit bg-background py-8 px-12 pr-16">
					<div className="col-span-3 rounded-lg overflow-clip">
						<Image
							src={`${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/original${metadata.poster_path}`}
							alt={`Poster image for ${metadata.title}`}
							width={1280}
							height={720}
							className="w-full h-auto object-cover"
						/>
					</div>
					<div className="flex flex-col w-full col-span-9 gap-4 pr-12">
						<h1 className="text-3xl">{data.metadata.title}</h1>
						<div className="flex flex-col w-full border rounded-md p-4 gap-4">
							<div>
								<p>{metadata.release_date?.split('-')[0]}</p>
							</div>
							<p>{metadata.overview}</p>
						</div>
					</div>
					<div className="min-h-[500px]">Temp</div>
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

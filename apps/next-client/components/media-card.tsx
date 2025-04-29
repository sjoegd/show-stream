import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { EllipsisVertical, PlayIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function MediaCard({
	id,
	title,
	poster_path,
	release_date,
}: {
	id: number;
	title: string;
	poster_path: string;
	release_date: string;
}) {
	return (
		<Card className="p-0 rounded-sm overflow-clip gap-0 select-none w-full max-w-56 mx-auto">
			<CardContent className="max-h-64 p-0">
				<div className="relative w-full h-full">
					<Image
						src={`${process.env.NEXT_PUBLIC_MOVIE_DB_IMAGE_BASE_URL}/w200/${poster_path}`}
						alt={`${title} poster`}
						width={200}
						height={300}
						className="max-w-full max-h-full object-cover"
						loading="lazy"
						priority={false}
					/>
					<div className="absolute flex flex-col inset-0 w-full h-full bg-neutral-950/25 opacity-0 transition-opacity hover:opacity-100 text-white">
						<div className="flex justify-center items-center h-full">
							<Link
								href={`/video/${id}`}
								className="p-4 bg-neutral-950/75 rounded-full transform transition-transform duration-200 hover:scale-125"
							>
								<PlayIcon className="fill-current" />
							</Link>
						</div>
						<div className="flex justify-end p-2">
							<Popover>
								<PopoverTrigger>
									<EllipsisVertical />
								</PopoverTrigger>
								<PopoverContent className='w-48' align="center" side="top">
									More info
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="p-2 border-t-0">
				<div className="flex flex-col text-center w-full">
					<Link href={`/dashboard/media/${id}`} className="w-full h-full">
						<h2 className="text-base whitespace-nowrap truncate max-w-full hover:underline">{title}</h2>
					</Link>
					<p className="text-sm">{release_date.split('-')[0]}</p>
				</div>
			</CardFooter>
		</Card>
	);
}

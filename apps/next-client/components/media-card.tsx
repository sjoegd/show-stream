import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import Link from 'next/link';

export default function MediaCard({ id }: { id: number }) {
	return (
		<Link href={`/video/${id}`}>
			<Card className="w-48 h-64">
				<CardContent>{id}</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</Link>
	);
}

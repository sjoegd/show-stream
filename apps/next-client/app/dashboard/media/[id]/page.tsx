export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <div>{id}</div>;
}

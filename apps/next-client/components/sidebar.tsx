import { buttonVariants } from '@workspace/ui/components/button';
import { FilmIcon, HomeIcon, SearchIcon, SettingsIcon, TvIcon } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
	return (
		<div className="border-r h-full min-w-48 flex flex-col gap-8">
			<div className="flex flex-col items-start border-b px-4 py-2">
				<h1 className="text-2xl">ShowStream</h1>
				<p className="text-sm">A personal media server</p>
			</div>
			<div className="flex flex-col gap-4 px-4">
				<SidebarSection
					sectionHeader="Main"
					elements={[
						{ icon: <HomeIcon className="size-[18px]" />, text: 'Home', href: '/dashboard' },
						{ icon: <SearchIcon className="size-[18px]" />, text: 'Search', href: '/dashboard/search' },
					]}
				/>
				<SidebarSection
					sectionHeader="Media"
					elements={[
						{ icon: <FilmIcon className="size-[18px]" />, text: 'Movies', href: '/dashboard/movies' },
						{ icon: <TvIcon className="size-[18px]" />, text: 'Shows', href: '/dashboard/shows' },
					]}
				/>
				<SidebarSection
					sectionHeader="User"
					elements={[{ icon: <SettingsIcon className="size-[18px]" />, text: 'Settings', href: '/dashboard/settings' }]}
				/>
			</div>
		</div>
	);
}

function SidebarSection({
	sectionHeader,
	elements,
}: {
	sectionHeader?: string;
	elements: { icon: React.ReactNode; text: string; href: string }[];
}) {
	return (
		<div className='flex flex-col gap-1'>
			{sectionHeader && <h2 className="text-sm">{sectionHeader}</h2>}
			<ul>
				{elements.map((el, i) => (
					<SidebarElement key={i} {...el} />
				))}
			</ul>
		</div>
	);
}

function SidebarElement({ icon, text, href }: { icon: React.ReactNode; text: string; href: string }) {
	return (
		<li className='w-full'>
			<Link className={buttonVariants({ variant: 'ghost', className: "w-full justify-start" })} href={href}>
				{icon}
				<span>{text}</span>
			</Link>
		</li>
	);
}

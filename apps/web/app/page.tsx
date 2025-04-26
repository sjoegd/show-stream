import { ModeToggle } from '@/components/mode-toggle';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
				<ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
					<li className="mb-2">
						Get started by editing{' '}
						<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">app/page.tsx</code>.
					</li>
					<li>Save and see your changes instantly.</li>
				</ol>

				<p>
					All the buttons are from the <kbd>ui</kbd> package. The auto complete works as well.
				</p>

				<pre className="border rounded-sm p-1.5 bg-foreground/10">
					<code>{`import { Button, buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';`}</code>
				</pre>

				<ModeToggle />

				<Button size={'sm'}>Click me</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size={'sm'}>
							Dropdown <ChevronDownIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>Item 1</DropdownMenuItem>
						<DropdownMenuItem>Item 2</DropdownMenuItem>
						<DropdownMenuCheckboxItem checked>Item 3</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>Item 3</DropdownMenuCheckboxItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>Item 3</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem>Item 3.1</DropdownMenuItem>
								<DropdownMenuItem>Item 3.2</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>

				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<a
						className={cn(buttonVariants({ size: 'lg' }), 'rounded-full')}
						href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
						Deploy now
					</a>
					<a
						className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full')}
						href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						Read our docs
					</a>
				</div>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
					Learn
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
					Examples
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
					Go to nextjs.org →
				</a>
			</footer>
		</div>
	);
}

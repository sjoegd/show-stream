import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
// import "@/app/globals.css"
import { Providers } from '@/components/providers';
import { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import { headers } from 'next/headers';

const fontSans = Geist({
	subsets: ['latin'],
	variable: '--font-sans',
});

const fontMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-mono',
});

export const metadata: Metadata = {
	title: 'ShowStream client',
	description: 'The streaming client for ShowStream',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

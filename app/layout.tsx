import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: {
		default: 'SimOne - Music Guessing Game',
		template: '%s | SimOne',
	},
	description: 'Test your music knowledge! Guess songs from audio snippets, video clips, or lyrics. Compete on the leaderboard and climb the ranks.',
	icons: {
		icon: [
			{
				url: '/logo.ico',
			},
		],
		apple: '/apple-icon.png',
	},
};

export const viewport: Viewport = {
	themeColor: '#0a0b10',
	width: 'device-width',
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className='font-sans antialiased'>
				<Providers>
					<Navbar />
					<main className='min-h-[calc(100vh-57px)]'>{children}</main>
					<Toaster
						position='bottom-right'
						toastOptions={{
							style: {
								background: 'oklch(0.14 0.008 260)',
								border: '1px solid oklch(0.22 0.01 260)',
								color: 'oklch(0.95 0.01 260)',
							},
						}}
					/>
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}

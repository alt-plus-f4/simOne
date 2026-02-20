'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const navLinks = [
	{ href: '/play', label: 'Play', icon: Music },
	{ href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Navbar() {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className='sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl'>
			<nav className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
				<Link href='/' className='flex items-center gap-2'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg'>
						<Image width={32} height={32} src={'/logo.png'} alt='S' />
					</div>
					<span className='text-lg font-bold tracking-tight text-foreground'>SimOne</span>
				</Link>

				{/* Desktop Nav */}
				<div className='hidden items-center gap-1 md:flex'>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								pathname === link.href ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
							)}
						>
							<link.icon className='h-4 w-4' />
							{link.label}
						</Link>
					))}
				</div>

				<div className='hidden items-center gap-3 md:flex'>
					{status === 'loading' ? (
						<div className='h-8 w-8 animate-pulse rounded-full bg-muted' />
					) : session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
									<Avatar className='h-8 w-8'>
										<AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? 'User'} />
										<AvatarFallback className='bg-primary/20 text-sm text-primary'>{session.user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-48'>
								<div className='px-2 py-1.5'>
									<p className='text-sm font-medium'>{session.user.name}</p>
									<p className='text-xs text-muted-foreground'>{session.user.email}</p>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href='/profile' className='flex items-center gap-2'>
										<User className='h-4 w-4' />
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className='flex items-center gap-2 text-destructive'>
									<LogOut className='h-4 w-4' />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className='flex items-center gap-2'>
							<Button variant='ghost' size='sm' asChild>
								<Link href='/login'>Log In</Link>
							</Button>
							<Button size='sm' asChild>
								<Link href='/register'>Sign Up</Link>
							</Button>
						</div>
					)}
				</div>

				{/* Mobile Toggle */}
				<button className='rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden' onClick={() => setMobileOpen(!mobileOpen)} aria-label='Toggle menu'>
					{mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
				</button>
			</nav>

			{/* Mobile Nav */}
			{mobileOpen && (
				<div className='border-t border-border/50 bg-background px-4 py-3 md:hidden'>
					<div className='flex flex-col gap-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMobileOpen(false)}
								className={cn(
									'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									pathname === link.href ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
								)}
							>
								<link.icon className='h-4 w-4' />
								{link.label}
							</Link>
						))}
						{session?.user ? (
							<>
								<Link href='/profile' onClick={() => setMobileOpen(false)} className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground'>
									<User className='h-4 w-4' />
									Profile
								</Link>
								<button
									onClick={() => {
										setMobileOpen(false);
										signOut({ callbackUrl: '/' });
									}}
									className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
								>
									<LogOut className='h-4 w-4' />
									Sign Out
								</button>
							</>
						) : (
							<div className='flex items-center gap-2 pt-2'>
								<Button variant='ghost' size='sm' className='flex-1' asChild>
									<Link href='/login' onClick={() => setMobileOpen(false)}>
										Log In
									</Link>
								</Button>
								<Button size='sm' className='flex-1' asChild>
									<Link href='/register' onClick={() => setMobileOpen(false)}>
										Sign Up
									</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}

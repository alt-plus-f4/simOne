'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast.error('Invalid email or password');
			} else {
				toast.success('Welcome back!');
				router.push('/play');
				router.refresh();
			}
		} catch {
			toast.error('Something went wrong');
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className='w-full max-w-sm border-border/50 bg-card'>
			<CardHeader className='text-center'>
				<div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
					<Music className='h-5 w-5 text-primary-foreground' />
				</div>
				<CardTitle className='text-xl'>Welcome back</CardTitle>
				<CardDescription>Sign in to your SimOne account</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='email'>Email</Label>
						<Input id='email' type='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete='email' />
					</div>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='password'>Password</Label>
						<Input id='password' type='password' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete='current-password' />
					</div>
					<Button type='submit' className='w-full' disabled={loading}>
						{loading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Signing in...
							</>
						) : (
							'Sign In'
						)}
					</Button>
				</form>
				<p className='mt-4 text-center text-sm text-muted-foreground'>
					{"Don't have an account? "}
					<Link href='/register' className='font-medium text-primary hover:underline'>
						Sign up
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}

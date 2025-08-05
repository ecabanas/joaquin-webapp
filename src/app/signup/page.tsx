
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuthErrorMessage } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  
  useEffect(() => {
    const token = searchParams.get('inviteToken');
    if (token) {
      setInviteToken(token);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password, inviteToken);
      router.push('/list');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Signup Failed',
        description: getAuthErrorMessage(error.code),
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex items-center gap-3 justify-center mb-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl">Joaquin</span>
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteToken && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>You've been invited!</AlertTitle>
              <AlertDescription>
                Complete your registration to join your new workspace.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup} className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Jane Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
  )
}

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin" />}>
        <SignupForm />
      </Suspense>
    </main>
  );
}

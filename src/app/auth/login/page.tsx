'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Sign in to your CRM dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-[12px] bg-rose-50 border border-rose-100 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-rose-700 font-medium leading-snug">{error}</p>
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 h-[44px] rounded-[12px] font-semibold text-[14px] hover:bg-slate-50 transition-all shadow-sm mb-6 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-400 font-medium text-[12px] uppercase tracking-wider">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-700 tracking-wide">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
            <Input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-[44px] rounded-[12px] bg-slate-50 border-slate-200/80 focus:bg-white" 
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-slate-700 tracking-wide">Password</label>
            <Link href="#" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
            <Input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-[44px] rounded-[12px] bg-slate-50 border-slate-200/80 focus:bg-white" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-[44px] rounded-[12px] bg-[#2563EB] hover:bg-blue-700 text-[14px] font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all mt-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[13px] text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

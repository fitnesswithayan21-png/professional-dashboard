'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple local authentication (Bypassed temporarily)
    localStorage.setItem('crm_auth', 'true');
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
      <div className="relative w-full max-w-[400px] px-6">
        
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#09090B] mb-4 shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#09090B] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#52525B] mt-2 text-sm">
            Sign in to your NexusAI workspace
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E4E4E7] animate-fade-in stagger-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email and Password fields temporarily removed */}
            <div className="text-center text-sm text-[#52525B] pb-2">
              Login is temporarily open. Click Sign In to continue.
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-2 h-10"
            >
              {loading ? 'Signing in...' : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo credentials footer removed */}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#A1A1AA] mt-8 animate-fade-in stagger-4">
          © 2025 NexusAI Solutions.
        </p>
      </div>
    </div>
  );
}

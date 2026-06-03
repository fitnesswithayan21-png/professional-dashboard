import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-[400px]">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity w-fit">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md shadow-blue-600/20">
                <span className="text-white font-black text-lg leading-none tracking-tighter">N</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Nexus<span className="text-[#2563EB]">AI</span></span>
            </Link>
          </div>
          
          {children}

          <div className="mt-12 text-left">
            <p className="text-xs text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} NexusAI Solutions Inc.<br />
              Secure, enterprise-grade CRM automation.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Premium Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B1120] overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full h-full text-white">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen CRM</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
              Automate your workflow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">intelligent precision</span>.
            </h1>
            
            <p className="text-lg text-slate-400 font-medium mb-12 max-w-md leading-relaxed">
              NexusAI empowers high-ticket closers and enterprise teams to seamlessly manage leads, memory, and appointments in one unified, AI-driven workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white mb-1">Bank-grade Security</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Your credentials are encrypted and stored with strict RLS isolation.</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white mb-1">Lightning Fast</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Built on edge networks for instant data syncing and retrieval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

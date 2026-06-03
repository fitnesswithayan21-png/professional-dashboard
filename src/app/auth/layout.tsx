import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Column: Auth Form */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col justify-center items-center px-6 sm:px-12 relative z-10 shrink-0 border-r border-slate-100">
        <div className="w-full max-w-[440px]">
          <div className="mb-12">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md shadow-blue-600/20">
                <span className="text-white font-black text-xl leading-none tracking-tighter">N</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">Nexus<span className="text-[#2563EB]">AI</span></span>
            </Link>
          </div>
          
          {children}

          <div className="mt-12 text-left border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              &copy; {new Date().getFullYear()} NexusAI Solutions Inc.<br />
              Secure, enterprise-grade CRM automation.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Premium Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B1120] overflow-hidden items-center justify-center">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-24 w-full h-full text-white max-w-[800px]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-sm shadow-xl">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen CRM</span>
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-bold tracking-tight mb-8 leading-[1.15]">
              Automate your workflow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">intelligent precision</span>.
            </h1>
            
            <p className="text-xl text-slate-400 font-medium mb-12 max-w-xl leading-relaxed">
              NexusAI empowers high-ticket closers and enterprise teams to seamlessly manage leads, memory, and appointments in one unified, AI-driven workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white mb-1.5">Bank-grade Security</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Your credentials are encrypted and stored with strict RLS isolation.</p>
                </div>
              </div>
              
              <div className="flex gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white mb-1.5">Lightning Fast</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Built on edge networks for instant data syncing and retrieval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

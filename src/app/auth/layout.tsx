import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link href="/" className="flex justify-center items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-black text-xl leading-none tracking-tighter">N</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">Nexus<span className="text-blue-600">AI</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] z-10">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[24px] sm:px-10 border border-slate-100/50 backdrop-blur-xl">
          {children}
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 mt-8 text-center">
        <p className="text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} NexusAI Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}

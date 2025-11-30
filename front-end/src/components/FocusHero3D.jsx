import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Zap, Trophy, Flame } from 'lucide-react';

export default function FocusHero3D({ score }) {
  const [isLoading, setIsLoading] = useState(true);

  const getMessage = () => {
    if (score >= 80) return "Unstoppable Flow!";
    if (score >= 50) return "Building Momentum";
    return "Let's Get Focused";
  };

  return (
    <div className="glass-panel w-full h-[280px] rounded-3xl relative overflow-hidden flex items-center justify-center group p-2">
      
      {/* CENTERING WRAPPER */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center h-full">
        
        {/* 1. LEFT STATS */}
        <div className="relative z-10 p-8 flex flex-col justify-center h-full w-full md:w-1/2 pointer-events-none space-y-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <div className="p-1.5 bg-yellow-500/20 rounded-lg text-yellow-400 animate-pulse">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
                Focus Score
              </span>
            </div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-xl tracking-tighter">
              {score}
            </h2>
          </div>

          <div>
            <p className="text-indigo-200 font-medium text-lg tracking-wide">
              {getMessage()}
            </p>
            {score >= 80 && (
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
                <Trophy size={12} /> TOP 5% PERFORMANCE
              </div>
            )}
          </div>

        </div>

        {/* 2. ROBOT (Zoomed & Centered Relative to Wrapper) */}
        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <Spline 
            scene="https://prod.spline.design/rekCTJLXgncSK5px/scene.splinecode" 
            onLoad={() => setIsLoading(false)}
            // Still using scale/translate to position him perfectly
            className="w-full h-full scale-125 -translate-x-4 translate-y-4" 
          />
        </div>

      </div>

      {/* 3. RIGHT STREAK CARD (Fixed to container edge) */}
      <div className="absolute bottom-0 right-0 z-20 flex items-center gap-4 bg-[#09090b] border border-white/10 px-5 py-3 rounded-2xl shadow-2xl transition-colors cursor-default">
        <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
          <Flame size={24} fill="currentColor" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Daily Streak</p>
          <p className="text-xl font-bold text-white leading-none mt-0.5">3 Days</p>
        </div>
      </div>

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/20 pointer-events-none" />
    </div>
  );
}

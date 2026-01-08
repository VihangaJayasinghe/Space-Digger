'use client'
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/store'; // Adjust path if needed

export default function HUD() {
  const { oxygen, maxOxygen, money, isOnSurface } = useGameStore();
  
  // Calculate Percentage for the bar
  const oxygenPct = Math.max(0, (oxygen / maxOxygen) * 100);
  const isLowOxygen = oxygenPct < 25; // Warning threshold

  return (
    <div className="fixed inset-0 pointer-events-none p-6 flex flex-col justify-between z-50 select-none font-sans">
      
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-start">
        
        {/* LEFT: MONEY WIDGET */}
        <div className="flex flex-col">
          <div className="bg-slate-900/90 border-l-4 border-yellow-500 rounded-r-lg px-6 py-3 shadow-[0_0_15px_rgba(234,179,8,0.2)] backdrop-blur-md">
             <div className="text-[10px] text-yellow-500/80 uppercase tracking-[0.2em] font-bold mb-1">
               Credits
             </div>
             <div className="text-3xl font-mono text-white font-bold tracking-wider flex items-center gap-1 drop-shadow-md">
               <span className="text-yellow-500">$</span>
               {money.toLocaleString()}
             </div>
          </div>
        </div>

        {/* RIGHT: STATUS WIDGET */}
        <div className="flex flex-col items-end">
           <div className={`
             bg-slate-900/90 border-r-4 rounded-l-lg px-6 py-3 backdrop-blur-md shadow-lg
             ${isOnSurface ? 'border-green-500 shadow-green-500/20' : 'border-blue-500 shadow-blue-500/20'}
           `}>
             <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-1 text-right ${isOnSurface ? 'text-green-400' : 'text-blue-400'}`}>
               System Status
             </div>
             <div className="text-xl font-bold uppercase text-white tracking-widest text-right">
               {isOnSurface ? 'DOCKED' : 'MINING OPS'}
             </div>
           </div>
        </div>
      </div>

      {/* --- BOTTOM BAR (OXYGEN) --- */}
      <div className="flex flex-col items-center pb-8">
        
        {/* Critical Warning Label */}
        {isLowOxygen && (
           <div className="mb-2 text-red-500 font-bold animate-pulse uppercase tracking-[0.3em] text-sm bg-black/50 px-4 py-1 rounded">
             ⚠ Critical Oxygen Levels ⚠
           </div>
        )}

        {/* OXYGEN GAUGE CONTAINER */}
        <div className={`
            relative w-[600px] max-w-[90vw] bg-slate-950/80 border-2 rounded-xl p-1.5 
            transition-all duration-300 shadow-xl backdrop-blur
            ${isLowOxygen ? 'border-red-600 shadow-red-900/40 scale-105' : 'border-slate-700'}
        `}>
          
          {/* Header Row inside bar */}
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1 px-1">
            <span className={isLowOxygen ? 'text-red-400' : 'text-cyan-400'}>
              O2 Tank Pressure
            </span>
            <span className="text-slate-500 font-mono">
              {Math.floor(oxygen)} / {maxOxygen} UNITS
            </span>
          </div>

          {/* The Bar Track */}
          <div className="h-5 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-800">
             
             {/* Striped Background Pattern */}
             <div className="absolute inset-0 opacity-20" 
                  style={{backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 5px, #222 5px, #222 10px)'}}>
             </div>

             {/* The Actual Fill Bar */}
             <div 
               className={`h-full transition-all duration-300 ease-out relative flex items-center justify-end
                 ${isLowOxygen ? 'bg-gradient-to-r from-red-900 via-red-600 to-red-500' : 'bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-400'}
               `}
               style={{ width: `${oxygenPct}%` }}
             >
                {/* White Glint at the tip */}
                <div className="h-full w-[2px] bg-white/50 shadow-[0_0_10px_white]"></div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
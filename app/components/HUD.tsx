'use client'
import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { supabase } from '../lib/supabase';

export default function HUD() {
  const { 
    money, 
    oxygen, 
    maxOxygen, 
    user, 
    isOnSurface 
  } = useGameStore();

  const [isSaving, setIsSaving] = useState(false);

  // --- LOGIC ---
  const oxygenPct = Math.max(0, (oxygen / maxOxygen) * 100);
  const isLowOxygen = oxygenPct < 25;

  const displayUsername = user?.email 
    ? user.email.replace('@spacedigger.local', '') 
    : 'PILOT';

  const handleLogout = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
        console.log("Initiating Logout Sequence...");
        
        // 1. Attempt Save
        await useGameStore.getState().saveStatsToCloud();
        
        // 2. Attempt Supabase SignOut
        const { error } = await supabase.auth.signOut();
        if (error) console.error("SignOut Error:", error.message);
        
    } catch (err) {
        console.error("Logout failed:", err);
    } finally {
        // 3. FORCE EXIT (Always runs, even if save fails)
        console.log("Clearing local data...");
        useGameStore.getState().setUser(null);
        useGameStore.getState().clearLoadedData();
        localStorage.clear();
        
        // 4. Reload
        window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none p-6 flex flex-col justify-between z-50 select-none font-sans">
      
      {/* --- TOP BAR --- */}
      <div className="flex justify-between items-start">
        
        {/* LEFT COLUMN: MONEY */}
        <div className="flex flex-col gap-3">
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

        {/* RIGHT COLUMN: STATUS, PROFILE & LOGOUT */}
        {/* Added 'z-50' to ensure this column sits on top of everything */}
        <div className="flex flex-col items-end pointer-events-auto gap-2 z-50">
           
           <div className={`
             bg-slate-900/95 border-r-4 rounded-l-lg px-6 py-4 backdrop-blur-xl shadow-2xl flex flex-col items-end gap-3 transition-colors duration-500
             ${isOnSurface ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-cyan-600 shadow-blue-500/10'}
           `}>
             
             {/* STATUS */}
             <div className="flex flex-col items-end border-b border-slate-800 pb-2 w-full mb-1">
                <div className={`text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5 ${isOnSurface ? 'text-green-400' : 'text-cyan-400'}`}>
                   System Status
                </div>
                <div className={`text-lg font-black uppercase tracking-widest flex items-center gap-2 ${isOnSurface ? 'text-white' : 'text-slate-300'}`}>
                   {isOnSurface && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />}
                   {isOnSurface ? 'DOCKED' : 'MINING OPS'}
                </div>
             </div>

             {/* PILOT */}
             <div className="flex flex-col items-end">
                <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                   Command Link
                </div>
                <div className="text-sm font-bold text-slate-200 tracking-wider">
                   {displayUsername}
                </div>
             </div>
             
             {/* LOGOUT BUTTON (Fixed) */}
             <button 
                onClick={handleLogout}
                disabled={isSaving}
                className="mt-1 text-[9px] bg-red-950/30 hover:bg-red-900/80 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-white px-4 py-1.5 rounded-sm uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
             >
                {isSaving ? 'SAVING...' : 'DISCONNECT'}
             </button>
           </div>
        </div>

      </div>

      {/* --- BOTTOM AREA (OXYGEN) --- */}
      <div className="flex justify-center items-end w-full pb-6">
         <div className="flex flex-col items-center w-full max-w-[600px]">
            {isLowOxygen && (
               <div className="mb-3 text-red-500 font-black animate-pulse uppercase tracking-[0.3em] text-xs bg-black/80 px-6 py-2 rounded border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                 ⚠ Critical Oxygen Levels ⚠
               </div>
            )}

            <div className={`
               relative w-full bg-slate-950/80 border-2 rounded-xl p-1.5 
               transition-all duration-300 shadow-2xl backdrop-blur
               ${isLowOxygen ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)] scale-105' : 'border-slate-700'}
            `}>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1 px-1">
                <span className={isLowOxygen ? 'text-red-400' : 'text-cyan-400'}>
                  Life Support Systems
                </span>
                <span className="text-slate-500 font-mono">
                  {Math.floor(oxygen)} / {maxOxygen} UNITS
                </span>
              </div>
              <div className="h-5 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-800">
                  <div className="absolute inset-0 opacity-20" 
                       style={{backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 5px, #222 5px, #222 10px)'}}>
                  </div>
                  <div 
                    className={`h-full transition-all duration-300 ease-linear relative flex items-center justify-end
                      ${isLowOxygen ? 'bg-gradient-to-r from-red-900 via-red-600 to-red-500' : 'bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-400'}
                    `}
                    style={{ width: `${oxygenPct}%` }}
                  >
                     <div className="h-full w-[2px] bg-white/50 shadow-[0_0_10px_white]"></div>
                  </div>
              </div>
            </div>
         </div>
      </div>

    </div>
  );
}
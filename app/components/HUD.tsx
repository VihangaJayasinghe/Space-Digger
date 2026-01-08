'use client'
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';
import { supabase } from '../lib/supabase';

export default function HUD() {
  const { 
    money, 
    oxygen, 
    maxOxygen, 
    stats, 
    user, 
    inventory 
  } = useGameStore();

  const [isSaving, setIsSaving] = useState(false);

  // Oxygen Bar Calculation
  const oxygenPercent = Math.max(0, (oxygen / maxOxygen) * 100);
  
  // Calculate total cargo count
  const cargoCount = Object.values(inventory).reduce((a, b) => a + b, 0);

  const handleLogout = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    console.log("Saving before logout...");
    
    // 1. Force a final save of Stats
    await useGameStore.getState().saveStatsToCloud();
    
    // 2. Sign Out
    await supabase.auth.signOut();
    
    // 3. Clear Local State & Cloud Buffer (CRITICAL FIX)
    useGameStore.getState().setUser(null);
    useGameStore.getState().clearLoadedData(); // <--- This prevents map clashes
    
    // 4. Clear Local Storage
    localStorage.clear();
    
    // 5. Reload to Menu
    window.location.reload();
  };

  // Safe Username Display
  const displayUsername = user?.email 
    ? user.email.replace('@spacedigger.local', '') 
    : 'PILOT';

  return (
    <div className="w-full h-full relative pointer-events-none p-4">
      
      {/* TOP LEFT: MONEY & DEPTH */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
         <div className="bg-slate-900/80 border border-yellow-500/50 p-2 rounded flex items-center gap-3 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <div className="text-yellow-500 font-bold text-lg">$</div>
            <div className="text-white font-mono text-xl tracking-wider">{money.toLocaleString()}</div>
         </div>
         <div className="bg-slate-900/80 border border-cyan-500/50 p-2 rounded flex items-center gap-3">
            <div className="text-cyan-500 text-xs font-bold uppercase">Depth</div>
            <div className="text-white font-mono text-lg">{Math.floor(stats.maxDepth)}m</div>
         </div>
      </div>

      {/* TOP RIGHT: PROFILE & LOGOUT */}
      {user && (
        <div className="absolute top-4 right-4 pointer-events-auto flex flex-col items-end gap-2">
            <div className="bg-slate-900/90 border border-slate-600 px-3 py-1 rounded text-xs text-slate-300 font-mono uppercase">
              CMD: {displayUsername}
            </div>
            
            <button 
              onClick={handleLogout}
              disabled={isSaving}
              className="bg-red-900/80 hover:bg-red-800 text-red-200 text-[10px] font-bold uppercase px-3 py-1 rounded border border-red-700 transition-colors"
            >
              {isSaving ? 'SAVING...' : 'SAVE & LOGOUT'}
            </button>
        </div>
      )}

      {/* BOTTOM LEFT: OXYGEN */}
      <div className="absolute bottom-4 left-4 w-64">
         <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-cyan-400">OXYGEN LEVELS</span>
            <span className="text-white font-mono">{Math.floor(oxygen)}/{maxOxygen}</span>
         </div>
         <div className="w-full h-4 bg-slate-800 rounded-full border border-slate-600 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-300 ${oxygenPercent < 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}
              style={{ width: `${oxygenPercent}%` }}
            />
            {/* Gloss effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full" />
         </div>
      </div>

      {/* BOTTOM RIGHT: CARGO */}
      <div className="absolute bottom-4 right-4">
         <div className="bg-slate-900/80 border border-slate-600 p-2 rounded flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Cargo Hold</span>
            <span className="text-xl text-white font-mono">{cargoCount} <span className="text-sm text-slate-500">items</span></span>
         </div>
      </div>

    </div>
  );
}
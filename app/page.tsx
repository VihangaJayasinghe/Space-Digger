'use client'
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Inventory from './components/Inventory';
import HelpLegend from './components/HelpLegend';
import HUD from './components/HUD';
import UpgradeShop from './components/UpgradeShop';
import ResetButton from './components/ResetButton';
import StatsMenu from './components/StatsMenu';
import Auth from './components/Auth';           
import Scoreboard from './components/Scoreboard'; 
import MainMenu from './components/MainMenu';    
import { useGameStore } from './game/store';

const Game = dynamic(() => import('./components/Game'), {
  ssr: false,
  loading: () => <div className="text-cyan-500 font-mono absolute inset-0 flex items-center justify-center bg-black z-50">INITIALIZING SYSTEMS...</div>
});

export default function Home() {
  const { sellItems, isOnSurface } = useGameStore();
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING'>('MENU');
  
  // UI States
  const [showShop, setShowShop] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // --- KEYBOARD CONTROLS ---
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'f' && isOnSurface) sellItems();
      if (key === 'e' && isOnSurface) setShowShop(prev => !prev);
      if (key === 'o') setShowStats(prev => !prev);
      if (key === 'i') setShowLegend(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'i') setShowLegend(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOnSurface, sellItems, gameState]);

  useEffect(() => {
    if (!isOnSurface) setShowShop(false);
  }, [isOnSurface]);

  if (gameState === 'MENU') {
    return <MainMenu onStart={() => setGameState('PLAYING')} />;
  }

  return (
    <main className="relative h-screen w-screen bg-black overflow-hidden font-sans select-none animate-in fade-in duration-1000">

      {/* LAYER 0: THE GAME */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-950">
        <Game />
      </div>

      {/* LAYER 2: UI PANELS (Inventory, Shop, Stats) - z-20 */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6">
        
        {/* ACTION PROMPTS */}
        <div className={`
          absolute top-24 left-1/2 -translate-x-1/2 flex gap-4 transition-all duration-300
          ${isOnSurface ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}>
          <div className="bg-slate-900/80 backdrop-blur border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2">
            <span className="bg-yellow-500 text-black font-bold text-xs px-1.5 rounded">[F]</span>
            <span className="text-xs font-bold tracking-widest uppercase">Sell Cargo</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/50 text-cyan-400 px-4 py-2 rounded shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
            <span className="bg-cyan-500 text-black font-bold text-xs px-1.5 rounded">[E]</span>
            <span className="text-xs font-bold tracking-widest uppercase">Workshop</span>
          </div>
        </div>

        {/* LEFT: INVENTORY (Inventory is z-20) */}
        <div className="absolute top-32 left-6 pointer-events-auto transition-opacity duration-300 opacity-80 hover:opacity-100">
           <Inventory />
           <div className="mt-4 text-[9px] text-slate-500 font-mono">[O] STATS & ONLINE</div>
        </div>

        {/* CENTER: SHOP */}
        {showShop && isOnSurface && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-500 rounded-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                  <h2 className="text-xl font-black text-white italic tracking-tighter">
                    ENGINEERING <span className="text-cyan-500">BAY</span>
                  </h2>
                  <div className="text-[10px] text-cyan-400 font-mono">[E] TO CLOSE</div>
                </div>
                <UpgradeShop />
                <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Auth: Cmdr. Data</span>
                  <ResetButton />
                </div>
             </div>
          </div>
        )}

        {/* CENTER: STATS */}
        {showStats && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[600px] pointer-events-auto animate-in fade-in zoom-in-95 duration-200 z-50">
             <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-slate-600 rounded-xl p-6 shadow-2xl h-full flex flex-col relative">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2 flex-shrink-0">
                  <h2 className="text-xl font-black text-white italic tracking-tighter">
                    MISSION <span className="text-slate-500">STATISTICS</span>
                  </h2>
                  <div className="text-[10px] text-slate-400 font-mono">[O] TO CLOSE</div>
                </div>
                <div className="flex gap-4 h-full min-h-0">
                  <div className="flex-1 min-w-0">
                     <StatsMenu />
                  </div>
                  <div className="w-72 flex-shrink-0 flex flex-col gap-4 border-l border-slate-800 pl-4">
                     <Scoreboard />
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* RIGHT: LEGEND */}
        <div className={`
          absolute top-32 right-6 w-72 pointer-events-auto transition-all duration-200
          ${showLegend ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
        `}>
          <div className="bg-slate-900/95 backdrop-blur border border-slate-600 rounded-lg p-4 shadow-2xl">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">
              Scanner Data [HOLD I]
            </div>
            <HelpLegend />
          </div>
        </div>

      </div>

      {/* LAYER 3: HUD (Top Most - z-30) */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <HUD />
      </div>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none text-right opacity-40">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">
          SPACE<span className="text-cyan-500">DIGGER</span>
        </h1>
      </div>

    </main>
  );
}
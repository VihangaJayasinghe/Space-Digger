'use client'
import React from 'react';
import { useGameStore } from '../game/store';

export default function SellButton() {
  const { sellItems, isOnSurface } = useGameStore();

  return (
    <button
      onClick={sellItems}
      disabled={!isOnSurface}
      className={`
        relative w-full group overflow-hidden rounded-lg p-4 transition-all duration-200 border-2
        ${isOnSurface 
          ? 'bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
          : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'}
      `}
    >
      <div className="flex flex-col items-center">
        <span className={`text-xs uppercase tracking-[0.3em] font-bold mb-1 ${isOnSurface ? 'text-yellow-400' : 'text-slate-500'}`}>
          Trade Center
        </span>
        <span className={`text-lg font-black uppercase ${isOnSurface ? 'text-white' : 'text-slate-600'}`}>
          {isOnSurface ? 'SELL ALL ORES' : 'DOCK TO SELL'}
        </span>
      </div>
      
      {/* Decorative Corner lines */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50"></div>
    </button>
  );
}
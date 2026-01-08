'use client'
import React from 'react';
import { useGameStore } from '../game/store';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function StatsMenu() {
  const stats = useGameStore(state => state.stats);

  const minedBlocksList = Object.entries(stats.blocksMined)
    .sort(([, a], [, b]) => b - a); 

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 gap-4">
        
        <div className="bg-slate-900 border border-slate-700 p-4 rounded flex flex-col items-center justify-center shadow-lg">
           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Earnings</div>
           <div className="text-xl text-yellow-500 font-mono font-bold">
             ${stats.totalEarnings.toLocaleString()}
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-4 rounded flex flex-col items-center justify-center shadow-lg">
           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Deepest Point</div>
           <div className="text-xl text-cyan-500 font-mono font-bold">
             {stats.maxDepth}m
           </div>
        </div>

        {/* Death Stats */}
        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded flex flex-col items-center justify-center col-span-2 shadow-inner">
           <div className="text-[10px] text-red-400/70 uppercase tracking-widest font-bold mb-1">Critical Failures (Deaths)</div>
           <div className="text-2xl text-red-500 font-mono font-bold">
             {stats.deathCount}
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-4 rounded flex flex-col items-center justify-center col-span-2">
           <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Matter Extracted</div>
           <div className="text-2xl text-white font-mono font-bold">
             {stats.totalBlocksMined.toLocaleString()} <span className="text-sm text-slate-600">BLOCKS</span>
           </div>
        </div>

      </div>

      <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded p-4 overflow-hidden flex flex-col">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">
          Extraction Log
        </h3>
        
        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-2">
          {minedBlocksList.length === 0 && (
             <div className="text-center text-slate-600 text-xs py-10 italic">No data recorded.</div>
          )}

          {minedBlocksList.map(([id, count]) => {
             const def = BLOCK_Df[id as unknown as BlockId];
             if (!def) return null;
             
             return (
               <div key={id} className="flex items-center justify-between text-xs bg-slate-950/50 p-2 rounded border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: `#${def.color.toString(16).padStart(6, '0')}` }}></div>
                    <span className="uppercase font-bold text-slate-300">{def.name}</span>
                  </div>
                  <span className="font-mono text-white">{count.toLocaleString()}</span>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
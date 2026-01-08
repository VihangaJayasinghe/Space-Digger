'use client'
import React from 'react';
import { useGameStore } from '../game/store';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function Inventory() {
  const { inventory } = useGameStore();

  // Calculate total items
  const totalItems = Object.values(inventory).reduce((acc, count) => acc + count, 0);

  const hasItems = totalItems > 0;

  return (
    <div className="w-64 bg-slate-950/90 border border-slate-700 rounded-lg overflow-hidden flex flex-col shadow-xl backdrop-blur-md">
       
       {/* HEADER with COUNTER */}
       <div className="bg-slate-900 border-b border-slate-700 p-3 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Cargo Hold
          </h2>
          <span className={`font-mono text-xs font-bold ${hasItems ? 'text-cyan-400' : 'text-slate-600'}`}>
            {totalItems} ITEMS
          </span>
       </div>

       {/* LIST */}
       <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
          {!hasItems && (
            <div className="text-[10px] text-slate-600 text-center py-4 italic uppercase tracking-widest">
              Hold Empty
            </div>
          )}

          {Object.entries(inventory).map(([blockId, count]) => {
             const def = BLOCK_Df[blockId as unknown as BlockId];
             if (!def || count <= 0) return null;

             return (
               <div key={blockId} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800/50 hover:border-slate-600 transition-colors group">
                  <div className="flex items-center gap-2">
                     <div 
                       className="w-2 h-2 rounded-full shadow-[0_0_5px]" 
                       style={{ backgroundColor: `#${def.color.toString(16).padStart(6, '0')}`, boxShadow: `0 0 5px #${def.color.toString(16).padStart(6, '0')}` }}
                     />
                     <span className="text-[10px] text-slate-300 font-bold uppercase group-hover:text-white transition-colors">{def.name}</span>
                  </div>
                  <span className="text-xs font-mono text-white">{count}</span>
               </div>
             );
          })}
       </div>

       {/* FOOTER DECORATION */}
       <div className="h-1 w-full bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 opacity-20"></div>
    </div>
  );
}
'use client'
import React from 'react';
import { useGameStore } from '../game/store';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function Inventory() {
  const inventory = useGameStore((state) => state.inventory);
  const itemIds = Object.keys(inventory) as unknown as BlockId[];

  return (
    <div className="flex flex-col gap-2">
      {/* Mini Header */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-black/40 p-1 rounded w-fit backdrop-blur-sm border border-slate-800/50">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
        Cargo Hold
      </div>

      {itemIds.length === 0 ? (
        <div className="text-[10px] text-slate-600 font-mono pl-2 italic">No materials collected.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {itemIds.map((id) => {
            const count = inventory[id];
            const def = BLOCK_Df[id];
            if (!count || !def) return null;

            return (
              <div key={id} className="bg-slate-900/80 border-l-2 border-slate-700 p-2 rounded-r flex items-center justify-between backdrop-blur-sm shadow-sm min-w-[200px]">
                 
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `#${def.color.toString(16).padStart(6, '0')}` }}></div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">{def.name}</span>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <span className="text-xs text-white font-mono">x{count}</span>
                   <span className="text-[9px] text-yellow-600 font-mono min-w-[30px] text-right">
                     ${(def.value || 0) * count}
                   </span>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
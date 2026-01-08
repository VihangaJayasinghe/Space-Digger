import React from 'react';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function HelpLegend() {
  // Only show blocks that have value (Ores)
  const ores = Object.values(BLOCK_Df).filter(b => b.value && b.value > 0);

  return (
    <div className="text-slate-400">
       <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-600">
         Material Database
      </h3>
      
      <div className="grid grid-cols-1 gap-1">
        {ores.map((ore) => (
          <div key={ore.id} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-800/50 last:border-0">
             <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-sm shadow-sm"
                  style={{ backgroundColor: `#${ore.color.toString(16).padStart(6, '0')}` }}
                ></div>
                <span className="uppercase font-medium text-slate-300">{ore.name}</span>
             </div>
             <span className="font-mono text-yellow-600/80">${ore.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
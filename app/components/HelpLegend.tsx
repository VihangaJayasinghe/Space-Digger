'use client'
import React from 'react';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function HelpLegend() {
  const blocks = Object.values(BLOCK_Df);

  const toHexColor = (num: number) => {
    return '#' + num.toString(16).padStart(6, '0');
  };

  return (
    // FIX: Removed 'absolute top-4 right-4' and 'w-48'
    // Added 'w-full' and 'bg-gray-800' to match the other sidebar items
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-white w-full font-mono">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 border-b border-gray-600 pb-1">
        Block Guide
      </h3>
      
      <div className="space-y-2">
        {blocks.map((block) => {
          if (block.id === BlockId.EMPTY) return null;

          return (
            <div key={block.id} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-sm border border-white/20 flex-shrink-0"
                style={{ backgroundColor: toHexColor(block.color) }}
              />
              
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">{block.name}</span>
                <span className="text-[10px] text-gray-400">HP: {block.hardness}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-[10px] text-gray-500 italic text-center">
        Scroll down for more!
      </div>
    </div>
  );
}
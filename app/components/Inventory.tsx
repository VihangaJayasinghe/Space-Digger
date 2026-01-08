'use client'
import React from 'react';
// FIX: Path adjusted to ../game/store
import { useGameStore } from '../game/store';
import { BLOCK_Df } from '../game/constants';
import { BlockId } from '../game/types';

export default function Inventory() {
  const inventory = useGameStore((state) => state.inventory);

  const toHex = (c: number) => '#' + c.toString(16).padStart(6, '0');

  const items = Object.entries(inventory).map(([id, count]) => {
    const blockId = Number(id) as BlockId;
    return {
      ...BLOCK_Df[blockId],
      count: Number(count) // Ensure it is a Number
    };
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
        Cargo Hold
      </h3>

      {items.length === 0 ? (
        <div className="text-gray-600 text-sm italic text-center py-4">
          Inventory Empty
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="relative group bg-gray-900 rounded border border-gray-700 aspect-square flex items-center justify-center"
              title={item.name}
            >
              <div 
                className="w-6 h-6 rounded-sm shadow-sm"
                style={{ backgroundColor: toHex(item.color) }}
              />
              
              <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] px-1 rounded-tl">
                {/* Ensure we render a string or number */}
                {item.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
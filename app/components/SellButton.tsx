'use client'
import React from 'react';
// FIX: Point to ../game/store assuming both folders are inside /app/
import { useGameStore } from '../game/store';

export default function SellButton() {
  // We can select multiple values at once to avoid typing 'state' multiple times
  const { sellItems, money, isOnSurface, inventory } = useGameStore();
  
  const hasItems = Object.keys(inventory).length > 0;

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Credits</span>
        <span className="text-green-400 font-mono text-xl">${money}</span>
      </div>

      <button
        onClick={sellItems}
        disabled={!isOnSurface || !hasItems}
        className={`
          w-full py-3 rounded font-bold uppercase tracking-wide text-sm transition-all
          ${isOnSurface && hasItems
            ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20" 
            : "bg-gray-700 text-gray-500 cursor-not-allowed"}
        `}
      >
        {isOnSurface ? "Sell Cargo" : "Return to Surface"}
      </button>
    </div>
  );
}
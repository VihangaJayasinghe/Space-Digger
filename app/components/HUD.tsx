'use client'
import React from 'react';
import { useGameStore } from '../game/store';

export default function HUD() {
  // Connect to the store
  const { oxygen, maxOxygen } = useGameStore();

  // Calculate percentage for the CSS width
  const pct = Math.max(0, Math.min(100, (oxygen / maxOxygen) * 100));

  // Dynamic Color: Blue -> Red when low
  const barColor = pct < 30 ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-96 bg-gray-900/90 p-3 rounded-xl border border-gray-700 text-white z-50">
      
      {/* Label */}
      <div className="flex justify-between text-xs uppercase font-bold tracking-wider mb-1">
        <span>Oxygen</span>
        <span>{Math.floor(oxygen)} / {maxOxygen}</span>
      </div>

      {/* The Bar Container */}
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        {/* The Filling */}
        <div 
          className={`h-full transition-all duration-200 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Warning Text */}
      {pct < 30 && (
        <p className="text-center text-red-400 text-[10px] mt-1 animate-pulse">
          WARNING: OXYGEN LEVELS CRITICAL
        </p>
      )}
    </div>
  );
}
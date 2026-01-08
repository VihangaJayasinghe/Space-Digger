'use client'
import React from 'react';
import { useGameStore } from '../game/store';

export default function ResetButton() {
  const resetSave = useGameStore((state) => state.resetSave);

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe your Save, Money, and World.")) {
      resetSave();
    }
  };

  return (
    <button 
      onClick={handleReset}
      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 text-[10px] uppercase font-bold py-1 px-2 rounded border border-red-900/50 transition-colors w-full mb-4"
    >
      ⚠️ Reset Level Progress
    </button>
  );
}
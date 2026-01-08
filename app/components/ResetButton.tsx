'use client'
import React from 'react';
import { useGameStore } from '../game/store';

export default function ResetButton() {
  const resetSave = useGameStore((state) => state.resetSave);

  const handleReset = () => {
    if (confirm("WARNING: COMPLETE SYSTEM WIPE.\n\nAre you sure you want to delete all progress?")) {
      resetSave();
    }
  };

  return (
    <button 
      onClick={handleReset}
      className="bg-red-950/30 hover:bg-red-900/80 text-red-600 hover:text-white text-[9px] uppercase font-bold py-1 px-3 rounded border border-red-900/30 hover:border-red-500 transition-colors tracking-widest"
      title="Wipe Save"
    >
      RESET OPS
    </button>
  );
}
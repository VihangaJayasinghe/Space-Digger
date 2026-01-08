'use client'
import React, { useEffect } from 'react';
import { useGameStore, getUpgradeCost, UpgradeType } from '../game/store';

export default function UpgradeShop() {
  const { money, upgrades, buyUpgrade, isOnSurface, user } = useGameStore();

  // This ensures that if the user object changes (login/logout), 
  // the component is forced to re-evaluate the store values.
  useEffect(() => {
    console.log("Workshop synced for user:", user?.id);
  }, [user]);

  const renderUpgrade = (type: UpgradeType, name: string, description: string, icon: string) => {
    // We fall back to 1 to ensure base price ($50) shows for new players
    const level = upgrades[type] || 1; 
    const cost = getUpgradeCost(type, level);
    const canAfford = money >= cost;

    return (
      <div key={type} className="bg-slate-900/50 border border-slate-700/50 rounded p-3 hover:border-cyan-500/50 transition-all group shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">{name}</div>
              <div className="text-[10px] text-cyan-400 font-mono font-bold">LEVEL {level}</div>
            </div>
          </div>
          <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/30 ${canAfford ? 'text-green-400' : 'text-red-500'}`}>
            ${cost.toLocaleString()}
          </div>
        </div>
        
        <p className="text-[10px] text-slate-500 mb-3 leading-tight italic">{description}</p>
        
        <button
          onClick={() => buyUpgrade(type)}
          disabled={!isOnSurface || !canAfford}
          className={`
            w-full text-[10px] uppercase font-black py-2 px-2 rounded tracking-tighter transition-all
            ${isOnSurface && canAfford 
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_4px_10px_rgba(8,145,178,0.3)] active:translate-y-0.5' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
          `}
        >
          {isOnSurface ? (canAfford ? 'INSTALL UPGRADE' : 'INSUFFICIENT FUNDS') : 'DOCK TO UPGRADE'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(6,182,212,1)]"></span>
          Engineering Bay
        </h3>
        <div className="text-[10px] font-mono text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
          CREDITS: ${money.toLocaleString()}
        </div>
      </div>
      
      <div className="space-y-2">
        {renderUpgrade('speed', 'Laser Drill', 'Reduces mining cycle duration.', '⚡')}
        {renderUpgrade('range', 'Range Finder', 'Extends beam effective distance.', '📡')}
        {renderUpgrade('tank', 'O2 Canister', 'Expands total oxygen capacity.', '🫁')}
        {renderUpgrade('lights', 'Floodlights', 'Increases visibility radius.', '💡')}
      </div>
 
 
      <div className="mt-2 p-2 bg-slate-900/30 rounded border border-slate-800/50">
         <div className="text-[8px] text-slate-600 uppercase tracking-widest text-center">
            Nano-Fabricator Status: <span className="text-green-500">Online</span>
         </div>
      </div>
    </div>
  );
}
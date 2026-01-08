'use client'
import React from 'react';
import { useGameStore, getUpgradeCost, UpgradeType } from '../game/store';

export default function UpgradeShop() {
  const { money, upgrades, buyUpgrade, isOnSurface } = useGameStore();

  const renderUpgrade = (type: UpgradeType, name: string, description: string, icon: string) => {
    const level = upgrades[type] || 1; 
    const cost = getUpgradeCost(type, level);
    const canAfford = money >= cost;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded p-3 mb-2 hover:border-cyan-500/50 transition-colors group">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-lg shadow-inner">
              {icon}
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">{name}</div>
              <div className="text-[10px] text-cyan-400 font-mono">LVL {level}</div>
            </div>
          </div>
          <div className={`text-xs font-mono font-bold ${canAfford ? 'text-green-400' : 'text-red-500'}`}>
            ${cost}
          </div>
        </div>
        
        <p className="text-[10px] text-slate-500 mb-3 leading-tight">{description}</p>
        
        <button
          onClick={() => buyUpgrade(type)}
          disabled={!isOnSurface || !canAfford}
          className={`
            w-full text-[10px] uppercase font-bold py-1.5 px-2 rounded tracking-wider transition-all
            ${isOnSurface && canAfford 
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
          `}
        >
          {isOnSurface ? (canAfford ? 'INSTALL UPGRADE' : 'INSUFFICIENT FUNDS') : 'DOCK TO UPGRADE'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
        Workshop
      </h3>
      
      {renderUpgrade('speed', 'Laser Drill', 'Increases mining speed frequency.', '⚡')}
      {renderUpgrade('range', 'Range Finder', 'Extends beam effective distance.', '📡')}
      {renderUpgrade('tank', 'O2 Canister', 'Expands oxygen tank capacity.', '🫁')}
      {renderUpgrade('lights', 'Floodlights', 'Increases visibility radius.', '💡')}
    </div>
  );
}
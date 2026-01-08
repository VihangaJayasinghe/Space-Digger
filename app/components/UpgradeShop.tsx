'use client'
import React from 'react';
import { useGameStore, getUpgradeCost, UpgradeType } from '../game/store';

export default function UpgradeShop() {
  const { money, upgrades, buyUpgrade, isOnSurface } = useGameStore();

  const renderUpgrade = (type: UpgradeType, name: string, description: string) => {
    const level = upgrades[type];
    const cost = getUpgradeCost(type, level);
    const canAfford = money >= cost;

    return (
      <div className="flex flex-col bg-gray-950 p-3 rounded border border-gray-700 mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm text-white">{name} <span className="text-yellow-500 text-xs">Lvl {level}</span></span>
          <span className={`text-xs font-mono ${canAfford ? 'text-green-400' : 'text-red-500'}`}>
            ${cost}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mb-2">{description}</p>
        
        <button
          onClick={() => buyUpgrade(type)}
          disabled={!isOnSurface || !canAfford}
          className={`
            text-xs uppercase font-bold py-1 px-2 rounded transition-colors
            ${isOnSurface && canAfford 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
          `}
        >
          {isOnSurface ? (canAfford ? 'Upgrade' : 'Too Expensive') : 'Dock to Buy'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>🔧 Workshop</span>
      </h3>
      
      {renderUpgrade('speed', 'Laser Drill', 'Mines blocks faster.')}
      {renderUpgrade('range', 'Range Finder', 'Increases mining distance.')}
      {/* NEW UPGRADE ADDED HERE */}
      {renderUpgrade('tank', 'O2 Tank', 'Increases oxygen capacity.')}
    </div>
  );
}
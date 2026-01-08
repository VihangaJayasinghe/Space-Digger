'use client'
import dynamic from 'next/dynamic';
import Inventory from './components/Inventory';
import HelpLegend from './components/HelpLegend';
import HUD from './components/HUD';
import SellButton from './components/SellButton'; // <--- 1. IMPORT IT
import UpgradeShop from './components/UpgradeShop';
const Game = dynamic(() => import('./components/Game'), { 
  ssr: false, 
  loading: () => <div className="text-white">Loading...</div>
});

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden">
      
      {/* LEFT: Game Area */}
      <div className="flex-grow relative flex items-center justify-center bg-gray-950">
        <Game />
        <HUD />
      </div>

      {/* RIGHT: Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto z-20">
        
        {/* Title */}
        <div className="border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SPACE<span className="text-blue-500">DIGGER</span>
          </h1>
          <p className="text-gray-500 text-xs">Sector 7G - Depth: Surface</p>
        </div>

        {/* --- ADDED SELL BUTTON HERE --- */}
        <SellButton /> 
        
        {/* Upgrade Shop */}
        <UpgradeShop />
        {/* Inventory Grid */}
        <Inventory />
        
        {/* Legend */}
        <div className="mt-auto">
          <HelpLegend />
        </div>

        {/* Controls */}
        <div className="text-[10px] text-gray-600 text-center mt-4">
          <p>ARROWS to Move • CLICK to Mine</p>
        </div>
      </aside>

    </main>
  );
}
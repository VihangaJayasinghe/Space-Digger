'use client'
import React from 'react';
import Auth from './Auth';

interface MenuProps {
  onStart: () => void;
}

export default function MainMenu({ onStart }: MenuProps) {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6">
       
       {/* BACKGROUND GRID EFFECT */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
       </div>

       {/* LOGO AREA */}
       <div className="relative mb-12 text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            SPACE<span className="text-cyan-500">DIGGER</span>
          </h1>
          <div className="text-yellow-500 font-mono tracking-[0.5em] uppercase text-sm mt-2">
             Planetary Mining Simulator
          </div>
       </div>

       {/* AUTH / START PANEL */}
       <div className="relative bg-slate-900/80 backdrop-blur-xl border-2 border-slate-700 p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            System Access
          </div>
          
          <Auth onStartGame={onStart} />
       </div>

       {/* FOOTER */}
       <div className="absolute bottom-6 text-center">
         <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
           v2.5.0 // Connection Secure
         </p>
       </div>

    </div>
  );
}
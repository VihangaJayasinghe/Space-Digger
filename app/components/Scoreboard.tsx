'use client'
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../game/store';

export default function Scoreboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const { user } = useGameStore();

  useEffect(() => {
    async function fetchLeaders() {
      const { data } = await supabase
        .from('profiles')
        .select('username, max_depth, total_earnings')
        .order('max_depth', { ascending: false })
        .limit(10);
        
      if (data) setLeaders(data);
    }
    fetchLeaders();
    
    const interval = setInterval(fetchLeaders, 15000); 
    return () => clearInterval(interval);
  }, []);

  // Helper to format username
  const formatName = (name: string) => name?.replace('@spacedigger.local', '') || 'Unknown';
  
  // Helper to check if row belongs to logged-in user
  const isMe = (rowName: string) => {
      if (!user?.email) return false;
      return user.email.startsWith(formatName(rowName).toLowerCase());
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 h-full flex flex-col shadow-2xl relative overflow-hidden">
       
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] pointer-events-none"></div>

       <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2 relative z-10">
          <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-widest">
            Galactic Leaderboard
          </h3>
          <span className="text-[9px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">TOP 10</span>
       </div>

       <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar relative z-10 flex-1">
         {leaders.length === 0 && (
             <div className="flex flex-col items-center justify-center h-32 text-slate-600 gap-2">
                 <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[10px] uppercase tracking-widest">Scanning Network...</span>
             </div>
         )}

         {leaders.map((player, idx) => {
           const highlighted = isMe(player.username);
           
           return (
             <div 
                key={idx} 
                className={`
                    flex justify-between items-center p-2 rounded-md border transition-all
                    ${highlighted 
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] translate-x-1' 
                        : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'
                    }
                `}
             >
                <div className="flex items-center gap-3">
                   {/* Rank Badge */}
                   <div className={`
                       w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold font-mono
                       ${idx === 0 ? 'bg-yellow-500 text-black' : 
                         idx === 1 ? 'bg-slate-400 text-black' : 
                         idx === 2 ? 'bg-orange-700 text-white' : 
                         'bg-slate-800 text-slate-500'}
                   `}>
                       {idx + 1}
                   </div>

                   <div className="flex flex-col">
                       <span className={`text-xs font-bold truncate max-w-[90px] ${highlighted ? 'text-cyan-400' : 'text-slate-300'}`}>
                           {formatName(player.username)}
                           {highlighted && <span className="ml-1 text-[8px] bg-cyan-500 text-black px-1 rounded-sm font-black">YOU</span>}
                       </span>
                   </div>
                </div>

                <div className="text-right">
                   <div className="text-cyan-400 font-mono text-xs font-bold">{player.max_depth}m</div>
                   <div className="text-[9px] text-yellow-600/80 font-mono">${player.total_earnings?.toLocaleString()}</div>
                </div>
             </div>
           );
         })}
       </div>

       <div className="mt-2 text-[9px] text-slate-600 text-center uppercase tracking-widest">
          Updates Live // Global Network
       </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../game/store';

interface AuthProps {
  onStartGame?: () => void;
}

export default function Auth({ onStartGame }: AuthProps) {
  const { setUser, loadFromCloud, saveToCloud, user } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(''); // Changed from email
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Check if session exists on load
  useEffect(() => {
    const checkSession = async () => {
       const { data } = await supabase.auth.getSession();
       if (data.session?.user) {
         setUser(data.session.user);
       }
    };
    checkSession();
  }, [setUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // 1. CREATE A FAKE EMAIL for system security
    // If user types "SuperMiner", we verify "superminer@spacedigger.local"
    const cleanUsername = username.trim().toLowerCase().replace(/\s/g, '');
    const fakeEmail = `${cleanUsername}@spacedigger.local`;

    if (cleanUsername.length < 3) {
        setMessage("Username too short.");
        setLoading(false);
        return;
    }

    // 2. Try Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
        email: fakeEmail, 
        password 
    });
    
    if (loginError) {
      // 3. If Login fails, Try Signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
        email: fakeEmail, 
        password 
      });
      
      if (signUpError) {
        setMessage('Error: ' + signUpError.message);
        setLoading(false);
        return;
      }
      
      if (signUpData.user) {
         setUser(signUpData.user);
         await ensureProfileExists(signUpData.user, cleanUsername);
         setMessage('Pilot Registered!');
         await handleSuccess();
      }
    } else {
      // Login Success
      if (loginData.user) {
        setUser(loginData.user);
        await ensureProfileExists(loginData.user, cleanUsername);
        await handleSuccess();
      }
    }
    setLoading(false);
  };

  // Helper: Creates the database row if it's missing
  const ensureProfileExists = async (currentUser: any, name: string) => {
    const { data } = await supabase.from('profiles').select('id').eq('id', currentUser.id).single();
    
    if (!data) {
      console.log("Creating new pilot profile...");
      const { error } = await supabase.from('profiles').insert([{ 
        id: currentUser.id, 
        username: name 
      }]);
      if (error) console.error("Profile Error:", error.message);
    }
  };

  const handleSuccess = async () => {
    setMessage('Initializing Systems...');
    await loadFromCloud(); 
    
    // If we have local data but cloud is empty, force a save
    if (localStorage.getItem('spacedigger-world')) {
       await saveToCloud();
    }

    if (onStartGame) onStartGame();
  };

  // If already logged in
  if (user) {
    // We try to get the raw username from the email for display
    const displayUser = user.email ? user.email.split('@')[0] : 'Pilot';

    return (
      <div className="flex flex-col gap-4 items-center">
         <div className="text-cyan-400 font-mono text-sm uppercase tracking-widest">
           PILOT: {displayUser}
         </div>
         
         <button 
           onClick={() => handleSuccess()}
           className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded uppercase tracking-widest shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all"
         >
           LAUNCH MISSION
         </button>
         
         <button 
           onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
           className="text-xs text-red-500 underline hover:text-red-400"
         >
           LOGOUT
         </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Pilot Callsign (Username)</label>
          <input 
            type="text" 
            placeholder="Ex: StarLord"
            required
            minLength={3}
            className="bg-slate-900 border border-slate-700 text-white px-4 py-3 font-mono rounded focus:border-cyan-500 outline-none transition-colors"
            value={username} onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Security Pin (Password)</label>
          <input 
            type="password" 
            placeholder="••••••••"
            required
            minLength={6}
            className="bg-slate-900 border border-slate-700 text-white px-4 py-3 font-mono rounded focus:border-cyan-500 outline-none transition-colors"
            value={password} onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading} 
          className="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold py-3 rounded uppercase tracking-widest transition-all"
        >
          {loading ? 'CONNECTING...' : 'LOGIN / NEW GAME'}
        </button>

        {message && <div className="text-cyan-400 text-xs text-center font-mono animate-pulse">{message}</div>}
      </form>
    </div>
  );
}
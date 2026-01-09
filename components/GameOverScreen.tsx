import React, { useState, useEffect } from 'react';
import { GameStats, HighScore, Theme, ThemeConfig } from '../types';
import { soundService } from '../services/soundService';

interface GameOverScreenProps {
  stats: GameStats;
  theme: Theme;
  themeConfig: ThemeConfig;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, theme, themeConfig, onRestart, onMenu }) => {
  const [initials, setInitials] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Play sound when this screen mounts
    soundService.playGameOver(theme);
  }, []);

  const handleSaveScore = () => {
    if (!initials.trim()) return;

    const newScore: HighScore = {
        name: initials.toUpperCase().substring(0, 3),
        score: stats.score,
        difficulty: 'mixed', // Simplified
        mode: 'mixed',
        date: new Date().toISOString()
    };

    const storageKey = `TURBO_TYPER_SCORES_${theme.toUpperCase()}`;
    const existingScoresStr = localStorage.getItem(storageKey);
    let scores: HighScore[] = existingScoresStr ? JSON.parse(existingScoresStr) : [];
    
    scores.push(newScore);
    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);
    // Keep top 20
    scores = scores.slice(0, 20);

    localStorage.setItem(storageKey, JSON.stringify(scores));
    setSaved(true);
    soundService.playLevelUp(theme); // Success sound for save
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full z-20 relative px-4 ${themeConfig.font}`}>
      <div className={`bg-slate-900/90 backdrop-blur-xl p-10 rounded-3xl border-4 shadow-[0_0_60px_rgba(0,0,0,0.4)] text-center max-w-lg w-full transform animate-in fade-in zoom-in duration-300 ${themeConfig.secondaryColor}`}>
        
        <h2 className="text-5xl font-black text-red-500 mb-2 uppercase tracking-wider">Koniec Gry!</h2>
        <p className="text-slate-300 text-xl mb-8">
            {theme === 'space' && "Asteroidy przedarły się przez osłony!"}
            {theme === 'animals' && "Równowaga ekosystemu została zachwiana!"}
            {theme === 'percy' && "Potwory zdobyły Obóz Herosów!"}
            {theme === 'potter' && "Dementorzy przejęli Hogwart!"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/40 p-4 rounded-xl border border-white/10">
            <p className="text-sm text-slate-400 uppercase">Twój Wynik</p>
            <p className={`text-3xl font-bold ${themeConfig.accentColor}`}>{stats.score}</p>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/10">
            <p className="text-sm text-slate-400 uppercase">Poziom</p>
            <p className={`text-3xl font-bold ${themeConfig.primaryColor}`}>{stats.level}</p>
          </div>
        </div>

        {/* High Score Input */}
        {!saved ? (
             <div className="mb-8 bg-black/40 p-4 rounded-xl border border-dashed border-slate-600">
                <label className="block text-sm text-slate-400 mb-2 uppercase tracking-widest">Wpisz Inicjały (max 3)</label>
                <div className="flex gap-2 justify-center">
                    <input 
                        type="text" 
                        maxLength={3}
                        value={initials}
                        onChange={(e) => setInitials(e.target.value.toUpperCase())}
                        className={`bg-slate-800 text-white text-3xl font-mono text-center w-32 py-2 rounded-lg border-2 focus:outline-none placeholder-slate-600 ${themeConfig.secondaryColor} focus:border-white`}
                        placeholder="ABC"
                    />
                    <button 
                        onClick={handleSaveScore}
                        disabled={initials.length === 0}
                        className={`${themeConfig.buttonClass} disabled:bg-slate-700 text-white font-bold px-4 rounded-lg transition-colors`}
                    >
                        Zapisz
                    </button>
                </div>
            </div>
        ) : (
            <div className={`mb-8 p-4 font-bold border bg-green-900/20 rounded-xl animate-pulse text-green-400 border-green-500/30`}>
                Wynik Zapisany!
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Zagraj Ponownie 🔄
          </button>
          <button
            onClick={onMenu}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Menu Główne 🏠
          </button>
        </div>
      </div>
    </div>
  );
};
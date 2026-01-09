import React, { useState, useEffect } from 'react';
import { Difficulty, GameMode, HighScore, Theme, ThemeConfig } from '../types';
import { soundService } from '../services/soundService';

interface StartScreenProps {
  onStart: (difficulty: Difficulty, mode: GameMode, accuracy: boolean) => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themeConfig: ThemeConfig;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, currentTheme, setTheme, themeConfig }) => {
  const [mode, setMode] = useState<GameMode>('words');
  const [accuracyMode, setAccuracyMode] = useState<boolean>(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Load scores whenever theme or showHighScores changes
  useEffect(() => {
    if (showHighScores) {
        const stored = localStorage.getItem(`TURBO_TYPER_SCORES_${currentTheme.toUpperCase()}`);
        if (stored) {
            setHighScores(JSON.parse(stored));
        } else {
            setHighScores([]);
        }
    }
  }, [showHighScores, currentTheme]);

  // Theme selection handler
  const themes: { id: Theme; label: string; color: string }[] = [
    { id: 'space', label: 'Kosmos', color: 'bg-indigo-600' },
    { id: 'animals', label: 'Zwierzęta', color: 'bg-green-600' },
    { id: 'percy', label: 'Percy Jackson', color: 'bg-orange-700' },
    { id: 'potter', label: 'Harry Potter', color: 'bg-purple-800' }
  ];

  const handleThemeChange = (id: Theme) => {
      soundService.playClick(id); // Play specific theme sound
      setTheme(id);
  };

  const handleModeChange = (m: GameMode) => {
      soundService.playUIClick();
      setMode(m);
  };

  const handleAccuracyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      soundService.playUIClick();
      setAccuracyMode(e.target.checked);
  }

  const handleStart = (d: Difficulty) => {
      soundService.playLevelUp(currentTheme); // Epic start sound
      onStart(d, mode, accuracyMode);
  };

  const difficultyLevels: { id: Difficulty; label: string; desc: string }[] = [
    { id: 'recruit', label: 'Szeregowy', desc: 'Bardzo wolno' },
    { id: 'corporal', label: 'Kapral', desc: 'Wolno' },
    { id: 'sergeant', label: 'Sierżant', desc: 'Normalnie' },
    { id: 'lieutenant', label: 'Porucznik', desc: 'Szybko' },
    { id: 'general', label: 'Generał', desc: 'Ekstremalnie' }
  ];

  // Render Rank Icons
  const renderRankIcon = (id: Difficulty) => {
      const barClass = "w-1 h-3 bg-white/80 rounded-sm shadow-sm";
      switch(id) {
          case 'recruit': 
            return <div className="flex gap-1 justify-center mb-1"><div className={barClass}></div></div>;
          case 'corporal': 
            return <div className="flex gap-1 justify-center mb-1"><div className={barClass}></div><div className={barClass}></div></div>;
          case 'sergeant': 
            return <div className="flex gap-1 justify-center mb-1"><div className={barClass}></div><div className={barClass}></div><div className={barClass}></div></div>;
          case 'lieutenant': 
            return <div className="flex justify-center mb-1 text-yellow-300 drop-shadow-md text-sm">★</div>;
          case 'general': 
            return <div className="flex justify-center mb-1 text-yellow-300 drop-shadow-md text-xs gap-0.5"><span>★</span><span>★</span><span>★</span></div>;
      }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full z-10 relative text-center px-4 overflow-y-auto py-10 ${themeConfig.font}`}>
      <div className="animate-bounce mb-2 shrink-0">
        <h1 className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${themeConfig.titleGradient} drop-shadow-lg p-2`}>
          Turbo Typer
        </h1>
      </div>

      {/* Theme Selector */}
      <div className="mb-6 flex flex-wrap justify-center gap-3 relative z-20">
         {themes.map((t) => (
             <button
                key={t.id}
                onMouseEnter={() => soundService.playUIHover()}
                onClick={() => handleThemeChange(t.id)}
                className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg border-2
                    ${currentTheme === t.id 
                        ? `${t.color} border-white text-white scale-110 ring-2 ring-white/50` 
                        : 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700'
                    }`}
             >
                 {t.label}
             </button>
         ))}
      </div>

      <h2 className={`text-xl md:text-2xl mt-0 mb-6 font-semibold ${themeConfig.primaryColor}`}>
          {themeConfig.name}
      </h2>

      <div className={`backdrop-blur-md p-6 rounded-3xl border-4 shadow-2xl max-w-4xl w-full flex flex-col gap-6 transition-colors duration-500
            ${currentTheme === 'space' ? 'bg-slate-800/80 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : ''}
            ${currentTheme === 'animals' ? 'bg-green-900/60 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : ''}
            ${currentTheme === 'percy' ? 'bg-stone-900/80 border-orange-700 shadow-[0_0_50px_rgba(194,65,12,0.4)]' : ''}
            ${currentTheme === 'potter' ? 'bg-purple-900/60 border-fuchsia-600 shadow-[0_0_50px_rgba(192,38,211,0.4)]' : ''}
      `}>
        
        {/* Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Game Mode Selection */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
            <h3 className={`font-bold mb-3 uppercase text-sm tracking-wider ${themeConfig.primaryColor}`}>1. Wybierz Tryb</h3>
            <div className="flex flex-col gap-2">
              <button
                onMouseEnter={() => soundService.playUIHover()}
                onClick={() => handleModeChange('words')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${mode === 'words' ? `${themeConfig.buttonClass} text-white shadow-lg scale-105` : 'bg-black/30 text-slate-400 hover:bg-black/50'}`}
              >
                Pojedyncze Słowa
              </button>
              <button
                onMouseEnter={() => soundService.playUIHover()}
                onClick={() => handleModeChange('pairs')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${mode === 'pairs' ? `${themeConfig.buttonClass} text-white shadow-lg scale-105` : 'bg-black/30 text-slate-400 hover:bg-black/50'}`}
              >
                Pary Wyrazów
              </button>
              <button
                onMouseEnter={() => soundService.playUIHover()}
                onClick={() => handleModeChange('sentences')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${mode === 'sentences' ? `${themeConfig.buttonClass} text-white shadow-lg scale-105` : 'bg-black/30 text-slate-400 hover:bg-black/50'}`}
              >
                Całe Zdania
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
             <div>
                <h3 className={`font-bold mb-3 uppercase text-sm tracking-wider ${themeConfig.primaryColor}`}>2. Opcje</h3>
                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-black/30 transition-colors" onMouseEnter={() => soundService.playUIHover()}>
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${accuracyMode ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                    {accuracyMode && <span className="text-white text-sm">✓</span>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={accuracyMode}
                    onChange={handleAccuracyChange}
                  />
                  <div className="text-left">
                    <span className="block text-white font-semibold">Tryb Dokładności</span>
                    <span className="block text-xs text-slate-400">Literówki trzeba kasować</span>
                  </div>
                </label>
            </div>
            
            <button 
                onMouseEnter={() => soundService.playUIHover()}
                onClick={() => { soundService.playUIClick(); setShowHighScores(true); }}
                className={`mt-4 w-full py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${themeConfig.accentColor}`}
            >
                🏆 Tabela Wyników
            </button>
          </div>
        </div>

        {/* Difficulty (Start) Section */}
        <div className="border-t border-white/10 pt-4">
            <h3 className="text-white font-bold mb-4 uppercase text-center text-lg">3. Wybierz Rangę (Start)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {difficultyLevels.map((lvl) => (
                   <button
                   key={lvl.id}
                   onMouseEnter={() => soundService.playUIHover()}
                   onClick={() => handleStart(lvl.id)}
                   className={`group relative px-2 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg overflow-hidden flex flex-col items-center justify-center gap-0.5
                      ${themeConfig.buttonClass} text-white border border-white/10 hover:brightness-110 active:scale-95
                   `}
                 >
                   {/* Rank Icon */}
                   <div className="mb-1 transform group-hover:scale-110 transition-transform">
                      {renderRankIcon(lvl.id)}
                   </div>
                   
                   <span className="text-sm md:text-base font-bold relative z-10 leading-tight">{lvl.label}</span>
                   <span className="text-[10px] uppercase opacity-70 relative z-10">{lvl.desc}</span>
                   
                   {/* Hover Shine Effect */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </button>
              ))}
            </div>
        </div>
      </div>

      {/* High Scores Modal */}
      {showHighScores && (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
            onClick={() => { soundService.playUIClick(); setShowHighScores(false); }}
        >
            <div 
                className={`bg-slate-900 border-4 w-full max-w-2xl rounded-sm p-2 cursor-default ${themeConfig.secondaryColor}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`border-2 p-6 rounded-sm relative overflow-hidden bg-black/40 ${themeConfig.secondaryColor} border-dashed`}>
                    
                    <div className={`flex justify-between items-center mb-6 border-b-2 border-dashed pb-4 ${themeConfig.secondaryColor}`}>
                         <h2 className={`text-3xl font-bold tracking-wider uppercase ${themeConfig.accentColor}`}>High Scores</h2>
                         <button 
                            onMouseEnter={() => soundService.playUIHover()}
                            onClick={() => { soundService.playUIClick(); setShowHighScores(false); }}
                            className="text-red-500 hover:text-red-400 font-bold uppercase"
                        >
                            [X] Zamknij
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-[60vh] text-sm md:text-base">
                        <table className="w-full text-left">
                            <thead className={`${themeConfig.primaryColor} border-b border-white/20`}>
                                <tr>
                                    <th className="py-2">#</th>
                                    <th className="py-2">Gracz</th>
                                    <th className="py-2 text-right">Wynik</th>
                                    <th className="py-2 text-right hidden md:table-cell">Tryb</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highScores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                                            Brak wyników w tej kategorii ({currentTheme}).
                                        </td>
                                    </tr>
                                ) : (
                                    highScores.map((score, index) => (
                                        <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                            <td className="py-3 text-slate-500">{index + 1}.</td>
                                            <td className={`py-3 font-bold ${themeConfig.primaryColor}`}>{score.name}</td>
                                            <td className="py-3 text-right text-white">{score.score}</td>
                                            <td className="py-3 text-right text-slate-400 text-xs uppercase hidden md:table-cell">
                                                {score.mode} / {score.difficulty}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameEngine } from './components/GameEngine';
import { GameOverScreen } from './components/GameOverScreen';
import { Difficulty, GameMode, GameState, GameStats, Theme, ThemeConfig } from './types';
import { soundService } from './services/soundService';

// Theme Configurations
const THEMES: Record<Theme, ThemeConfig> = {
  space: {
    id: 'space',
    name: 'Kosmiczna Przygoda',
    font: 'font-sans', // Default Fredoka
    bgClass: 'star-bg',
    primaryColor: 'text-cyan-400',
    secondaryColor: 'border-indigo-500',
    accentColor: 'text-yellow-400',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500',
    particleColors: ['#F472B6', '#34D399', '#60A5FA', '#A78BFA', '#FBBF24'],
    wordColors: ['#F472B6', '#34D399', '#60A5FA', '#A78BFA', '#FBBF24'],
    titleGradient: 'from-blue-400 via-indigo-500 to-purple-600',
    promptContext: 'Kosmos'
  },
  animals: {
    id: 'animals',
    name: 'W Świecie Zwierząt',
    font: 'font-sans',
    bgClass: 'nature-bg',
    primaryColor: 'text-lime-400',
    secondaryColor: 'border-green-600',
    accentColor: 'text-green-300',
    buttonClass: 'bg-green-700 hover:bg-green-600',
    particleColors: ['#4ade80', '#a3e635', '#facc15', '#166534', '#84cc16'],
    wordColors: ['#86efac', '#bef264', '#fde047', '#4ade80', '#fbbf24'],
    titleGradient: 'from-green-400 via-emerald-500 to-teal-600',
    promptContext: 'Przyroda'
  },
  percy: {
    id: 'percy',
    name: 'Percy Jackson',
    font: 'font-[Cinzel]',
    bgClass: 'greek-bg',
    primaryColor: 'text-amber-500',
    secondaryColor: 'border-orange-800',
    accentColor: 'text-orange-400',
    buttonClass: 'bg-orange-800 hover:bg-orange-700',
    particleColors: ['#f59e0b', '#d97706', '#92400e', '#78350f', '#fbbf24'],
    wordColors: ['#fbbf24', '#f59e0b', '#d97706', '#a8a29e', '#ea580c'],
    titleGradient: 'from-amber-300 via-orange-500 to-red-700',
    promptContext: 'Mitologia'
  },
  potter: {
    id: 'potter',
    name: 'Harry Potter',
    font: 'font-[Henny_Penny]',
    bgClass: 'magic-bg',
    primaryColor: 'text-purple-300',
    secondaryColor: 'border-fuchsia-800',
    accentColor: 'text-yellow-400',
    buttonClass: 'bg-fuchsia-900 hover:bg-fuchsia-800',
    particleColors: ['#d8b4fe', '#f0abfc', '#fbbf24', '#818cf8', '#c084fc'],
    wordColors: ['#e879f9', '#c084fc', '#facc15', '#a78bfa', '#60a5fa'],
    titleGradient: 'from-purple-400 via-fuchsia-600 to-yellow-500',
    promptContext: 'Magia'
  }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('recruit');
  const [mode, setMode] = useState<GameMode>('words');
  const [accuracyMode, setAccuracyMode] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('space');
  const [lastStats, setLastStats] = useState<GameStats>({ score: 0, level: 1, lives: 0, wpm: 0, streak: 0 });
  const [isMuted, setIsMuted] = useState(false);

  const activeConfig = THEMES[currentTheme];

  // Try to init audio on first click anywhere if needed, but specifically on Start
  const handleInteraction = () => {
    soundService.init();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger other clicks
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const startGame = (diff: Difficulty, gameMode: GameMode, accMode: boolean) => {
    soundService.init(); // Ensure audio context is ready
    setDifficulty(diff);
    setMode(gameMode);
    setAccuracyMode(accMode);
    setGameState('playing');
  };

  const handleGameOver = (stats: GameStats) => {
    setLastStats(stats);
    setGameState('gameover');
  };

  const goToMenu = () => {
    setGameState('menu');
  };

  const restartGame = () => {
    setGameState('playing');
  };

  return (
    <div 
        onClick={handleInteraction}
        className={`w-full h-screen overflow-hidden select-none relative transition-all duration-700 ${activeConfig.bgClass} ${activeConfig.font}`}
    >
        {/* Dynamic Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />

        {/* Mute Button (Global) */}
        <button 
            onClick={toggleMute}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full border border-white/30 text-white transition-all hover:scale-110"
            title={isMuted ? "Włącz Dźwięk" : "Wycisz"}
        >
            {isMuted ? '🔇' : '🔊'}
        </button>

      {gameState === 'menu' && (
        <StartScreen 
          onStart={startGame} 
          currentTheme={currentTheme}
          setTheme={setCurrentTheme}
          themeConfig={activeConfig}
        />
      )}

      {gameState === 'playing' && (
        <GameEngine 
            difficulty={difficulty} 
            mode={mode}
            theme={currentTheme}
            themeConfig={activeConfig}
            accuracyMode={accuracyMode}
            onGameOver={handleGameOver} 
            onExit={goToMenu}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverScreen 
            stats={lastStats} 
            theme={currentTheme}
            themeConfig={activeConfig}
            onRestart={restartGame} 
            onMenu={goToMenu} 
        />
      )}
    </div>
  );
};

export default App;
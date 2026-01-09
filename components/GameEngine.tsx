

import React, { useEffect, useRef, useState } from 'react';
import { Difficulty, GameMode, GameStats, WordObject, Particle, FloatingText, Theme, ThemeConfig, SpecialType } from '../types';
import { fetchWords } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface GameEngineProps {
  difficulty: Difficulty;
  mode: GameMode;
  theme: Theme;
  themeConfig: ThemeConfig;
  accuracyMode: boolean;
  onGameOver: (stats: GameStats) => void;
  onExit: () => void;
}

interface ActiveEffects {
  shield: number; // Time remaining in seconds
  multiplier: number;
  freeze: number;
}

export const GameEngine: React.FC<GameEngineProps> = ({ difficulty, mode, theme, themeConfig, accuracyMode, onGameOver, onExit }) => {
  // --- Refs for game loop state (mutable) ---
  const wordsRef = useRef<WordObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const inputBufferRef = useRef<string>("");
  const scoreRef = useRef<number>(0);
  const levelRef = useRef<number>(1);
  const livesRef = useRef<number>(3);
  const activeWordQueueRef = useRef<string[]>([]); 
  const nextLevelThresholdRef = useRef<number>(1000); 
  
  // Power-up State Refs
  const activeEffectsRef = useRef<ActiveEffects>({ shield: 0, multiplier: 0, freeze: 0 });

  // Bonus Word Logic
  const lastHeartLevelRef = useRef<number>(0);
  
  // Backspace Logic
  const backspaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Speed Ramping
  const gameTimeRef = useRef<number>(0);
  const lastSpeedUpRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1.0);

  // --- React State for UI ---
  const [stats, setStats] = useState<GameStats>({ score: 0, level: 1, lives: 3, wpm: 0, streak: 0 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [currentInput, setCurrentInput] = useState("");
  const [isError, setIsError] = useState(false); 
  const [speedUpNotification, setSpeedUpNotification] = useState<boolean>(false);
  const [shakeScreen, setShakeScreen] = useState<boolean>(false);
  // State for rendering active effects timers
  const [uiEffects, setUiEffects] = useState<ActiveEffects>({ shield: 0, multiplier: 0, freeze: 0 });
  
  // Visibility Logic
  const [isObscuring, setIsObscuring] = useState(false);
  const isObscuringRef = useRef(false);

  // --- Constants based on difficulty & mode ---
  const getSpawnRate = () => {
    let base = 2500;
    
    // 5-Tier Difficulty Logic
    switch(difficulty) {
        case 'recruit': base = 4000; break; // Very slow spawn
        case 'corporal': base = 3000; break;
        case 'sergeant': base = 2500; break;
        case 'lieutenant': base = 2000; break;
        case 'general': base = 1500; break;
    }
    
    // Adjust for mode length
    if (mode === 'pairs') base *= 1.8;
    if (mode === 'sentences') base *= 3.5;

    // Apply speed multiplier to spawn rate (spawn faster as game speeds up)
    // Cap minimum spawn rate to keep game playable
    const minRate = mode === 'sentences' ? 2500 : 800;
    const rate = Math.max(minRate, base - (levelRef.current * 100));
    return rate / speedMultiplierRef.current;
  };
  
  const getSpeed = () => {
    // 5-Tier Speed Logic (Base speeds)
    let base = 3.0;

    switch(difficulty) {
        case 'recruit': base = 1.5; break; // Very slow fall
        case 'corporal': base = 2.2; break;
        case 'sergeant': base = 3.0; break;
        case 'lieutenant': base = 4.8; break;
        case 'general': base = 7.2; break;
    }

    // Adjust for mode
    if (mode === 'pairs') base *= 0.8;
    if (mode === 'sentences') base *= 0.5;

    // Base speed + level increase + GLOBAL TIME MULTIPLIER
    return (base + (levelRef.current * 0.4)) * speedMultiplierRef.current;
  };

  // Trigger visual shake
  const triggerShake = () => {
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
  };

  // --- Initialization ---
  useEffect(() => {
    // Fill queue synchronously from static data
    activeWordQueueRef.current = fetchWords(difficulty, mode, theme, 100); 
    
    lastTimeRef.current = performance.now();
    
    // Calculate initial level threshold based on difficulty potential
    let baseMult = 1;
    if (difficulty === 'sergeant') baseMult = 1.5;
    if (difficulty === 'lieutenant') baseMult = 2;
    if (difficulty === 'general') baseMult = 5;
    
    if (mode === 'pairs') baseMult *= 2;
    if (mode === 'sentences') baseMult *= 5;
    if (accuracyMode) baseMult *= 2;
    
    nextLevelThresholdRef.current = 500 * baseMult;

    // Start Ambient Music
    soundService.startAmbientMusic(theme);

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      // Stop Ambient Music on exit
      soundService.stopAmbientMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, mode, theme]);

  // --- Helpers ---
  const spawnWord = () => {
    // Refill queue if low
    if (activeWordQueueRef.current.length < 5) {
        const moreWords = fetchWords(difficulty, mode, theme, 50);
        activeWordQueueRef.current = [...activeWordQueueRef.current, ...moreWords];
    }

    if (activeWordQueueRef.current.length === 0) return;

    const text = activeWordQueueRef.current.shift()!;
    const id = Math.random().toString(36).substr(2, 9);
    const padding = mode === 'sentences' ? 20 : 10;
    const x = padding + Math.random() * (100 - (padding * 2)); 
    
    // Pick color from theme config
    const color = themeConfig.wordColors[Math.floor(Math.random() * themeConfig.wordColors.length)];

    let specialType: SpecialType | undefined = undefined;

    // Priority 1: Heart (Once per level)
    // 20% chance to spawn if we haven't spawned one this level yet
    if (levelRef.current > lastHeartLevelRef.current && Math.random() < 0.2) {
      specialType = 'heart';
      lastHeartLevelRef.current = levelRef.current;
    } 
    // Priority 2: Random Specials (if not a heart)
    else {
      const rand = Math.random() * 100; // 0 - 99.99
      if (rand < 1) specialType = 'shield';      // 1%
      else if (rand < 3) specialType = 'freeze'; // 2% (1+2=3)
      else if (rand < 6) specialType = 'multiplier'; // 3% (3+3=6)
      else if (rand < 11) specialType = 'bomb';  // 5% (6+5=11)
      // else remaining 89% is normal
    }

    wordsRef.current.push({
      id,
      text,
      x,
      y: -15, // Start further up
      speed: getSpeed(),
      color,
      specialType
    });
  };

  const createExplosion = (x: number, y: number, color: string, scale: number = 1) => {
    const count = Math.floor(15 * scale);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 50 * scale,
        vy: (Math.random() - 0.5) * 50 * scale,
        life: 1.0,
        color
      });
    }
  };

  const createFloatingText = (x: number, y: number, text: string, color?: string, scale: number = 1.0) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      life: 1.0,
      color: color || (themeConfig.accentColor.includes('amber') ? '#fbbf24' : '#fff')
    });
  };

  // --- Scoring Logic ---
  const calculateScoreForWord = (word: WordObject) => {
    // 1. Base Score (Letters)
    let base = 0;
    const plChars = "ąćęłńóśźż";
    for (const char of word.text.toLowerCase()) {
         if (plChars.includes(char)) base += 2;
         else if (char !== ' ') base += 1;
    }

    // 2. Zone Multiplier
    let zoneMult = 1;
    if (word.y < 35) zoneMult = 3;
    else if (word.y < 70) zoneMult = 2;

    // 3. Difficulty Multiplier
    let diffMult = 1;
    if (difficulty === 'recruit') diffMult = 0.5;
    if (difficulty === 'corporal') diffMult = 0.8;
    if (difficulty === 'sergeant') diffMult = 1; 
    if (difficulty === 'lieutenant') diffMult = 2; 
    if (difficulty === 'general') diffMult = 5;

    // 4. Mode Multiplier
    let modeMult = 1;
    if (mode === 'pairs') modeMult = 2;
    if (mode === 'sentences') modeMult = 5;

    // 5. Accuracy Multiplier
    const accMult = accuracyMode ? 2 : 1;

    // 6. Speed Bonus
    const speedBonus = Math.ceil(speedMultiplierRef.current * 0.5);

    // 7. Active Power-up Multiplier
    const powerUpMult = activeEffectsRef.current.multiplier > 0 ? 2 : 1;

    return Math.max(1, Math.round(base * zoneMult * diffMult * modeMult * accMult * speedBonus * powerUpMult));
  };

  // --- Bomb Logic ---
  const handleBombExplosion = (originX: number, originY: number) => {
      // Radius: approx 1/8th of screen area -> ~20% of screen dimension radius
      const RADIUS = 25; 
      
      const wordsToExplode = wordsRef.current.filter(w => {
          const dx = w.x - originX;
          const dy = w.y - originY;
          const dist = Math.hypot(dx, dy);
          return dist <= RADIUS;
      });

      // Remove them
      wordsRef.current = wordsRef.current.filter(w => !wordsToExplode.includes(w));

      // Visuals and Scoring for exploded words
      // Note: Exploded special words do NOT trigger their effect
      wordsToExplode.forEach(w => {
          createExplosion(w.x, w.y, '#f59e0b', 0.7); // Orange explosion
          const points = calculateScoreForWord(w);
          scoreRef.current += points;
          createFloatingText(w.x, w.y, `+${points}`, '#f59e0b');
      });
  };

  // --- The Game Loop ---
  const gameLoop = (time: number) => {
    const deltaTime = (time - lastTimeRef.current) / 1000; // Seconds
    lastTimeRef.current = time;

    // 0. Update Game Time & Speed Ramp
    gameTimeRef.current += deltaTime;
    if (gameTimeRef.current - lastSpeedUpRef.current > 30) {
        lastSpeedUpRef.current = gameTimeRef.current;
        speedMultiplierRef.current *= 1.1; 
        setSpeedMultiplier(speedMultiplierRef.current);
        setSpeedUpNotification(true);
        setTimeout(() => setSpeedUpNotification(false), 2000);
        soundService.playLevelUp(theme); // Re-use level up sound for speed up
    }

    // 0b. Update Power-up Timers
    if (activeEffectsRef.current.shield > 0) activeEffectsRef.current.shield -= deltaTime;
    if (activeEffectsRef.current.multiplier > 0) activeEffectsRef.current.multiplier -= deltaTime;
    if (activeEffectsRef.current.freeze > 0) activeEffectsRef.current.freeze -= deltaTime;

    // Clamp to 0
    if (activeEffectsRef.current.shield < 0) activeEffectsRef.current.shield = 0;
    if (activeEffectsRef.current.multiplier < 0) activeEffectsRef.current.multiplier = 0;
    if (activeEffectsRef.current.freeze < 0) activeEffectsRef.current.freeze = 0;

    // Sync UI state every frame (or could throttle this)
    setUiEffects({...activeEffectsRef.current});

    // 1. Spawning
    spawnTimerRef.current += deltaTime * 1000;
    if (spawnTimerRef.current > getSpawnRate()) {
      spawnWord();
      spawnTimerRef.current = 0;
    }

    // 2. Update Words
    const isFrozen = activeEffectsRef.current.freeze > 0;
    let anyObscuring = false;

    wordsRef.current.forEach(word => {
      // If frozen, speed is 0. Else use calculated speed.
      const currentSpeed = isFrozen ? 0 : word.speed * (speedMultiplierRef.current > 1 ? 1.05 : 1);
      word.y += currentSpeed * deltaTime; 
      
      // Check collision with input box zone (Approx: Y > 75% AND X between 30% and 70%)
      if (word.y > 75 && word.y < 94 && word.x > 30 && word.x < 70) {
          anyObscuring = true;
      }
    });

    // Update obscuring state only if changed (prevents re-renders)
    if (anyObscuring !== isObscuringRef.current) {
        isObscuringRef.current = anyObscuring;
        setIsObscuring(anyObscuring);
    }

    // 3. Check for Collision with Bottom (Missed Words)
    const crashedWords = wordsRef.current.filter(w => w.y > 93);
    
    if (crashedWords.length > 0) {
      crashedWords.forEach(w => {
          createExplosion(w.x, 95, '#ef4444');
          if (activeEffectsRef.current.shield > 0) {
             // Shield Active: No points loss, no life loss, just visual "Absorbed"
             createFloatingText(w.x, 90, 'BLOCKED', '#22d3ee');
             soundService.playError(theme); // Muted crash
          } else {
             createFloatingText(w.x, 90, '0p', '#ef4444');
             soundService.playExplosion(false, theme); // Damage sound
          }
      });

      triggerShake(); 
      
      // Auto-clear buffer if the word being typed just crashed
      // UNLESS it also matches another active word
      if (inputBufferRef.current.length > 0) {
         // Active words excluding the ones that are crashing right now
         const remainingWords = wordsRef.current.filter(w => w.y <= 93);
         const targetsActiveWord = remainingWords.some(w => w.text.startsWith(inputBufferRef.current));
         
         if (!targetsActiveWord) {
             inputBufferRef.current = "";
             setCurrentInput("");
             setIsError(false);
         }
      }

      // Decrement lives ONLY if shield is inactive
      if (activeEffectsRef.current.shield <= 0) {
          livesRef.current -= crashedWords.length;
          setStats(prev => ({ ...prev, lives: Math.max(0, livesRef.current), streak: 0 }));
      }
      
      // Remove crashed words
      wordsRef.current = wordsRef.current.filter(w => w.y <= 93);

      if (livesRef.current <= 0) {
        soundService.playGameOver(theme);
        onGameOver({
            score: scoreRef.current,
            level: levelRef.current,
            lives: 0,
            wpm: 0, // could calculate real WPM here
            streak: 0
        });
        return; // Stop loop
      }
    }

    // 4. Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime * 2; 
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 5. Update Floating Texts
    floatingTextsRef.current.forEach(ft => {
        ft.y -= 10 * deltaTime; 
        ft.life -= deltaTime * 0.8; 
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

    setFrame(f => f + 1);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const [_, setFrame] = useState(0);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (backspaceTimeoutRef.current) {
                clearTimeout(backspaceTimeoutRef.current);
                backspaceTimeoutRef.current = null;
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Backspace (with Long Press logic)
      if (e.key === 'Backspace') {
        if (inputBufferRef.current.length > 0) {
           inputBufferRef.current = inputBufferRef.current.slice(0, -1);
           setCurrentInput(inputBufferRef.current);
           const potentialMatches = wordsRef.current.filter(w => w.text.startsWith(inputBufferRef.current));
           setIsError(potentialMatches.length === 0 && inputBufferRef.current.length > 0);
           soundService.playError(theme); // Backspace sound (low buzz)
        }

        if (!e.repeat && !backspaceTimeoutRef.current) {
            backspaceTimeoutRef.current = setTimeout(() => {
                inputBufferRef.current = "";
                setCurrentInput("");
                setIsError(false);
                setStats(prev => ({ ...prev, streak: 0 })); 
                soundService.playError(theme);
            }, 500);
        }
        return;
      }

      // Handle Letters and Space
      if (e.key.length === 1 && /[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ ]/.test(e.key)) {
        const char = e.key.toLowerCase();
        const nextInput = inputBufferRef.current + char;
        
        const potentialMatches = wordsRef.current.filter(w => w.text.startsWith(nextInput));

        if (accuracyMode) {
            inputBufferRef.current = nextInput;
            setCurrentInput(nextInput);

            if (potentialMatches.length === 0) {
                setIsError(true);
                setStats(prev => ({ ...prev, streak: 0 }));
                soundService.playError(theme);
            } else {
                setIsError(false);
                soundService.playClick(theme);
                checkForCompleteMatch(nextInput);
            }

        } else {
            if (potentialMatches.length > 0) {
                inputBufferRef.current = nextInput;
                setCurrentInput(nextInput);
                setIsError(false);
                soundService.playClick(theme);
                checkForCompleteMatch(nextInput);
            } else {
                setStats(prev => ({ ...prev, streak: 0 }));
                soundService.playError(theme);
            }
        }
      }
    };

    const checkForCompleteMatch = (input: string) => {
        const exactMatchIndex = wordsRef.current.findIndex(w => w.text === input);
        if (exactMatchIndex !== -1) {
            const matchedWord = wordsRef.current[exactMatchIndex];
            
            // Logic: Remove from array FIRST to avoid double processing, but keep reference
            wordsRef.current.splice(exactMatchIndex, 1);
            inputBufferRef.current = "";
            setCurrentInput("");
            setIsError(false);
            
            // Score
            const earnedPoints = calculateScoreForWord(matchedWord);
            scoreRef.current += earnedPoints;

            // Visuals
            createExplosion(matchedWord.x, matchedWord.y, matchedWord.color);

            // SPECIAL EFFECTS HANDLING
            if (matchedWord.specialType) {
                soundService.playPowerUp(matchedWord.specialType, theme);
                switch(matchedWord.specialType) {
                    case 'heart':
                        if (livesRef.current < 5) {
                            livesRef.current += 1;
                            createFloatingText(matchedWord.x, matchedWord.y, `+1 ❤️`, '#ef4444');
                        } else {
                            createFloatingText(matchedWord.x, matchedWord.y, `MAX ❤️`, '#ef4444');
                        }
                        break;
                    case 'bomb':
                        createFloatingText(matchedWord.x, matchedWord.y, `BOOM!`, '#f59e0b', 2.0);
                        createExplosion(matchedWord.x, matchedWord.y, '#f59e0b', 2.0);
                        triggerShake();
                        handleBombExplosion(matchedWord.x, matchedWord.y);
                        break;
                    case 'shield':
                        activeEffectsRef.current.shield = 10; // 10 seconds
                        createFloatingText(matchedWord.x, matchedWord.y, `SHIELD!`, '#22d3ee', 1.5);
                        break;
                    case 'multiplier':
                        activeEffectsRef.current.multiplier = 10; // 10 seconds
                        createFloatingText(matchedWord.x, matchedWord.y, `x2 SCORE!`, '#d946ef', 1.5);
                        break;
                    case 'freeze':
                        activeEffectsRef.current.freeze = 5; // 5 seconds
                        createFloatingText(matchedWord.x, matchedWord.y, `FREEZE!`, '#3b82f6', 1.5);
                        break;
                }
            } else {
                createFloatingText(matchedWord.x, matchedWord.y, `+${earnedPoints}p`);
                soundService.playExplosion(false, theme); // Normal small explosion
            }

            // Level up logic
            if (scoreRef.current >= nextLevelThresholdRef.current) {
                levelRef.current += 1;
                let multFactor = 1;
                if (difficulty === 'recruit') multFactor = 0.5;
                if (difficulty === 'corporal') multFactor = 0.8;
                if (difficulty === 'sergeant') multFactor = 1;
                if (difficulty === 'lieutenant') multFactor = 2;
                if (difficulty === 'general') multFactor = 5;

                if (mode === 'sentences') multFactor *= 5;
                if (mode === 'pairs') multFactor *= 2;
                
                nextLevelThresholdRef.current += (1000 * multFactor) + (levelRef.current * 500);
                soundService.playLevelUp(theme);
            }

            setStats(prev => ({
                ...prev,
                score: scoreRef.current,
                level: levelRef.current,
                lives: livesRef.current,
                streak: prev.streak + 1
            }));
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (backspaceTimeoutRef.current) clearTimeout(backspaceTimeoutRef.current);
    };
  }, [accuracyMode, difficulty, mode]);


  return (
    <div className={`relative w-full h-full overflow-hidden ${themeConfig.font} ${shakeScreen ? 'animate-shake' : ''}`}>
      {/* SHIELD EFFECT OVERLAY */}
      {uiEffects.shield > 0 && (
          <div className="absolute inset-0 z-0 pointer-events-none animate-pulse border-[10px] border-cyan-400/50 shadow-[inset_0_0_100px_rgba(34,211,238,0.3)]"></div>
      )}

      {/* MULTIPLIER WATERMARK */}
      {uiEffects.multiplier > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-fuchsia-500 opacity-10 pointer-events-none z-0 rotate-12 transition-opacity duration-300">
              x2
          </div>
      )}

      {/* FREEZE OVERLAY (Subtle frost) */}
      {uiEffects.freeze > 0 && (
          <div className="absolute inset-0 pointer-events-none bg-blue-300/10 backdrop-blur-[2px] z-0"></div>
      )}


      {/* Dynamic Background Object */}
      {theme === 'space' && <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-blue-400/20 blur-xl animate-pulse"></div>}

      {/* Speed Up Notification */}
      {speedUpNotification && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
              <div className="bg-red-500/90 text-white px-6 py-2 rounded-full font-black uppercase text-xl shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-white">
                  ⚡ Przyspieszenie! ⚡
              </div>
          </div>
      )}

      {/* Zone Indicators */}
      <div className="absolute top-0 w-full h-[35%] border-b border-white/10 pointer-events-none flex items-start justify-end pr-2 pt-2">
         <span className={`text-xs font-bold uppercase opacity-20 ${themeConfig.primaryColor}`}>Strefa x3</span>
      </div>
      <div className="absolute top-[35%] w-full h-[35%] border-b border-white/10 pointer-events-none flex items-start justify-end pr-2 pt-2">
         <span className={`text-xs font-bold uppercase opacity-20 ${themeConfig.primaryColor}`}>Strefa x2</span>
      </div>

      {/* --- HUD BOTTOM LEFT (Stats) --- */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-30 pointer-events-none items-start">
        <div className={`bg-black/60 border p-2 px-4 rounded-xl backdrop-blur-sm text-left min-w-[120px] ${themeConfig.secondaryColor}`}>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Wynik</div>
            <div className="text-2xl font-bold text-white leading-none">{stats.score}</div>
        </div>
        <div className="flex gap-2">
            <div className={`bg-black/60 border p-2 rounded-xl backdrop-blur-sm text-center min-w-[70px] ${themeConfig.secondaryColor}`}>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Poziom</div>
                <div className={`text-xl font-bold ${themeConfig.primaryColor} leading-none`}>{stats.level}</div>
            </div>
            <div className={`bg-black/60 border p-2 rounded-xl backdrop-blur-sm text-center min-w-[70px] ${themeConfig.secondaryColor}`}>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Prędkość</div>
                <div className={`text-xl font-bold ${themeConfig.accentColor} leading-none`}>
                    {speedMultiplier.toFixed(1)}x
                </div>
            </div>
        </div>
      </div>

      {/* --- HUD RIGHT (Lives & Active Effects) --- */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-30 pointer-events-none items-end">
        
        {/* ACTIVE EFFECTS INDICATORS */}
        <div className="flex flex-col gap-1 items-end mb-2">
            {uiEffects.shield > 0 && (
                <div className="bg-cyan-900/80 border border-cyan-400 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                     <span className="text-xl">🛡️</span>
                     <span className="font-mono font-bold text-cyan-300">{Math.ceil(uiEffects.shield)}s</span>
                </div>
            )}
            {uiEffects.multiplier > 0 && (
                <div className="bg-fuchsia-900/80 border border-fuchsia-400 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_10px_rgba(232,121,249,0.5)]">
                     <span className="text-xl">✖️2</span>
                     <span className="font-mono font-bold text-fuchsia-300">{Math.ceil(uiEffects.multiplier)}s</span>
                </div>
            )}
            {uiEffects.freeze > 0 && (
                <div className="bg-blue-900/80 border border-blue-400 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                     <span className="text-xl">⏰</span>
                     <span className="font-mono font-bold text-blue-300">{Math.ceil(uiEffects.freeze)}s</span>
                </div>
            )}
        </div>

        {/* Lives Indicator */}
        <div className="flex gap-1 bg-black/40 p-2 rounded-full backdrop-blur-sm">
           {Array.from({ length: 5 }).map((_, i) => (
             <span key={i} className={`text-2xl transition-all duration-300 drop-shadow-md ${i < stats.lives ? 'opacity-100 scale-100' : 'opacity-20 scale-75 grayscale'}`}>
               ❤️
             </span>
           ))}
        </div>
        
        <button 
            onClick={onExit}
            className="pointer-events-auto bg-red-600/90 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors shadow-lg border-2 border-red-400/30 uppercase tracking-wide"
        >
            Wyjdź
        </button>
      </div>

      {/* Game Area */}
      <div className="relative w-full h-full">
        {/* Words */}
        {wordsRef.current.map((word) => {
            const isMatch = word.text.startsWith(currentInput) && currentInput.length > 0 && !isError;
            const matchLen = isMatch ? currentInput.length : 0;
            const fontSizeClass = mode === 'sentences' ? 'text-sm md:text-base' : 'text-lg md:text-xl';
            
            // Special styling
            let borderColor = 'border-white/20';
            let shadowClass = '';
            let icon = null;

            if (word.specialType) {
                switch(word.specialType) {
                    case 'heart': 
                        borderColor = 'border-red-500'; 
                        shadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.4)]'; 
                        icon = '❤️';
                        break;
                    case 'shield': 
                        borderColor = 'border-cyan-400'; 
                        shadowClass = 'shadow-[0_0_15px_rgba(34,211,238,0.4)]'; 
                        icon = '🛡️';
                        break;
                    case 'bomb': 
                        borderColor = 'border-orange-500'; 
                        shadowClass = 'shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse'; 
                        icon = '💣';
                        break;
                    case 'multiplier': 
                        borderColor = 'border-fuchsia-500'; 
                        shadowClass = 'shadow-[0_0_15px_rgba(217,70,239,0.4)]'; 
                        icon = '✖️';
                        break;
                    case 'freeze': 
                        borderColor = 'border-blue-500'; 
                        shadowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.4)]'; 
                        icon = '⏰';
                        break;
                }
            }

            return (
                <div
                    key={word.id}
                    className="absolute transform -translate-x-1/2 transition-transform duration-75 will-change-transform"
                    style={{
                        left: `${word.x}%`,
                        top: `${word.y}%`,
                    }}
                >
                    {/* Special Icon */}
                    {icon && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
                            <span className="text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{icon}</span>
                        </div>
                    )}

                    {/* Visual Graphic behind word */}
                    <div className="relative flex items-center justify-center">
                        <div className={`w-full h-full min-w-[6rem] min-h-[6rem] rounded-full opacity-60 animate-spin-slow absolute -z-10`} 
                             style={{ 
                                 backgroundColor: word.color, 
                                 filter: 'blur(25px)',
                                 animationDuration: '6s',
                                 transform: 'scale(1.2)'
                             }} 
                        />
                         {/* Word Text Container */}
                        <div className={`bg-black/60 px-5 py-3 rounded-full border shadow-xl backdrop-blur-md whitespace-nowrap ${borderColor} ${shadowClass}`}>
                            <span className={`${themeConfig.primaryColor} font-bold ${fontSizeClass} drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]`}>
                                {word.text.substring(0, matchLen)}
                            </span>
                            <span className={`text-white font-bold ${fontSizeClass}`}>
                                {word.text.substring(matchLen)}
                            </span>
                        </div>
                    </div>
                   
                    {isMatch && (
                        <div className={`absolute left-1/2 top-full h-[100vh] w-1 bg-gradient-to-b from-white to-transparent opacity-30 -translate-x-1/2 z-0 pointer-events-none origin-top`} />
                    )}
                </div>
            );
        })}

        {/* Particles */}
        {particlesRef.current.map((p) => (
            <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: p.color,
                    opacity: p.life,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        ))}

        {/* Floating Scores */}
        {floatingTextsRef.current.map((ft) => (
             <div
                key={ft.id}
                className="absolute font-black text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none whitespace-nowrap"
                style={{
                    left: `${ft.x}%`,
                    top: `${ft.y}%`,
                    opacity: ft.life,
                    transform: 'translate(-50%, -100%) scale(1.2)',
                    color: ft.color
                }}
            >
                {ft.text}
            </div>
        ))}
      </div>
      
      {/* Bottom Input Viz */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <div className={`
            px-8 py-4 rounded-2xl backdrop-blur-md border-4 
            ${isError 
                ? 'border-red-500 bg-red-900/40' 
                : currentInput 
                    ? `border-white bg-slate-900/80` 
                    : `border-slate-600 bg-slate-900/50`}
            transition-all duration-300 shadow-2xl min-w-[300px] text-center
            ${isObscuring ? 'opacity-30 hover:opacity-100' : 'opacity-100'}
        `}>
             <span className={`text-xs uppercase tracking-widest absolute top-1 left-0 w-full text-center ${isError ? 'text-red-300' : 'text-slate-400'}`}>
                {isError ? 'BŁĄD! PRZYTRZYMAJ BACKSPACE' : 'Twoje wpisy'}
             </span>
             <span className={`text-3xl font-bold tracking-widest mt-2 block min-h-[40px] whitespace-pre ${isError ? 'text-red-400' : themeConfig.primaryColor}`}>
                 {currentInput || <span className="text-slate-500 text-xl animate-pulse">pisz teraz...</span>}
             </span>
        </div>
      </div>
    </div>
  );
};
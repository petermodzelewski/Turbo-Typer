

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export type Difficulty = 'recruit' | 'corporal' | 'sergeant' | 'lieutenant' | 'general';

export type GameMode = 'words' | 'pairs' | 'sentences';

export type Theme = 'space' | 'animals' | 'percy' | 'potter';

export type SpecialType = 'heart' | 'shield' | 'bomb' | 'multiplier' | 'freeze';

export interface ThemeConfig {
  id: Theme;
  name: string;
  font: string; // Tailwind font class or CSS font-family
  bgClass: string;
  primaryColor: string; // Tailwind class for text/borders
  secondaryColor: string;
  accentColor: string;
  buttonClass: string;
  particleColors: string[];
  wordColors: string[];
  titleGradient: string;
  promptContext: string; // Context description for Gemini
}

export interface WordObject {
  id: string;
  text: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  speed: number;
  color: string;
  isTargeted?: boolean; // If true, this word is currently being typed
  specialType?: SpecialType; // Replaces isBonus
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number; // 1.0 to 0.0
  color: string;
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  wpm: number;
  streak: number;
}

export interface HighScore {
  name: string;
  score: number;
  difficulty: string;
  mode: string;
  date: string;
}
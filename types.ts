
export interface HanziInfo {
  character: string;
  pinyin: string | string[];
  meaning: string;
  radical: string;
  strokes: number;
  examples: string[];
}

export interface SearchResult {
  char: string;
  pinyin: string | string[];
  brief: string;
}

export interface GeminiSearchResponse {
  results: SearchResult[];
}

// HanziWriter 类型定义
export interface HanziWriterOptions {
  width?: number;
  height?: number;
  padding?: number;
  strokeColor?: string;
  outlineColor?: string;
  showOutline?: boolean;
  showCharacter?: boolean;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  onComplete?: () => void;
}

export interface HanziWriterInstance {
  showCharacter(options?: { onComplete?: () => void }): void;
  hideCharacter(options?: { onComplete?: () => void }): void;
  animateCharacter(options?: { onComplete?: () => void }): void;
  quiz(options?: { onComplete?: () => void }): void;
  cancelAnimation(): void;
  setCharacter(character: string): void;
}

// Global declaration for HanziWriter
declare global {
  interface Window {
    HanziWriter: {
      create(
        element: HTMLElement | string,
        character: string,
        options?: HanziWriterOptions
      ): HanziWriterInstance;
    };
  }
}


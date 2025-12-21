export type WordResult = {
  word: string;
  phonetic?: string | null;
  audio?: string | null;
  partOfSpeech?: string | null;
  meaningEn: string;
  meaningSi: string;
  examplesEn: string[];
  examplesSi: string[];
  source: "dictionaryapi" | "cache" | "Word of the Day";
};

export type UsagePair = { en: string; si: string };

export type UsageResult = {
  word: string;
  mode: "demo" | "ai" | "dictionary";
  pairs: UsagePair[];
  cached: boolean;
  remainingToday?: number;
  note?: string;
};

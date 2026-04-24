export type ReadingStatus = 'want-to-read' | 'reading' | 'finished';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  publishedDate?: string;
  categories?: string[];
  averageRating?: number;
  pageCount?: number;
  status?: ReadingStatus;
  userRating?: number;
  userNotes?: string;
  addedAt: string;
}

export interface BookIdea {
  title: string;
  premise: string;
  genre: string;
  themes: string[];
  targetAudience: string;
}

export interface DictionaryEntry {
  word: string;
  meaning: string;
  phonetic?: string;
  example?: string;
}

export interface StorySummary {
  summary: string;
  themes: string[];
  characterArcs: string[];
  vibe: string;
}

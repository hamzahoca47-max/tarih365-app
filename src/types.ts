export type GameType = 'harf' | 'cark' | 'kap' | 'kelime' | 'iyiki';

export interface StudentScore {
  harf: number;
  cark: number;
  kap: number;
}

export interface Question {
  c: string; // cevap
  s: string; // soru
}

export interface CarkQuestion {
  id: number;
  q: string;
  a: string;
}

export interface IyikiQuestion {
  s: string;
  c: string;
  o: string[];
}

export interface AppSettings {
  logoUrl?: string;
  mascotUrl?: string;
  schoolPin?: string;
}

export interface AppData {
  siniflar: Record<string, string[]>;
  sorular: Record<string, Record<string, Question[]>>;
  carkSorular: CarkQuestion[];
  carkSinifSorular: Record<string, Record<string, CarkQuestion[]>>;
  skorlar: Record<string, Record<string, StudentScore>>;
  eglenceSorular: { kelime: Question[] };
  iyikiVarSorular: Record<string, IyikiQuestion[]>;
  settings?: AppSettings;
}

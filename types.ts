
export interface WorkshopEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
  speaker?: string;
  type: string; 
  timestamp: number;
  facultyBody?: string;
  dailySummary?: string;
  coverTitle?: string;
  coverTitle2?: string;
  subtitle?: string;
  subInicial?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  sobrenome?: string;
  ddd?: string;
  celular?: string;
  cidade?: string;
  estado?: string;
  crie_participa?: string;
  como_participa?: string;
  empresa?: string;
  segmento?: string;
  porte?: string;
  estagio?: string;
  colaboradores?: string;
  tempo?: string;
  interesses?: string;
  temas?: string;
  preferencia?: string; // Usado para o consentimento LGPD na coluna T
}

export interface RegistrationOptions {
  cidades: string[];
  estados: string[];
  series: string[];
  perfis: string[];
  portes: string[];
  estagios: string[];
  colaboradores: string[];
  tempos: string[];
  temas: string[];
  preferencias: string[];
  segmentos: string[]; // Adicionado conforme solicitado
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  whatsapp: string;
  instagram: string;
  imageUrl: string;
}

export interface DailySummary {
  message: string;
  highlight: string;
}

export enum ViewMode {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  SCHEDULE = 'schedule',
  INFO = 'info',
  DIRECTORY = 'directory'
}

export type CourseType = 'SCHOOL' | 'JUMPSTART' | 'EXPERIENCE' | 'PARTNERS';

export interface Course {
  id: CourseType;
  name: string;
  subtitle: string;
  sheetId: string;
  icon: string;
}

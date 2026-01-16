export type StoryPriority = 'Essencial' | 'Deveria ter' | 'Poderia ter';

export interface UserStory {
  id: string;
  text: string;
  priority: StoryPriority;
}

export interface UserCard {
  id: string;
  userName: string;
  stories: UserStory[];
}

export interface MappingNote {
  id: string;
  interviewee: string;
  date: string;
  notes: string;
}

export interface ProcessStep {
  id: string;
  name: string;
  role: string; // Papel/Setor Responsável
  currentScenario: string; // Como é hoje
  futureScenario: string; // Como será
  idealScenario: string; // Como poderia ser (Ideal)
  inputs: string[]; // Novo: Entradas do processo
  outputs: string[]; // Novo: Saídas do processo
  noImprovement: boolean;
  userCards: UserCard[];
  mappings: MappingNote[]; // Novo: Mapeamentos e entrevistas
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  linkedStoryIds: string[]; // IDs das histórias vinculadas a este entregável
}

export interface ProcessImprovement {
  id: string;
  title: string;
  theme: string;
  sectors: string;
  managers: string;
  steps: ProcessStep[];
  deliverables: Deliverable[]; // Lista de entregáveis do projeto
  justification?: string; // Novo: Justificativa do projeto
  objective?: string; // Novo: Objetivo do projeto
  requirements?: string[]; // Novo: Lista de requisitos gerais
  processRules?: string[]; // Novo: Regras do processo
  risks?: string[]; // Novo: Riscos detectados
  updatedAt: string;
}

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

// Novos tipos para Início/Fim
export interface SimpleCard {
  id: string;
  title: string;
  text: string;
}

export interface ProcessNode {
  cards: SimpleCard[];
}

// DEIP Types
export type DeipCategory = 'policies' | 'inputs' | 'outputs' | 'resources';

export interface DeipItem {
  id: string;
  category: DeipCategory;
  title: string;
  description: string;
  attention: boolean; // Flag para destaque (vermelho)
}

export interface ProcessImprovement {
  id: string;
  title: string;
  theme: string;
  sectors: string;
  managers: string;
  startNode: ProcessNode;
  endNode: ProcessNode;
  steps: ProcessStep[];
  deliverables: Deliverable[];
  
  // DEIP Lists
  deipItems: DeipItem[]; 

  justification?: string;
  objective?: string;
  requirements?: string[];
  processRules?: string[];
  risks?: string[];
  updatedAt: string;
}

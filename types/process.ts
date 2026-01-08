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

export interface ProcessStep {
  id: string;
  name: string;
  currentScenario: string; // Como é hoje
  futureScenario: string; // Como será
  noImprovement: boolean;
  userCards: UserCard[];
}

export interface ProcessImprovement {
  id: string;
  title: string;
  theme: string;
  sectors: string;
  managers: string;
  steps: ProcessStep[];
  updatedAt: string;
}

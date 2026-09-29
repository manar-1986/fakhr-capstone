export interface Task {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  instructions?: string;
  instructionsAr?: string;
  instructionsEn?: string;
  expectedOutcome?: string;
  expectedOutcomeAr?: string;
  expectedOutcomeEn?: string;
  completed: boolean;
  dueDate?: string;
}

export interface WeeklyPlan {
  week: number;
  tasks: Task[];
}

export interface Progress {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface CheckIn {
  id: string;
  date: string;
  notes: string;
  rating: number;
}

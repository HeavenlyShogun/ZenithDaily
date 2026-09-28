export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type TodoCategory = 'study' | 'health' | 'life' | 'other';

export interface HealthEntry {
  id: string;
  createdAt: string;
  sleepHours: number;
  exerciseMinutes: number;
  waterGlasses: number;
  mood: MoodLevel;
  note: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  category: TodoCategory;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  mood: MoodLevel;
  gratitude: string;
  improvement: string;
  encouragement: string;
}

export type StorageCollectionKey = 'healthEntries' | 'todoItems' | 'journalEntries';

export type { RootTabParamList } from './navigation';
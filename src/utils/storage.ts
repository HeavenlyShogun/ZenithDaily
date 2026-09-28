import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthEntry, JournalEntry, TodoItem } from '../types';

export const STORAGE_KEYS = {
  healthEntries: '@zenithdaily/health-entries',
  todoItems: '@zenithdaily/todo-items',
  journalEntries: '@zenithdaily/journal-entries',
} as const;

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function readArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  const parsed = safeJsonParse<T[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeArray<T>(key: string, value: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDateKey(value: Date | string = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

export function formatDateLabel(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getHealthEntries(): Promise<HealthEntry[]> {
  return sortByCreatedAtDesc(await readArray<HealthEntry>(STORAGE_KEYS.healthEntries));
}

export async function saveHealthEntry(entry: HealthEntry): Promise<void> {
  const entries = await readArray<HealthEntry>(STORAGE_KEYS.healthEntries);
  const dayKey = getDateKey(entry.createdAt);
  const nextEntries = entries.filter((item) => getDateKey(item.createdAt) !== dayKey);
  nextEntries.push(entry);
  await writeArray(STORAGE_KEYS.healthEntries, sortByCreatedAtDesc(nextEntries));
}

export async function deleteHealthEntry(id: string): Promise<void> {
  const entries = await readArray<HealthEntry>(STORAGE_KEYS.healthEntries);
  await writeArray(STORAGE_KEYS.healthEntries, entries.filter((item) => item.id !== id));
}

export async function getTodoItems(): Promise<TodoItem[]> {
  return sortByCreatedAtDesc(await readArray<TodoItem>(STORAGE_KEYS.todoItems));
}

export async function saveTodoItems(items: TodoItem[]): Promise<void> {
  await writeArray(STORAGE_KEYS.todoItems, sortByCreatedAtDesc(items));
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return sortByCreatedAtDesc(await readArray<JournalEntry>(STORAGE_KEYS.journalEntries));
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const entries = await readArray<JournalEntry>(STORAGE_KEYS.journalEntries);
  const dayKey = getDateKey(entry.createdAt);
  const nextEntries = entries.filter((item) => getDateKey(item.createdAt) !== dayKey);
  nextEntries.push(entry);
  await writeArray(STORAGE_KEYS.journalEntries, sortByCreatedAtDesc(nextEntries));
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const entries = await readArray<JournalEntry>(STORAGE_KEYS.journalEntries);
  await writeArray(STORAGE_KEYS.journalEntries, entries.filter((item) => item.id !== id));
}
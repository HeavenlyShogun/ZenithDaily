import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

/**
 * 獲取 SQLite 資料庫實例（單例模式）
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('habitpulse.db');
    // 開啟 SQLite 外鍵級聯刪除支援 (FOREIGN KEY support)
    await databaseInstance.execAsync('PRAGMA foreign_keys = ON;');
  }
  return databaseInstance;
}

/**
 * 初始化所有必要的資料表
 */
export async function initDatabase(): Promise<void> {
  const db = await getDB();
  
  await db.execAsync(`
    -- 1. 主任務資料表
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- 2. 子任務資料表（級聯刪除：當主任務刪除時，關聯的子任務也會自動被刪除）
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    );

    -- 3. 反思日誌資料表
    CREATE TABLE IF NOT EXISTS journals (
      id TEXT PRIMARY KEY NOT NULL,
      mood_score INTEGER NOT NULL,
      ans1 TEXT NOT NULL,
      ans2 TEXT NOT NULL,
      ans3 TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- 4. 健康作息打卡記錄表
    CREATE TABLE IF NOT EXISTS health_logs (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL, -- 'sleep' (睡眠), 'exercise' (運動), 'diet' (飲食)
      value REAL NOT NULL, -- 睡眠小時、運動分鐘等數值
      note TEXT,          -- 備註說明
      created_at TEXT NOT NULL
    );
  `);
}

// ==========================================
// 【待辦事項模組 CRUD 函式】
// ==========================================

export interface DBTask {
  id: string;
  title: string;
  category: string;
  is_completed: number;
  created_at: string;
}

export interface DBSubTask {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  created_at: string;
}

export interface TaskWithSubtasks {
  id: string;
  title: string;
  category: 'study' | 'life' | 'health';
  isCompleted: boolean;
  subTasks: {
    id: string;
    title: string;
    isCompleted: boolean;
  }[];
  isExpanded?: boolean;
}

/**
 * 查詢所有任務及其子任務
 */
export async function getTasksWithSubTasks(): Promise<TaskWithSubtasks[]> {
  const db = await getDB();
  const dbTasks = await db.getAllAsync<DBTask>('SELECT * FROM tasks ORDER BY created_at DESC');
  const dbSubtasks = await db.getAllAsync<DBSubTask>('SELECT * FROM subtasks ORDER BY created_at ASC');

  return dbTasks.map(task => {
    const relatedSubtasks = dbSubtasks.filter(sub => sub.task_id === task.id);
    return {
      id: task.id,
      title: task.title,
      category: task.category as 'study' | 'life' | 'health',
      isCompleted: task.is_completed === 1,
      isExpanded: false, // 預設不展開
      subTasks: relatedSubtasks.map(sub => ({
        id: sub.id,
        title: sub.title,
        isCompleted: sub.is_completed === 1
      }))
    };
  });
}

/**
 * 新增主任務
 */
export async function insertTask(id: string, title: string, category: string, isCompleted: boolean = false): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO tasks (id, title, category, is_completed, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, title, category, isCompleted ? 1 : 0, now]
  );
}

/**
 * 新增子任務
 */
export async function insertSubTask(id: string, taskId: string, title: string, isCompleted: boolean = false): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO subtasks (id, task_id, title, is_completed, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, taskId, title, isCompleted ? 1 : 0, now]
  );
}

/**
 * 更新主任務完成狀態
 */
export async function updateTaskCompletion(id: string, isCompleted: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE tasks SET is_completed = ? WHERE id = ?',
    [isCompleted ? 1 : 0, id]
  );
}

/**
 * 更新單個子任務完成狀態
 */
export async function updateSubTaskCompletion(id: string, isCompleted: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE subtasks SET is_completed = ? WHERE id = ?',
    [isCompleted ? 1 : 0, id]
  );
}

/**
 * 批次更新某個主任務下所有子任務的完成狀態
 */
export async function updateAllSubTasksCompletion(taskId: string, isCompleted: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE subtasks SET is_completed = ? WHERE task_id = ?',
    [isCompleted ? 1 : 0, taskId]
  );
}

/**
 * 刪除任務（會自動觸發 SQLite 外鍵級聯，同步刪除子任務）
 */
export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}


// ==========================================
// 【反思手帳模組 CRUD 函式】
// ==========================================

export interface DBJournal {
  id: string;
  mood_score: number;
  ans1: string;
  ans2: string;
  ans3: string;
  created_at: string;
}

/**
 * 保存或新增反思手帳（使用 INSERT OR REPLACE 避免重複建立同一天的日記）
 */
export async function saveJournal(id: string, moodScore: number, ans1: string, ans2: string, ans3: string, createdAt: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT OR REPLACE INTO journals (id, mood_score, ans1, ans2, ans3, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, moodScore, ans1, ans2, ans3, createdAt]
  );
}

// 相容舊名稱
export const insertJournal = saveJournal;

/**
 * 取得特定日期的反思手帳
 * @param dateStr 格式 'YYYY-MM-DD'
 */
export async function getJournalByDate(dateStr: string): Promise<DBJournal | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<DBJournal>(
    'SELECT * FROM journals WHERE created_at LIKE ?',
    [`${dateStr}%`]
  );
  return result;
}

// 相容舊名稱
export const getJournalForDate = getJournalByDate;

/**
 * 獲取最近 N 天的反思手帳紀錄（用於圖表或趨勢統計）
 */
export async function getRecentJournals(limit: number = 7): Promise<DBJournal[]> {
  const db = await getDB();
  return await db.getAllAsync<DBJournal>(
    'SELECT * FROM journals ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}


// ==========================================
// 【健康打卡模組 CRUD 函式】
// ==========================================

export interface DBHealthLog {
  id: string;
  type: string;
  value: number;
  note: string | null;
  created_at: string;
}

/**
 * 儲存健康打卡記錄
 */
export async function insertHealthLog(id: string, type: string, value: number, note: string | null, createdAt: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO health_logs (id, type, value, note, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, type, value, note, createdAt]
  );
}

/**
 * 取得特定日期的健康打卡記錄
 * @param dateStr 格式 'YYYY-MM-DD'
 */
export async function getHealthLogsForDate(dateStr: string): Promise<DBHealthLog[]> {
  const db = await getDB();
  return await db.getAllAsync<DBHealthLog>(
    'SELECT * FROM health_logs WHERE created_at LIKE ?',
    [`${dateStr}%`]
  );
}

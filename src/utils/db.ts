import * as SQLite from 'expo-sqlite';

export interface CollectionRecord {
  id: number;
  date: string;
  amount: number;
  notes: string;
  tamil_month: string;
  tamil_date: number;
  festival: string | null;
  created_at: string;
}

export interface CollectionsSummary {
  today: number;
  week: number;
  month: number;
  lifetime: number;
  highestDay: { date: string; amount: number } | null;
  lowestDay: { date: string; amount: number } | null;
  averageDaily: number;
  monthlyGrowthPercent: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('thattu_kaasu.db');
  }
  return dbInstance;
}

export async function initDB(): Promise<void> {
  const db = await getDB();
  
  // Create tables if they do not exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      tamil_month TEXT NOT NULL,
      tamil_date INTEGER NOT NULL,
      festival TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

// User Settings Helpers
export async function saveSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return result ? result.value : null;
}

// Collections Helpers
export async function addCollection(
  amount: number,
  date: string,
  notes: string,
  tamilMonth: string,
  tamilDate: number,
  festival: string
): Promise<void> {
  const db = await getDB();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO collections (amount, date, notes, tamil_month, tamil_date, festival, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [amount, date, notes, tamilMonth, tamilDate, festival || null, createdAt]
  );
}

export async function deleteCollection(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM collections WHERE id = ?', [id]);
}

export async function getCollections(limit?: number): Promise<CollectionRecord[]> {
  const db = await getDB();
  const query = limit 
    ? 'SELECT * FROM collections ORDER BY date DESC, id DESC LIMIT ?'
    : 'SELECT * FROM collections ORDER BY date DESC, id DESC';
  const args = limit ? [limit] : [];
  return await db.getAllAsync<CollectionRecord>(query, args);
}

export async function getCollectionsForDate(date: string): Promise<CollectionRecord[]> {
  const db = await getDB();
  return await db.getAllAsync<CollectionRecord>(
    'SELECT * FROM collections WHERE date = ? ORDER BY id DESC',
    [date]
  );
}

export async function getCollectionsSummary(): Promise<CollectionsSummary> {
  const db = await getDB();
  
  // Local date formatting helper to avoid timezone shifts
  const toLocalISOString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = toLocalISOString(new Date());

  // Get Today's Total
  const todayResult = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM collections WHERE date = ?",
    [todayStr]
  );
  const today = todayResult?.total || 0;

  // Get Week's Total (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
  const weekStartStr = toLocalISOString(oneWeekAgo);
  const weekResult = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM collections WHERE date BETWEEN ? AND ?",
    [weekStartStr, todayStr]
  );
  const week = weekResult?.total || 0;

  // Get Month's Total (current calendar month)
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const monthStartStr = `${currentYear}-${currentMonth}-01`;
  const nextMonthDay = new Date(currentYear, new Date().getMonth() + 1, 0);
  const monthEndStr = toLocalISOString(nextMonthDay);
  
  const monthResult = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM collections WHERE date BETWEEN ? AND ?",
    [monthStartStr, monthEndStr]
  );
  const month = monthResult?.total || 0;

  // Get Lifetime Total
  const lifetimeResult = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM collections"
  );
  const lifetime = lifetimeResult?.total || 0;

  // Get Highest Collection Day
  const highestResult = await db.getFirstAsync<{ date: string; amount: number }>(
    "SELECT date, SUM(amount) as amount FROM collections GROUP BY date ORDER BY amount DESC LIMIT 1"
  );
  const highestDay = highestResult ? { date: highestResult.date, amount: highestResult.amount } : null;

  // Get Lowest Collection Day
  const lowestResult = await db.getFirstAsync<{ date: string; amount: number }>(
    "SELECT date, SUM(amount) as amount FROM collections GROUP BY date ORDER BY amount ASC LIMIT 1"
  );
  const lowestDay = lowestResult ? { date: lowestResult.date, amount: lowestResult.amount } : null;

  // Get Average Daily Collection
  const avgResult = await db.getFirstAsync<{ avg: number }>(
    "SELECT AVG(daily_sum) as avg FROM (SELECT SUM(amount) as daily_sum FROM collections GROUP BY date)"
  );
  const averageDaily = avgResult?.avg || 0;

  // Get Monthly Growth Percent (Comparing current calendar month to last calendar month)
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthVal = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
  const lastMonthStartStr = `${lastMonthYear}-${lastMonthVal}-01`;
  const lastMonthEndDay = new Date(lastMonthYear, lastMonthDate.getMonth() + 1, 0);
  const lastMonthEndStr = toLocalISOString(lastMonthEndDay);
  
  const lastMonthResult = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM collections WHERE date BETWEEN ? AND ?",
    [lastMonthStartStr, lastMonthEndStr]
  );
  const lastMonthTotal = lastMonthResult?.total || 0;

  let monthlyGrowthPercent = 0;
  if (lastMonthTotal > 0) {
    monthlyGrowthPercent = ((month - lastMonthTotal) / lastMonthTotal) * 100;
  } else if (month > 0) {
    monthlyGrowthPercent = 100; // If there was no collection last month but some this month
  }

  return {
    today,
    week,
    month,
    lifetime,
    highestDay,
    lowestDay,
    averageDaily,
    monthlyGrowthPercent,
  };
}

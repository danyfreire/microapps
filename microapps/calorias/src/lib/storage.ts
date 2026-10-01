import {
  dailySettingsSchema,
  mealSchema,
  type DailySettings,
  type Meal,
} from "@/domain/schemas";

/**
 * Persistencia local-first (Decisión A del DESIGN):
 * - Diario por día en IndexedDB.
 * - Ajustes simples (objetivo) en localStorage.
 */

const DB_NAME = "calo";
const DB_VERSION = 1;
const STORE = "meals";
const INDEX = "byDay";
const SETTINGS_KEY = "calo:settings";

interface MealRecord extends Meal {
  day: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex(INDEX, "day", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir la base local."));
  });
}

function stripDay({ day: _day, ...meal }: MealRecord): Meal {
  return meal;
}

export async function getMeals(day: string): Promise<Meal[]> {
  const db = await openDb();
  return new Promise<Meal[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const index = tx.objectStore(STORE).index(INDEX);
    const req = index.getAll(day);
    req.onsuccess = () => {
      const records = (req.result as MealRecord[]).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      resolve(records.map(stripDay));
    };
    req.onerror = () => reject(req.error ?? new Error("No se pudo leer el diario."));
    tx.oncomplete = () => db.close();
  });
}

export async function putMeal(day: string, meal: Meal): Promise<void> {
  const parsed = mealSchema.safeParse(meal);
  if (!parsed.success) return;
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...parsed.data, day } satisfies MealRecord);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("No se pudo guardar la comida."));
    };
  });
}

export async function deleteMeal(day: string, id: string): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result as MealRecord | undefined;
      if (record && record.day === day) {
        store.delete(id);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("No se pudo eliminar la comida."));
    };
  });
}

export async function clearDay(day: string): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const index = store.index(INDEX);
    const req = index.getAllKeys(day);
    req.onsuccess = () => {
      for (const key of req.result as IDBValidKey[]) {
        store.delete(key);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("No se pudo limpiar el día."));
    };
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("No se pudieron borrar los datos."));
    };
  });
  clearSettings();
}

export function getSettings(): DailySettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = dailySettingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings: DailySettings): void {
  if (typeof window === "undefined") return;
  const parsed = dailySettingsSchema.safeParse(settings);
  if (!parsed.success) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.data));
}

export function clearSettings(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETTINGS_KEY);
}

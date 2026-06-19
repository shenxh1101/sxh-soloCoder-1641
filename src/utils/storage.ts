const PREFIX = 'dish_manager_';

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage set error:', e);
  }
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error('localStorage get error:', e);
    return defaultValue;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.error('localStorage remove error:', e);
  }
}

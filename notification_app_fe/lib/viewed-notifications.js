const VIEWED_KEY = 'campus_notification_viewed_ids';

export function readViewedIds() {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(VIEWED_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    return new Set();
  }
}

export function writeViewedIds(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VIEWED_KEY, JSON.stringify([...ids]));
}

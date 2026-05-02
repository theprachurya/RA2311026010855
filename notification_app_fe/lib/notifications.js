export const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export function formatDate(value) {
  if (!value) {
    return 'Unknown time';
  }

  const parsed = new Date(value.replace(' ', 'T') + 'Z');

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function sortByPriority(items) {
  return [...items].sort((left, right) => {
    const leftWeight = PRIORITY_ORDER[left.Type] ?? 0;
    const rightWeight = PRIORITY_ORDER[right.Type] ?? 0;

    if (leftWeight !== rightWeight) {
      return rightWeight - leftWeight;
    }

    return new Date(right.Timestamp.replace(' ', 'T') + 'Z').getTime() - new Date(left.Timestamp.replace(' ', 'T') + 'Z').getTime();
  });
}

export function normalizeNotifications(payload) {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.notifications)) {
    return payload.notifications;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

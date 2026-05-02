const { Log } = require('../logging_middleware');
const { listUnreadNotifications, getNotificationCount, parseTimestamp } = require('./repository');

const PRIORITY_WEIGHT = {
  placement: 3,
  result: 2,
  event: 1
};

function normalizeType(value) {
  return String(value ?? '').trim().toLowerCase();
}

function sortByPriority(notifications) {
  return [...notifications].sort((left, right) => {
    const leftWeight = PRIORITY_WEIGHT[normalizeType(left.type)] ?? 0;
    const rightWeight = PRIORITY_WEIGHT[normalizeType(right.type)] ?? 0;

    if (leftWeight !== rightWeight) {
      return rightWeight - leftWeight;
    }

    return parseTimestamp(right.timestamp) - parseTimestamp(left.timestamp);
  });
}

async function getPriorityInbox(limit) {
  await Log('backend', 'info', 'service', `building priority inbox with limit ${limit}`);
  const unreadNotifications = await listUnreadNotifications();

  if (unreadNotifications.length === 0) {
    await Log('backend', 'warn', 'service', 'no unread notifications available for priority inbox');
    return [];
  }

  const sortedNotifications = sortByPriority(unreadNotifications);
  const result = sortedNotifications.slice(0, limit);

  await Log('backend', 'debug', 'service', `selected ${result.length} notifications from ${unreadNotifications.length} unread records`);

  return result;
}

async function getInboxStats() {
  const count = await getNotificationCount();
  await Log('backend', 'info', 'service', `computed unread inbox count ${count}`);
  return { unreadCount: count };
}

module.exports = {
  getPriorityInbox,
  getInboxStats,
  sortByPriority,
  PRIORITY_WEIGHT
};

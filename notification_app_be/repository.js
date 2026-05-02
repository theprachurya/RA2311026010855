const { Log } = require('../logging_middleware');

const notifications = [
  { id: 'n-1', type: 'placement', message: 'Amazon hiring', timestamp: '2026-05-02 09:30:00', read: false },
  { id: 'n-2', type: 'result', message: 'Mid-sem results published', timestamp: '2026-05-02 08:25:00', read: false },
  { id: 'n-3', type: 'event', message: 'Tech talk by alumni', timestamp: '2026-05-02 10:10:00', read: false },
  { id: 'n-4', type: 'placement', message: 'Google hiring', timestamp: '2026-05-02 11:40:00', read: false },
  { id: 'n-5', type: 'event', message: 'Hackathon registration open', timestamp: '2026-05-02 12:10:00', read: false },
  { id: 'n-6', type: 'placement', message: 'Adobe hiring', timestamp: '2026-05-02 11:55:00', read: true },
  { id: 'n-7', type: 'result', message: 'Assignment grades updated', timestamp: '2026-05-02 07:50:00', read: false },
  { id: 'n-8', type: 'placement', message: 'Microsoft hiring', timestamp: '2026-05-02 12:20:00', read: false }
];

function parseTimestamp(value) {
  return new Date(value.replace(' ', 'T') + 'Z').getTime();
}

async function listUnreadNotifications() {
  await Log('backend', 'debug', 'repository', `loaded ${notifications.length} in-memory notifications`);
  return notifications.filter((notification) => !notification.read);
}

async function getNotificationCount() {
  await Log('backend', 'debug', 'repository', 'counted unread notification records');
  return notifications.filter((notification) => !notification.read).length;
}

module.exports = {
  listUnreadNotifications,
  getNotificationCount,
  parseTimestamp
};

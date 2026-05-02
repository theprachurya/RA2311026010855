const { Log } = require('../logging_middleware');
const { getPriorityInbox, getInboxStats, PRIORITY_WEIGHT } = require('./service');

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload, null, 2));
}

function parseLimit(url) {
  const raw = url.searchParams.get('n') ?? '10';
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 10 : parsed;
}

async function handlePriorityInboxRequest(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const limit = parseLimit(url);

  await Log('backend', 'info', 'controller', `received priority inbox request for top ${limit}`);

  try {
    const notifications = await getPriorityInbox(limit);
    const stats = await getInboxStats();

    await Log('backend', 'info', 'controller', `returning ${notifications.length} priority notifications`);

    sendJson(response, 200, {
      count: notifications.length,
      unreadCount: stats.unreadCount,
      priorityWeights: PRIORITY_WEIGHT,
      notifications
    });
  } catch (error) {
    await Log('backend', 'error', 'controller', `priority inbox request failed: ${error.message}`);
    sendJson(response, 500, {
      message: 'unable to build priority inbox'
    });
  }
}

module.exports = {
  handlePriorityInboxRequest,
  sendJson,
  parseLimit
};

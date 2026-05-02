const http = require('http');
const { Log } = require('../logging_middleware');
const { handlePriorityInboxRequest, sendJson } = require('./controller');

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

async function handleRequest(request, response) {
  const url = new URL(request.url, 'http://localhost');
  await Log('backend', 'info', 'middleware', `${request.method} ${url.pathname}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    await Log('backend', 'debug', 'middleware', 'health check completed successfully');
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/notifications/top') {
    await handlePriorityInboxRequest(request, response);
    return;
  }

  await Log('backend', 'warn', 'middleware', `no route matched for ${request.method} ${url.pathname}`);
  sendJson(response, 404, { message: 'route not found' });
}

async function startServer() {
  await Log('backend', 'info', 'config', `starting notification backend on port ${PORT}`);

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch(async (error) => {
      await Log('backend', 'fatal', 'middleware', `unhandled request failure: ${error.message}`);
      sendJson(response, 500, { message: 'internal server error' });
    });
  });

  server.listen(PORT, async () => {
    await Log('backend', 'info', 'route', `notification backend listening on port ${PORT}`);
    console.log(`Notification backend running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Priority inbox: http://localhost:${PORT}/notifications/top?n=10`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  handleRequest
};

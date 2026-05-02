const fs = require('fs');
const path = require('path');

const LOG_API_URL = 'http://20.207.122.201/evaluation-service/logs';
const VALID_STACKS = new Set(['backend', 'frontend']);
const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const VALID_PACKAGES = new Set([
  'cache',
  'controller',
  'cron_job',
  'dh',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils'
]);

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function findAuthToken() {
  if (process.env.LOG_API_TOKEN) {
    return process.env.LOG_API_TOKEN.trim();
  }

  const visited = new Set();
  const startDirs = [process.cwd(), __dirname];

  for (const startDir of startDirs) {
    let currentDir = path.resolve(startDir);

    while (!visited.has(currentDir)) {
      visited.add(currentDir);
      const authFile = path.join(currentDir, 'authentication.json');

      if (fs.existsSync(authFile)) {
        try {
          const auth = JSON.parse(fs.readFileSync(authFile, 'utf8'));
          if (auth && typeof auth.access_token === 'string' && auth.access_token.trim()) {
            return auth.access_token.trim();
          }
        } catch (error) {
          return null;
        }
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }

      currentDir = parentDir;
    }
  }

  return null;
}

function validateLogInput(stack, level, pkg, message) {
  const normalizedStack = normalizeText(stack);
  const normalizedLevel = normalizeText(level);
  const normalizedPackage = normalizeText(pkg);
  const normalizedMessage = String(message ?? '').trim();

  if (!VALID_STACKS.has(normalizedStack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  if (!VALID_LEVELS.has(normalizedLevel)) {
    throw new Error(`Invalid level: ${level}`);
  }

  if (!VALID_PACKAGES.has(normalizedPackage)) {
    throw new Error(`Invalid package: ${pkg}`);
  }

  if (!normalizedMessage) {
    throw new Error('Log message cannot be empty');
  }

  return {
    stack: normalizedStack,
    level: normalizedLevel,
    package: normalizedPackage,
    message: normalizedMessage
  };
}

async function Log(stack, level, pkg, message) {
  const payload = validateLogInput(stack, level, pkg, message);
  const token = findAuthToken();

  if (!token) {
    return {
      ok: false,
      status: 0,
      error: 'Authorization token not found'
    };
  }

  try {
    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const rawBody = await response.text();
    let parsedBody = rawBody;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      parsedBody = rawBody;
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        body: parsedBody
      };
    }

    return {
      ok: true,
      status: response.status,
      body: parsedBody
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

module.exports = {
  Log,
  LOG_API_URL,
  VALID_STACKS,
  VALID_LEVELS,
  VALID_PACKAGES,
  validateLogInput,
  findAuthToken
};

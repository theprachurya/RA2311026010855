import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = 'http://20.207.122.201/evaluation-service/notifications';
const ROUTE_DIR = path.dirname(fileURLToPath(import.meta.url));

function findAuthToken() {
  const candidates = [
    process.env.LOG_API_TOKEN,
    process.env.NOTIFICATION_API_TOKEN
  ].filter(Boolean);

  if (candidates.length > 0) {
    return candidates[0].trim();
  }

  const directAuthPath = path.resolve(ROUTE_DIR, '../../../authentication.json');

  if (fs.existsSync(directAuthPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(directAuthPath, 'utf8'));
      if (typeof parsed.access_token === 'string' && parsed.access_token.trim()) {
        return parsed.access_token.trim();
      }
    } catch (error) {
      return null;
    }
  }

  let currentDir = process.cwd();

  while (true) {
    const authPath = path.join(currentDir, 'authentication.json');

    if (fs.existsSync(authPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(authPath, 'utf8'));
        if (typeof parsed.access_token === 'string' && parsed.access_token.trim()) {
          return parsed.access_token.trim();
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

  return null;
}

export async function GET(request) {
  const token = findAuthToken();

  if (!token) {
    return Response.json({ message: 'Authorization token not found' }, { status: 500 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(API_URL);

  for (const [key, value] of incomingUrl.searchParams.entries()) {
    if (value) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    const text = await response.text();
    let payload;

    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text };
    }

    return Response.json(payload, { status: response.status });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

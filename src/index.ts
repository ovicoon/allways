import { HTML } from './html';

export interface Env {
  // 백엔드 Worker에 대한 Service Binding (권장: 같은 계정 내 Worker 간 직접 호출)
  BACKEND?: Fetcher;
  // Service Binding을 쓰지 않을 경우 백엔드 Worker의 공개 URL (예: https://backend.<subdomain>.workers.dev)
  BACKEND_URL?: string;
  // 백엔드의 BACKEND_API_KEY 와 동일한 값 (wrangler secret 으로 등록)
  BACKEND_API_KEY: string;
}

const ALLOWED_PATHS = new Set(['/api/worker-ai']);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function proxyToBackend(request: Request, env: Env, path: string): Promise<Response> {
  if (!env.BACKEND_API_KEY) {
    return json({ error: 'Server misconfigured: BACKEND_API_KEY is not set' }, 500);
  }

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'model': '@cf/deepseek-ai/deepseek-v4.1-flash-1017',
      'temperature': '0.1',
      'top_p': '0.1',
      'X-API-Key': env.BACKEND_API_KEY
    },
    body: await request.text()
  };

  if (env.BACKEND) {
    // Service Binding: 호스트명은 의미 없고 경로만 전달됨
    return env.BACKEND.fetch(`https://backend${path}`, init);
  }
  if (env.BACKEND_URL) {
    return fetch(`${env.BACKEND_URL.replace(/\/+$/, '')}${path}`, init);
  }
  return json({ error: 'Server misconfigured: set BACKEND service binding or BACKEND_URL' }, 500);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;

    // 프론트엔드 페이지
    if (path === '/' || path === '/index.html') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'Method not allowed.' }, 405);
      }
      return new Response(HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // API 프록시 (API 키는 서버 측에서만 주입)
    if (ALLOWED_PATHS.has(path)) {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed. Use POST method.' }, 405);
      }
      try {
        return await proxyToBackend(request, env, path);
      } catch (error: any) {
        return json({ error: error?.message || 'Upstream request failed' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

import { HTML } from './html';
import { REFERENCES, type ReferenceKey } from './reference';
import { MAIN_MODEL, RETRIEVER, RETRIEVER_INSTRUCTION } from './constant';

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

interface ProxyOptions {
  temperature?: number;
  top_p?: number;
  instruction?: string;
  reference?: string;
  useClientbody?: boolean;
}

// Retriever 응답(JSON 또는 일반 텍스트)에서 reference key 를 찾는다. 없거나 NONE 이면 undefined.
async function parseReferenceKey(res: Response): Promise<ReferenceKey | undefined> {
  if (!res.ok) return undefined;
  const raw = await res.text();
  let text = raw;
  try {
    const data: any = JSON.parse(raw);
    text = data?.response ?? data?.result?.response ?? data?.text ?? raw;
  } catch {}
  // qwen3 의 <think>...</think> 블록은 제외하고 탐색
  const answer = String(text).replace(/<think>[\s\S]*?<\/think>/g, '');
  return (Object.keys(REFERENCES) as ReferenceKey[]).find((key) => answer.includes(key));
}

async function proxyToBackend(
  request: Request,
  env: Env,
  path: string,
  model: string,
  options: ProxyOptions = {} // 옵션 객체 하나로 전부 관리
): Promise<Response> {
  if (!env.BACKEND_API_KEY) {
    return json({ error: 'Server misconfigured: BACKEND_API_KEY is not set' }, 500);
  }

  const clientBody: any = await request.json().catch(() => ({}));

  const useClientbody = options.useClientbody ?? true;

  const systemPrompts = [
    options.instruction,
    useClientbody ? clientBody.system : undefined,
    options.reference
  ].filter(Boolean);
  
  // 전송할 페이로드 구성
  const payload: Record<string, any> = {
    prompt: clientBody.prompt ?? clientBody.question,
    model: model,
  };

  if (systemPrompts.length > 0) {
    payload.system = systemPrompts.join('\n\n');
  }

  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': env.BACKEND_API_KEY
    },
    body: JSON.stringify(payload)
  };

  if (env.BACKEND) {
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
        const retrieved = await proxyToBackend(request.clone(), env, path, RETRIEVER, {
          instruction: RETRIEVER_INSTRUCTION,
          useClientbody: false
        });
        const key = await parseReferenceKey(retrieved);
        return await proxyToBackend(request, env, path, MAIN_MODEL, {
          reference: key && REFERENCES[key].content
        });
      } catch (error: any) {
        return json({ error: error?.message || 'Upstream request failed' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

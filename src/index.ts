import { HTML } from './html';
import { SKILLS, COMPLAINTS_ADMIN, type SkillKey } from './skill';
import { MAIN_MODEL, RETRIEVER, RETRIEVER_INSTRUCTION } from './constant';

export interface Env {
  // 백엔드 Worker에 대한 Service Binding (권장: 같은 계정 내 Worker 간 직접 호출)
  BACKEND?: Fetcher;
  // Service Binding을 쓰지 않을 경우 백엔드 Worker의 공개 URL (예: https://backend.<subdomain>.workers.dev)
  BACKEND_URL?: string;
  // 백엔드의 BACKEND_API_KEY 와 동일한 값 (wrangler secret 으로 등록)
  BACKEND_API_KEY: string;
  // 기존 민원(complaints 테이블)이 저장된 D1 데이터베이스
  DB: D1Database;
}

// Main Model 에 넘길 기존 민원 개수 상한 (프롬프트 길이 제한)
const COMPLAINT_LIMIT = 100;

interface ComplaintRow {
  id: number;
  content: string;
  answer: string | null;
  created_at: string;
}

// D1 에서 기존 민원과 답변을 읽어 instruction 에 붙일 텍스트로 만든다.
async function loadComplaints(env: Env): Promise<string> {
  const { results } = await env.DB
    .prepare('SELECT id, content, answer, created_at FROM complaints ORDER BY created_at DESC LIMIT ?')
    .bind(COMPLAINT_LIMIT)
    .all<ComplaintRow>();
  if (results.length === 0) return '[기존 민원 목록]\n(접수된 민원 없음)';
  const list = results
    .map((row) => `- 민원 #${row.id} (${row.created_at})\n  내용: ${row.content}\n  답변: ${row.answer ?? '(답변 대기 중)'}`)
    .join('\n');
  return `[기존 민원 목록]\n${list}`;
}

// Main Model 이 민원 접수가 필요하다고 판단하면 답변 끝에 붙이는 표시
const EXECUTE_MARKER = '>>>EXECUTE SQL:';
// 허용하는 유일한 쿼리 형태: complaints 에 content 한 건 INSERT (POST). 그 외 SELECT/UPDATE/DELETE 등은 모두 거부
const ALLOWED_INSERT = /^INSERT\s+INTO\s+complaints\s*\(\s*content\s*\)\s*VALUES\s*\(\s*'((?:[^']|'')+)'\s*\)\s*;?$/i;

// 학교 관련자만 허용하는 쿼리 형태: 기존 민원 한 건의 answer UPDATE
const ALLOWED_UPDATE = /^UPDATE\s+complaints\s+SET\s+answer\s*=\s*'((?:[^']|'')+)'\s+WHERE\s+id\s*=\s*(\d+)\s*;?$/i;

// 민원 답변 등록 권한이 있는 역할. 데모이므로 프론트엔드에서 고른 역할을 그대로 믿고 검증하지 않는다.
const ANSWER_ROLE = 'school';

// 답변 끝의 >>>EXECUTE SQL: ... 표시에서 쿼리 부분을 꺼낸다. 없으면 undefined.
function extractQuery(answer: string): string | undefined {
  // qwen3 의 <think>...</think> 블록 안의 표시는 무시
  const text = answer.replace(/<think>[\s\S]*?<\/think>/g, '');
  const start = text.lastIndexOf(EXECUTE_MARKER);
  if (start === -1) return undefined;
  // 표시 뒤의 나머지 전체가 쿼리
  return text.slice(start + EXECUTE_MARKER.length).trim();
}

// 허용된 INSERT 이면 민원을 접수한다. 실행 여부를 반환.
async function executeComplaint(env: Env, query: string): Promise<boolean> {
  const match = ALLOWED_INSERT.exec(query);
  if (!match) return false;
  const content = match[1].replace(/''/g, "'").trim();
  if (!content) return false;
  // 모델이 만든 SQL 을 그대로 실행하지 않고, 내용만 뽑아 prepared statement 로 바인딩
  await env.DB.prepare('INSERT INTO complaints (content) VALUES (?)').bind(content).run();
  return true;
}

// 허용된 UPDATE 이면 민원에 답변을 등록한다. 실제로 갱신된 민원이 있으면 true.
async function executeAnswer(env: Env, query: string): Promise<boolean> {
  const match = ALLOWED_UPDATE.exec(query);
  if (!match) return false;
  const answer = match[1].replace(/''/g, "'").trim();
  if (!answer) return false;
  const result = await env.DB
    .prepare('UPDATE complaints SET answer = ? WHERE id = ?')
    .bind(answer, Number(match[2]))
    .run();
  return result.meta.changes > 0;
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
  skill?: string;
  useClientbody?: boolean;
}

// Retriever 응답(JSON 또는 일반 텍스트)에서 skill key 를 찾는다. 없거나 NONE 이면 undefined.
async function parseSkillKey(res: Response): Promise<SkillKey | undefined> {
  if (!res.ok) return undefined;
  const raw = await res.text();
  let text = raw;
  try {
    const data: any = JSON.parse(raw);
    text = data?.response ?? data?.result?.response ?? data?.text ?? raw;
  } catch {}
  // qwen3 의 <think>...</think> 블록은 제외하고 탐색
  const answer = String(text).replace(/<think>[\s\S]*?<\/think>/g, '');
  return (Object.keys(SKILLS) as SkillKey[]).find((key) => answer.includes(key));
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
    options.skill
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
        const clientBody: any = await request.clone().json().catch(() => ({}));
        const isAdmin = clientBody.role === ANSWER_ROLE;
        const key = await parseSkillKey(retrieved);
        let skill: string | undefined = key && SKILLS[key].content;
        // 민원 스킬이면 기존 민원 목록을 D1 에서 읽어 스킬 지침 뒤에 추가
        // 학교 관련자는 민원 접수 대신 답변 등록용 지침을 사용
        if (key === 'COMPLAINTS') {
          skill = `${isAdmin ? COMPLAINTS_ADMIN : skill}\n${await loadComplaints(env)}`;
        }
        const res = await proxyToBackend(request, env, path, MAIN_MODEL, { skill });
        // 민원 스킬일 때만 답변 끝의 >>>EXECUTE SQL: ... 를 확인해 실행한다 (표시는 프론트엔드에서 숨김)
        if (key !== 'COMPLAINTS' || !res.ok) return res;
        const data: any = await res.json().catch(() => null);
        if (!data) return json({ error: 'Invalid upstream response' }, 502);
        const answer = data?.response ?? data?.result?.response;
        const query = typeof answer === 'string' ? extractQuery(answer) : undefined;
        if (query) {
          // 학교 관련자는 답변 등록(UPDATE)만, 그 외 역할은 민원 접수(INSERT)만 허용
          if (isAdmin) {
            data.complaint_answered = await executeAnswer(env, query);
          } else {
            data.complaint_submitted = await executeComplaint(env, query);
          }
        }
        return json(data);
      } catch (error: any) {
        return json({ error: error?.message || 'Upstream request failed' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

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

// Main Model 최대 출력 토큰. Workers AI 기본값(256)은 gpt-oss 가 reasoning 에 다 써버려 답변(content)이 null 이 된다
const MAIN_MAX_TOKENS = 4096;

// 모델에 넘길 이전 대화 상한 (프롬프트 길이 제한). Retriever 는 최근 질문 맥락만 보면 되므로 더 적게 넘긴다
const HISTORY_LIMIT = 20;
const RETRIEVER_HISTORY_LIMIT = 4;
const HISTORY_CONTENT_LIMIT = 4000;

interface ComplaintRow {
  id: number;
  content: string;
  answer: string | null;
  created_at: string;
}

const COMPLAINTS_QUERY = 'SELECT id, content, answer, created_at FROM complaints ORDER BY created_at DESC LIMIT ?';

// D1 에서 기존 민원과 답변을 읽는다. 프론트엔드에서 불러온 데이터를 그대로 보여줄 수 있도록 쿼리와 행도 함께 돌려준다.
async function loadComplaints(env: Env): Promise<{ text: string; query: string; rows: ComplaintRow[] }> {
  const { results } = await env.DB.prepare(COMPLAINTS_QUERY).bind(COMPLAINT_LIMIT).all<ComplaintRow>();
  return {
    text: formatComplaints(results),
    query: COMPLAINTS_QUERY.replace('?', String(COMPLAINT_LIMIT)),
    rows: results
  };
}

// 모델에게 보여주는 시각의 기준 시간대. 학교가 한국에 있으므로 한국 시간으로 통일한다
const LOCAL_TIME_ZONE = 'Asia/Seoul';
const LOCAL_TIME_LABEL = '한국 시간';

const LOCAL_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: LOCAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

// Date 를 "2026-10-24(토) 23:07" 형태의 한국 시간 문자열로 만든다
function formatLocal(date: Date): string {
  const parts = Object.fromEntries(LOCAL_FORMAT.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}(${parts.weekday}) ${parts.hour}:${parts.minute}`;
}

// D1 의 CURRENT_TIMESTAMP 는 시간대 표시 없는 UTC("2026-10-24 14:07:39")이므로 UTC 로 읽어 한국 시간으로 바꾼다.
// 형식이 달라 읽지 못하면 원래 값을 그대로 쓴다.
function utcToLocal(utc: string): string {
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(utc) ? utc : `${utc.replace(' ', 'T')}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? utc : formatLocal(date);
}

// 기존 민원과 답변을 instruction 에 붙일 텍스트로 만든다.
// 같은 민원인지 날짜로 판단할 수 있도록 현재 시각과 접수 시각을 모두 한국 시간으로 넣는다.
function formatComplaints(results: ComplaintRow[]): string {
  const now = `[현재 시각]\n${formatLocal(new Date())} (${LOCAL_TIME_LABEL})`;
  if (results.length === 0) return `${now}\n\n[기존 민원 목록]\n(접수된 민원 없음)`;
  const list = results
    .map(
      (row) =>
        `- 민원 #${row.id} (접수: ${utcToLocal(row.created_at)})\n  내용: ${row.content}\n  답변: ${row.answer ?? '(답변 대기 중)'}`
    )
    .join('\n');
  return `${now}\n\n[기존 민원 목록] (접수 시각은 ${LOCAL_TIME_LABEL})\n${list}`;
}

// Main Model 이 민원 접수가 필요하다고 판단하면 답변 끝에 붙이는 표시
const EXECUTE_MARKER = '>>>EXECUTE SQL:';
// 허용하는 유일한 쿼리 형태: complaints 에 content 한 건 INSERT (POST). 그 외 SELECT/UPDATE/DELETE 등은 모두 거부
const ALLOWED_INSERT = /^INSERT\s+INTO\s+complaints\s*\(\s*content\s*\)\s*VALUES\s*\(\s*'((?:[^']|'')+)'\s*\)\s*;?$/i;

// 학교 관련자만 허용하는 쿼리 형태: 기존 민원 한 건의 answer UPDATE
const ALLOWED_UPDATE = /^UPDATE\s+complaints\s+SET\s+answer\s*=\s*'((?:[^']|'')+)'\s+WHERE\s+id\s*=\s*(\d+)\s*;?$/i;

// 민원 답변 등록 권한이 있는 역할. 데모이므로 프론트엔드에서 고른 역할을 그대로 믿고 검증하지 않는다.
const ANSWER_ROLE = 'school';

// 모델별로 다른 응답 형식에서 답변 텍스트를 꺼낸다. 못 찾으면 undefined.
// - qwen 등: { response: "..." }
// - gpt-oss (Responses API): { output: [{ type: 'reasoning', ... }, { type: 'message', content: [{ type: 'output_text', text }] }] }
// - Chat Completions: { choices: [{ message: { content } }] }
function extractText(data: any): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.output_text === 'string') return data.output_text;
  if (Array.isArray(data.output)) {
    // reasoning 블록은 제외하고 message 의 output_text 만 사용
    const text = data.output
      .filter((item: any) => item?.type === 'message')
      .flatMap((item: any) => (Array.isArray(item.content) ? item.content : []))
      .filter((part: any) => part?.type === 'output_text' && typeof part.text === 'string')
      .map((part: any) => part.text)
      .join('');
    if (text) return text;
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (data.result) return extractText(data.result);
  return undefined;
}

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

// 사용자가 버튼으로 실행 여부를 고르는 작업 종류
type ActionKind = 'submit' | 'answer';

// 역할에 따라 허용된 형식인지 보고 작업 종류를 정한다. 허용되지 않으면 undefined.
// 학교 관련자는 답변 등록(UPDATE)만, 그 외 역할은 민원 접수(INSERT)만 허용
function classifyQuery(query: string, isAdmin: boolean): ActionKind | undefined {
  if (!isAdmin) return ALLOWED_INSERT.test(query) ? 'submit' : undefined;
  return ALLOWED_UPDATE.test(query) ? 'answer' : undefined;
}

const EXECUTORS: Record<ActionKind, (env: Env, query: string) => Promise<boolean>> = {
  submit: executeComplaint,
  answer: executeAnswer
};

// 모델이 제안한 쿼리에 서명한다. /api/execute 는 이 서명이 있는 쿼리만 실행하므로,
// 클라이언트가 모델을 거치지 않고 임의의 민원을 직접 접수/답변할 수 없다.
async function signAction(env: Env, role: string, query: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`allways-action:${env.BACKEND_API_KEY}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${role}\n${query}`));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 길이가 같을 때 끝까지 비교해 서명 비교 시간으로 정보가 새지 않게 한다
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// 사용자가 "실행" 버튼을 눌렀을 때 서명을 확인하고 쿼리를 실행한다.
async function handleExecute(request: Request, env: Env): Promise<Response> {
  if (!env.BACKEND_API_KEY) {
    return json({ error: 'Server misconfigured: BACKEND_API_KEY is not set' }, 500);
  }
  const body: any = await request.json().catch(() => ({}));
  const query = typeof body.query === 'string' ? body.query : '';
  const token = typeof body.token === 'string' ? body.token : '';
  const role = body.role === ANSWER_ROLE ? ANSWER_ROLE : 'other';
  const kind = classifyQuery(query, role === ANSWER_ROLE);
  if (!kind || !safeEqual(token, await signAction(env, role, query))) {
    return json({ error: '실행할 수 없는 작업입니다.' }, 400);
  }
  const executed = await EXECUTORS[kind](env, query);
  return json({ kind, executed });
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 프론트엔드가 보낸 이전 대화를 모델에 넘길 수 있는 형태로 정리한다.
// qwen3 와 gpt-oss 모두 messages 의 content 는 일반 문자열이어야 하므로 모델별 부가 정보는 제거한다:
// - qwen3 의 <think>...</think> 블록 (이전 턴의 reasoning 을 다시 넣으면 안 됨)
// - >>>EXECUTE SQL: 표시 (모델이 이전 표시를 그대로 다시 내놓지 않도록. 실행 여부는 프론트엔드가 본문 뒤에 적어 보낸다)
function sanitizeHistory(raw: unknown, limit: number): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const messages = raw
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .map((m: any): ChatMessage => {
      let content: string = m.content.replace(/<think>[\s\S]*?<\/think>/g, '');
      const marker = content.lastIndexOf(EXECUTE_MARKER);
      if (marker !== -1) content = content.slice(0, marker);
      return { role: m.role, content: content.trim().slice(0, HISTORY_CONTENT_LIMIT) };
    })
    .filter((m) => m.content);
  // 최근 대화만 남기고, user 로 시작하도록 맞춘다
  const recent = messages.slice(-limit);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  return recent;
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
  max_tokens?: number;
  instruction?: string;
  skill?: string;
  history?: ChatMessage[];
  useClientbody?: boolean;
}

// Retriever 응답(JSON 또는 일반 텍스트)에서 skill key 들을 모두 찾는다. 없거나 NONE 이면 빈 배열.
async function parseSkillKeys(res: Response): Promise<SkillKey[]> {
  if (!res.ok) return [];
  const raw = await res.text();
  let text = raw;
  try {
    const data: any = JSON.parse(raw);
    text = extractText(data) ?? data?.text ?? raw;
  } catch {}
  // qwen3 의 <think>...</think> 블록은 제외하고 탐색
  const answer = String(text).replace(/<think>[\s\S]*?<\/think>/g, '');
  return (Object.keys(SKILLS) as SkillKey[]).filter((key) => new RegExp(`\\b${key}\\b`).test(answer));
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
    options.skill
  ].filter(Boolean);
  
  // 전송할 페이로드 구성
  const payload: Record<string, any> = {
    prompt: clientBody.prompt ?? clientBody.question,
    model: model,
  };

  if (options.max_tokens !== undefined) {
    payload.max_tokens = options.max_tokens;
  }

  if (options.history && options.history.length > 0) {
    payload.history = options.history;
  }

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

    // 사용자가 승인한 민원 작업 실행
    if (path === '/api/execute') {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed. Use POST method.' }, 405);
      }
      try {
        return await handleExecute(request, env);
      } catch (error: any) {
        return json({ error: error?.message || 'Execute failed' }, 500);
      }
    }

    // API 프록시 (API 키는 서버 측에서만 주입)
    if (ALLOWED_PATHS.has(path)) {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed. Use POST method.' }, 405);
      }
      try {
        const clientBody: any = await request.clone().json().catch(() => ({}));
        // 이어지는 질문("그거 접수해줘" 등)도 맞는 스킬을 고를 수 있도록 Retriever 에도 최근 대화를 넘긴다
        const retrieved = await proxyToBackend(request.clone(), env, path, RETRIEVER, {
          instruction: RETRIEVER_INSTRUCTION,
          history: sanitizeHistory(clientBody.history, RETRIEVER_HISTORY_LIMIT),
          useClientbody: false
        });
        const isAdmin = clientBody.role === ANSWER_ROLE;
        const keys = await parseSkillKeys(retrieved);
        const hasComplaints = keys.includes('COMPLAINTS');
        let loaded: Awaited<ReturnType<typeof loadComplaints>> | undefined;
        const skills = await Promise.all(
          keys.map(async (key) => {
            // 민원 스킬이면 기존 민원 목록을 D1 에서 읽어 스킬 지침 뒤에 추가
            // 학교 관련자는 민원 접수 대신 답변 등록용 지침을 사용
            if (key === 'COMPLAINTS') {
              loaded = await loadComplaints(env);
              return `${isAdmin ? COMPLAINTS_ADMIN : SKILLS[key].content}\n${loaded.text}`;
            }
            return SKILLS[key].content;
          })
        );
        const res = await proxyToBackend(request, env, path, MAIN_MODEL, {
          skill: skills.length > 0 ? skills.join('\n\n') : undefined,
          history: sanitizeHistory(clientBody.history, HISTORY_LIMIT),
          max_tokens: MAIN_MAX_TOKENS
        });
        if (!res.ok) return res;
        const data: any = await res.json().catch(() => null);
        if (!data) return json({ error: 'Invalid upstream response' }, 502);
        // 프론트엔드는 data.response 만 읽으므로, 모델별 응답 형식을 response 텍스트로 맞춘다
        const answer = extractText(data);
        if (answer === undefined) {
          // finish_reason 이 length 이면 reasoning 에 토큰을 다 써서 답변이 잘린 것
          const truncated = data.choices?.[0]?.finish_reason === 'length';
          return json({ error: truncated ? 'Model response truncated (max_tokens exceeded)' : 'Empty model response' }, 502);
        }
        data.response = answer;
        // 답변에 쓰려고 D1 에서 불러온 데이터 (프론트엔드에서 펼쳐 볼 수 있게 표시)
        if (loaded) {
          data.d1 = { table: 'complaints', query: loaded.query, rows: loaded.rows };
        }
        // 민원 스킬일 때만 답변 끝의 >>>EXECUTE SQL: ... 를 확인한다. 바로 실행하지 않고,
        // 허용된 형식이면 서명을 붙여 돌려주고 사용자가 버튼으로 실행 여부를 고른다 (/api/execute)
        if (!hasComplaints) return json(data);
        const query = extractQuery(answer);
        const kind = query ? classifyQuery(query, isAdmin) : undefined;
        if (query && kind) {
          data.action = { kind, query, token: await signAction(env, isAdmin ? ANSWER_ROLE : 'other', query) };
        }
        return json(data);
      } catch (error: any) {
        return json({ error: error?.message || 'Upstream request failed' }, 502);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

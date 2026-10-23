export const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Playground</title>
<style>
  :root { color-scheme: light dark; --bg:#f6f7f9; --card:#fff; --fg:#1a1d21; --muted:#6b7280; --border:#d9dde3; --accent:#2563eb; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0f1114; --card:#181b20; --fg:#e8eaed; --muted:#9aa0a8; --border:#2b3037; --accent:#4f8cff; }
  }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans KR", sans-serif; background:var(--bg); color:var(--fg); }
  main { max-width: 820px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 1.4rem; margin: 0 0 16px; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:16px; }
  .row { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  @media (max-width:600px){ .row { grid-template-columns: 1fr; } }
  label { display:block; font-size:.8rem; color:var(--muted); margin:0 0 4px; }
  input, select, textarea { width:100%; padding:8px 10px; border:1px solid var(--border); border-radius:8px; background:transparent; color:inherit; font:inherit; }
  textarea { resize: vertical; min-height: 110px; }
  .field { margin-bottom:12px; }
  button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:10px 18px; font:inherit; cursor:pointer; }
  button:disabled { opacity:.6; cursor:wait; }
  #out { white-space:pre-wrap; word-break:break-word; min-height:60px; }
  .err { color:#dc2626; }
  .meta { color:var(--muted); font-size:.8rem; margin-top:8px; }
</style>
</head>
<body>
<main>
  <h1>AI Playground</h1>

  <form id="form" class="card">
    <div class="row">
      <div class="field">
        <label for="provider">Provider</label>
        <select id="provider">
          <option value="gemini">Google Gemini</option>
          <option value="worker-ai">Cloudflare Workers AI</option>
        </select>
      </div>
      <div class="field">
        <label for="model">Model (비워두면 기본값)</label>
        <input id="model" placeholder="gemini-3.8-flash" />
      </div>
    </div>

    <div class="field">
      <label for="system">System 프롬프트</label>
      <input id="system" value="You are a helpful assistant." />
    </div>

    <div class="row">
      <div class="field">
        <label for="temperature">Temperature (선택)</label>
        <input id="temperature" type="number" step="0.1" min="0" max="2" placeholder="예: 0.7" />
      </div>
      <div class="field">
        <label for="top_p">Top-p (선택)</label>
        <input id="top_p" type="number" step="0.05" min="0" max="1" placeholder="예: 0.95" />
      </div>
    </div>

    <div class="field">
      <label for="prompt">프롬프트</label>
      <textarea id="prompt" placeholder="질문을 입력하세요. (Ctrl/⌘ + Enter 로 전송)"></textarea>
    </div>

    <button id="send" type="submit">보내기</button>
  </form>

  <section class="card">
    <label>응답</label>
    <div id="out">아직 응답이 없습니다.</div>
    <div id="meta" class="meta"></div>
  </section>
</main>

<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var placeholders = { "gemini": "gemini-3.8-flash", "worker-ai": "@cf/meta/llama-3.2-1b-instruct" };

  $("provider").addEventListener("change", function () {
    $("model").placeholder = placeholders[$("provider").value];
  });

  $("prompt").addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      $("form").requestSubmit();
    }
  });

  $("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var provider = $("provider").value;
    var body = { prompt: $("prompt").value.trim(), system: $("system").value };
    if (!body.prompt) return;
    if ($("model").value.trim()) body.model = $("model").value.trim();
    if ($("temperature").value !== "") body.temperature = Number($("temperature").value);
    if ($("top_p").value !== "") body.top_p = Number($("top_p").value);

    var out = $("out"), meta = $("meta"), btn = $("send");
    btn.disabled = true;
    out.className = "";
    out.textContent = "생성 중...";
    meta.textContent = "";
    var started = performance.now();

    try {
      var res = await fetch("/api/" + provider, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      var data = await res.json().catch(function () { return null; });
      if (!res.ok || !data) {
        throw new Error((data && data.error) || ("요청 실패 (" + res.status + ")"));
      }

      var text;
      if (provider === "gemini") {
        text = data.completion;
        if (data.usage) {
          meta.textContent = "model: " + data.model + " · tokens: " + (data.usage.totalTokenCount || "?");
        }
      } else {
        text = data.response != null ? data.response : JSON.stringify(data, null, 2);
      }
      out.textContent = text || "(빈 응답)";
      var secs = ((performance.now() - started) / 1000).toFixed(2);
      meta.textContent = (meta.textContent ? meta.textContent + " · " : "") + secs + "s";
    } catch (err) {
      out.className = "err";
      out.textContent = "오류: " + err.message;
    } finally {
      btn.disabled = false;
    }
  });
})();
</script>
</body>
</html>`;

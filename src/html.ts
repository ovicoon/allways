export const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#ffffff" />
<title>EduFinHub AI</title>
<style>
  :root {
    color-scheme: light;
    --red: #ff0000;
    --green: #00ff00;
    --blue: #0000ff;
    --ink: #000000;
    --muted: #5c5c5c;
    --line: #e6e6e6;
    --bg: #ffffff;
    --soft: #f5f5f5;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  button, textarea { font: inherit; color: inherit; }

  /* 상단 RGB 띠 */
  .stripe { height: 6px; display: flex; flex: none; }
  .stripe span { flex: 1; }
  .stripe span:nth-child(1) { background: var(--red); }
  .stripe span:nth-child(2) { background: var(--green); }
  .stripe span:nth-child(3) { background: var(--blue); }

  .app { height: 100dvh; display: flex; flex-direction: column; }

  header {
    flex: none;
    display: flex; align-items: center; justify-content: space-between;
    max-width: 860px; width: 100%; margin: 0 auto; padding: 14px 16px;
  }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.05rem; letter-spacing: -0.02em; }
  .dots { display: inline-flex; gap: 4px; }
  .dots i { width: 10px; height: 10px; display: block; }
  .dots i:nth-child(1) { background: var(--red); }
  .dots i:nth-child(2) { background: var(--green); border-radius: 50%; }
  .dots i:nth-child(3) { background: var(--blue); transform: rotate(45deg) scale(.85); }
  .new-chat {
    border: 2px solid var(--ink); background: var(--bg); padding: 6px 12px; border-radius: 999px;
    font-size: .85rem; font-weight: 700; cursor: pointer; visibility: hidden;
    transition: background .15s, color .15s;
  }
  .new-chat:hover { background: var(--ink); color: var(--bg); }
  .app.chatting .new-chat { visibility: visible; }

  /* 대화 영역 */
  #thread {
    flex: 1; overflow-y: auto; overscroll-behavior: contain;
    scroll-behavior: smooth;
  }
  .thread-inner { max-width: 860px; margin: 0 auto; padding: 8px 16px 24px; display: flex; flex-direction: column; gap: 18px; }

  /* 첫 화면 */
  .app:not(.chatting) #thread { display: flex; align-items: center; }
  .app:not(.chatting) .thread-inner { width: 100%; }
  .hero { padding: 0 0 8px; }
  .app.chatting .hero { display: none; }
  .hero h1 {
    margin: 0 0 14px; font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.1; letter-spacing: -0.04em; font-weight: 900;
  }
  .hero h1 .r { color: var(--red); }
  .hero h1 .b { color: var(--blue); }
  .hero h1 .g { background: linear-gradient(transparent 62%, var(--green) 62%); }
  .hero p { margin: 0 0 22px; color: var(--muted); font-size: 1rem; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    border: 2px solid var(--ink); background: var(--bg); border-radius: 999px; padding: 8px 14px;
    font-size: .9rem; cursor: pointer; transition: transform .12s, box-shadow .12s;
  }
  .chip:nth-child(3n+1):hover { box-shadow: 4px 4px 0 var(--red); }
  .chip:nth-child(3n+2):hover { box-shadow: 4px 4px 0 var(--green); }
  .chip:nth-child(3n+3):hover { box-shadow: 4px 4px 0 var(--blue); }
  .chip:hover { transform: translate(-2px, -2px); }

  /* 메시지 */
  .msg { display: flex; gap: 10px; max-width: 100%; animation: pop .22s ease-out; }
  @keyframes pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .msg.user { justify-content: flex-end; }
  .bubble { padding: 12px 16px; border-radius: 18px; white-space: pre-wrap; word-break: break-word; line-height: 1.6; max-width: min(640px, 85%); }
  .msg.user .bubble { background: var(--blue); color: #fff; border-bottom-right-radius: 4px; }
  .msg.ai .bubble { background: var(--bg); border: 2px solid var(--ink); border-top-left-radius: 4px; box-shadow: 4px 4px 0 var(--green); }
  .msg.ai.error .bubble { border-color: var(--red); box-shadow: 4px 4px 0 var(--red); color: var(--red); font-weight: 600; }
  .avatar { flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--ink); display: grid; place-items: center; margin-top: 2px; }
  .avatar .dots { gap: 2px; }
  .avatar .dots i { width: 5px; height: 5px; }
  .meta { font-size: .75rem; color: var(--muted); margin-top: 8px; }

  .typing { display: inline-flex; gap: 6px; padding: 4px 0; }
  .typing i { width: 8px; height: 8px; border-radius: 50%; animation: bounce 1s infinite ease-in-out; }
  .typing i:nth-child(1) { background: var(--red); }
  .typing i:nth-child(2) { background: var(--green); animation-delay: .15s; }
  .typing i:nth-child(3) { background: var(--blue); animation-delay: .3s; }
  @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-7px); } }

  /* 입력창 */
  .composer-wrap { flex: none; padding: 8px 16px calc(16px + env(safe-area-inset-bottom)); background: var(--bg); }
  .app:not(.chatting) .composer-wrap { padding-bottom: 12vh; }
  .composer {
    max-width: 828px; margin: 0 auto;
    display: flex; align-items: flex-end; gap: 8px;
    border: 2px solid var(--ink); border-radius: 22px; padding: 8px 8px 8px 18px; background: var(--bg);
    box-shadow: 6px 6px 0 var(--blue);
    transition: box-shadow .15s;
  }
  .composer:focus-within { box-shadow: 6px 6px 0 var(--red); }
  .composer textarea {
    flex: 1; border: 0; outline: 0; resize: none; background: transparent;
    font-size: 1rem; line-height: 1.5; padding: 8px 0; max-height: 200px; min-height: 24px;
  }
  .composer textarea::placeholder { color: #9a9a9a; }
  .send {
    flex: none; width: 42px; height: 42px; border-radius: 50%; border: 0; cursor: pointer;
    background: var(--red); color: #fff; display: grid; place-items: center;
    transition: transform .12s, background .15s;
  }
  .send:hover:not(:disabled) { transform: scale(1.06); }
  .send:disabled { background: #d0d0d0; cursor: not-allowed; }
  .send svg { width: 20px; height: 20px; }
  .hint { max-width: 828px; margin: 10px auto 0; font-size: .75rem; color: var(--muted); text-align: center; }

  @media (max-width: 600px) {
    .bubble { max-width: 88%; }
    .avatar { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
</style>
</head>
<body>
<div class="app" id="app">
  <div class="stripe"><span></span><span></span><span></span></div>

  <header>
    <div class="brand"><span class="dots"><i></i><i></i><i></i></span>EduFinHub</div>
    <button class="new-chat" id="newChat" type="button">+ 새 대화</button>
  </header>

  <div id="thread">
    <div class="thread-inner" id="list">
      <section class="hero">
        <h1><span class="r">무엇이든</span> <span class="g">물어보세요</span><span class="b">.</span></h1>
        <p>금융과 경제, 궁금한 것을 AI에게 바로 질문해 보세요.</p>
        <div class="chips">
          <button class="chip" type="button">복리란 무엇인가요?</button>
          <button class="chip" type="button">사회초년생 예산 짜는 법</button>
          <button class="chip" type="button">주식과 채권의 차이</button>
          <button class="chip" type="button">신용점수를 올리려면?</button>
        </div>
      </section>
    </div>
  </div>

  <div class="composer-wrap">
    <form class="composer" id="form">
      <textarea id="prompt" rows="1" placeholder="메시지를 입력하세요" aria-label="메시지"></textarea>
      <button class="send" id="send" type="submit" aria-label="보내기" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
      </button>
    </form>
    <div class="hint">Enter 전송 · Shift + Enter 줄바꿈</div>
  </div>
</div>

<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var app = $("app"), list = $("list"), thread = $("thread"), input = $("prompt"), send = $("send");
  var SYSTEM = "You are a helpful assistant.";
  var busy = false;

  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
    send.disabled = busy || !input.value.trim();
  }

  function scrollDown() { thread.scrollTop = thread.scrollHeight; }

  function avatar() {
    var a = document.createElement("div");
    a.className = "avatar";
    a.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    return a;
  }

  function addMessage(role, text) {
    var row = document.createElement("div");
    row.className = "msg " + role;
    var bubble = document.createElement("div");
    bubble.className = "bubble";
    if (text != null) bubble.textContent = text;
    if (role === "ai") row.appendChild(avatar());
    row.appendChild(bubble);
    list.appendChild(row);
    scrollDown();
    return { row: row, bubble: bubble };
  }

  async function ask(text) {
    if (busy || !text) return;
    busy = true;
    app.classList.add("chatting");
    addMessage("user", text);
    input.value = "";
    autosize();

    var ai = addMessage("ai");
    ai.bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    var started = performance.now();

    try {
      var res = await fetch("/api/worker-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, system: SYSTEM })
      });
      var data = await res.json().catch(function () { return null; });
      if (!res.ok || !data) {
        throw new Error((data && data.error) || ("요청 실패 (" + res.status + ")"));
      }
      var reply = data.response != null ? data.response : JSON.stringify(data, null, 2);
      ai.bubble.textContent = reply || "(빈 응답)";
      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = ((performance.now() - started) / 1000).toFixed(1) + "s";
      ai.bubble.appendChild(meta);
    } catch (err) {
      ai.row.classList.add("error");
      ai.bubble.textContent = "오류: " + err.message;
    } finally {
      busy = false;
      autosize();
      scrollDown();
      input.focus();
    }
  }

  input.addEventListener("input", autosize);
  input.addEventListener("keydown", function (e) {
    // 한글 IME 조합 중 Enter 는 무시
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      $("form").requestSubmit();
    }
  });

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value.trim());
  });

  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (chip) {
    chip.addEventListener("click", function () { ask(chip.textContent); });
  });

  $("newChat").addEventListener("click", function () {
    if (busy) return;
    Array.prototype.forEach.call(list.querySelectorAll(".msg"), function (m) { m.remove(); });
    app.classList.remove("chatting");
    input.focus();
  });

  input.focus();
})();
</script>
</body>
</html>`;

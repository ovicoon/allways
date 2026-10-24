export const HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#111111" />
  <title>Allways</title>
  <link rel="icon" type="image/svg+xml" href="/allways.svg" />

  <style>
    :root {
      color-scheme: dark;
      --bg: #111111;
      --surface: #181818;
      --surface-hover: #222222;
      --surface-input: #151515;
      --text: #f5f5f5;
      --muted: #a0a0a0;
      --subtle: #707070;
      --border: #303030;
      --border-strong: #505050;
      --content-width: 780px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        "Apple SD Gothic Neo",
        "Noto Sans KR",
        "Malgun Gothic",
        sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    button,
    textarea {
      font: inherit;
      color: inherit;
    }

    button {
      -webkit-tap-highlight-color: transparent;
    }

    button:focus-visible,
    textarea:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--text);
      outline-offset: 4px;
    }

    .app {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: var(--bg);
    }

    /* Header */

    header {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      width: 100%;
      max-width: 1040px;
      min-height: 104px;
      margin: 0 auto;
      padding: 24px 32px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      text-decoration: none;
    }

    .brand img {
      display: block;
      width: auto;
      height: 54px;
      max-width: min(280px, 58vw);
      object-fit: contain;
      object-position: left center;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-button {
      display: none;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: color 150ms ease;
    }

    .header-button:hover {
      color: var(--text);
    }

    .app.has-role .role-badge {
      display: inline-flex;
    }

    .app.chatting .new-chat {
      display: inline-flex;
    }

    /* Role selection */

    .picker {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      padding: 32px 24px 64px;
    }

    .picker-inner {
      width: 100%;
      max-width: var(--content-width);
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 24px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .picker h1 {
      margin: 0;
      font-size: clamp(36px, 5vw, 54px);
      line-height: 1.25;
      font-weight: 600;
      letter-spacing: -0.065em;
      word-break: keep-all;
    }

    .picker-description {
      margin: 20px 0 48px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.9;
      word-break: keep-all;
    }

    .roles {
      display: flex;
      flex-direction: column;
      border-top: 1px solid var(--border-strong);
    }

    .role {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      width: 100%;
      min-height: 92px;
      padding: 20px 6px;
      border: 0;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      background: transparent;
      text-align: left;
      cursor: pointer;
      transition: background 150ms ease, padding 150ms ease;
    }

    .role:hover {
      padding-right: 14px;
      padding-left: 14px;
      background: var(--surface);
    }

    .role-copy {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .role strong {
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.025em;
    }

    .role-description {
      color: var(--muted);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.7;
      word-break: keep-all;
    }

    .role-arrow {
      flex: none;
      color: var(--subtle);
      font-size: 20px;
      transition: color 150ms ease, transform 150ms ease;
    }

    .role:hover .role-arrow {
      color: var(--text);
      transform: translateX(3px);
    }

    .app.has-role .picker {
      display: none;
    }

    .app:not(.has-role) #thread,
    .app:not(.has-role) .composer-wrap {
      display: none;
    }

    /* Conversation */

    #thread {
      flex: 1;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      scroll-behavior: smooth;
    }

    .thread-inner {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
      max-width: var(--content-width);
      min-height: 100%;
      margin: 0 auto;
      padding: 44px 24px 32px;
    }

    .hero {
      margin: auto 0;
      padding: 24px 0;
    }

    .app.chatting .hero {
      display: none;
    }

    .hero-label {
      margin: 0 0 22px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
    }

    .hero h2 {
      margin: 0;
      font-size: clamp(36px, 5vw, 50px);
      line-height: 1.3;
      font-weight: 500;
      letter-spacing: -0.065em;
      word-break: keep-all;
    }

    .hero p {
      max-width: 540px;
      margin: 20px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.9;
      word-break: keep-all;
    }

    /* Messages */

    .msg {
      display: flex;
      width: 100%;
      min-width: 0;
      animation: appear 160ms ease-out;
    }

    .msg.user {
      justify-content: flex-end;
    }

    .msg.ai {
      justify-content: flex-start;
    }

    .bubble {
      max-width: 88%;
      min-width: 0;
      padding: 0;
      border-radius: 0;
      color: var(--text);
      font-size: 15px;
      line-height: 1.95;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .msg.user .bubble {
      padding: 13px 17px;
      border: 1px solid var(--border);
      border-radius: 16px 16px 4px 16px;
      background: var(--surface);
    }

    .msg.ai .bubble {
      max-width: 100%;
    }

    .msg.ai.error .bubble {
      color: #d0d0d0;
    }

    .meta {
      margin-top: 12px;
      color: var(--subtle);
      font-size: 11px;
      line-height: 1.5;
    }

    .typing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 28px;
    }

    .typing i {
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #999999;
      animation: pulse 1s infinite ease-in-out;
    }

    .typing i:nth-child(2) {
      animation-delay: 0.15s;
    }

    .typing i:nth-child(3) {
      animation-delay: 0.3s;
    }

    /* Input */

    .composer-wrap {
      flex: none;
      width: 100%;
      padding: 16px 24px calc(20px + env(safe-area-inset-bottom));
      background: var(--bg);
    }

    .composer {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: var(--content-width);
      min-height: 60px;
      margin: 0 auto;
      padding: 8px 10px 8px 18px;
      border: 1px solid var(--border-strong);
      border-radius: 16px;
      background: var(--surface-input);
      transition: border-color 150ms ease;
    }

    .composer:focus-within {
      border-color: #aaaaaa;
    }

    .composer textarea {
      flex: 1;
      display: block;
      min-width: 0;
      min-height: 24px;
      max-height: 180px;
      height: 24px;
      margin: 0;
      padding: 2px 0;
      border: 0;
      outline: 0;
      resize: none;
      overflow-x: hidden;
      overflow-y: hidden;
      background: transparent;
      color: var(--text);
      font-size: 14px;
      line-height: 20px;
      font-family: inherit;
      box-sizing: content-box;
    }

    .composer textarea::placeholder {
      color: var(--subtle);
      opacity: 1;
    }

    .send {
      display: grid;
      flex: none;
      width: 38px;
      height: 38px;
      place-items: center;
      border: 1px solid transparent;
      border-radius: 11px;
      background: var(--text);
      color: var(--bg);
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease;
    }

    .send:hover:not(:disabled) {
      background: #d8d8d8;
    }

    .send:disabled {
      border-color: var(--border);
      background: #292929;
      color: #666666;
      cursor: not-allowed;
    }

    .send svg {
      display: block;
      width: 18px;
      height: 18px;
    }

    .hint {
      width: 100%;
      max-width: var(--content-width);
      margin: 12px auto 0;
      color: var(--subtle);
      font-size: 11px;
      line-height: 1.5;
      text-align: center;
    }

    .app:not(.chatting) .composer-wrap {
      padding-bottom: calc(28px + env(safe-area-inset-bottom));
    }

    /* Responsive */

    @keyframes appear {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 60%, 100% {
        opacity: 0.35;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    @media (min-width: 1000px) {
      header {
        padding-right: 40px;
        padding-left: 40px;
      }
    }

    @media (max-width: 600px) {
      header {
        min-height: 84px;
        padding: 18px 20px;
      }

      .brand img {
        height: 44px;
        max-width: 58vw;
      }

      .header-actions {
        gap: 14px;
      }

      .header-button {
        font-size: 12px;
      }

      .picker {
        align-items: flex-start;
        padding: 52px 24px 44px;
      }

      .picker h1 {
        font-size: 38px;
      }

      .picker-description {
        margin: 16px 0 36px;
        font-size: 14px;
      }

      .role {
        min-height: 84px;
        padding: 18px 2px;
      }

      .role strong {
        font-size: 15px;
      }

      .role-description {
        font-size: 12px;
      }

      .thread-inner {
        gap: 26px;
        padding: 28px 20px 24px;
      }

      .hero h2 {
        font-size: 37px;
      }

      .hero p {
        font-size: 13px;
      }

      .bubble {
        max-width: 94%;
        font-size: 14px;
      }

      .composer-wrap {
        padding: 12px 16px calc(14px + env(safe-area-inset-bottom));
      }

      .composer {
        min-height: 54px;
        padding-left: 15px;
        border-radius: 14px;
      }

      .send {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }

      .hint {
        margin-top: 10px;
        font-size: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    }
  </style>
</head>

<body>
  <div class="app" id="app">

    <header>
      <a class="brand" href="/" aria-label="Allways 홈">
        <img src="/allways.svg" alt="Allways" />
      </a>

      <div class="header-actions">
        <button class="header-button new-chat" id="newChat" type="button">
          새 대화
        </button>

        <button
          class="header-button role-badge"
          id="roleBadge"
          type="button"
          title="역할 변경"
          aria-label="역할 변경"
        ></button>
      </div>
    </header>

    <section class="picker" aria-labelledby="pickerTitle">
      <div class="picker-inner">
        <p class="eyebrow">ALLWAYS</p>

        <h1 id="pickerTitle">서로 이해하고<br />함께 소통합니다.</h1>

        <p class="picker-description">
          교사와 학생, 교육청을 연결하고<br />
          교육 현장의 다양한 업무를 지원합니다.
        </p>

        <div class="roles">
          <button class="role" type="button" data-role="teacher">
            <span class="role-copy">
              <strong>교사</strong>
              <span class="role-description">
                교육 활동, 수업 운영, 자료 작성 및 업무 지원
              </span>
            </span>
            <span class="role-arrow" aria-hidden="true">→</span>
          </button>

          <button class="role" type="button" data-role="student">
            <span class="role-copy">
              <strong>학생</strong>
              <span class="role-description">
                학교생활 이해, 교육 활동 안내, 의견 전달
              </span>
            </span>
            <span class="role-arrow" aria-hidden="true">→</span>
          </button>

          <button class="role" type="button" data-role="office">
            <span class="role-copy">
              <strong>교육청 관계자</strong>
              <span class="role-description">
                학교 운영 현황, 계획 검토, 예산안 확인 및 업무 지원
              </span>
            </span>
            <span class="role-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>

    <main id="thread" aria-label="대화 내용" aria-live="polite">
      <div class="thread-inner" id="list">
        <section class="hero">
          <p class="hero-label">ALLWAYS</p>
          <h2>함께 이해하고<br />명확하게 소통하세요.</h2>
          <p id="heroText"></p>
        </section>
      </div>
    </main>

    <div class="composer-wrap">
      <form class="composer" id="form">
        <textarea
          id="prompt"
          rows="1"
          placeholder="메시지를 입력하세요"
          aria-label="메시지"
        ></textarea>

        <button
          class="send"
          id="send"
          type="submit"
          aria-label="메시지 보내기"
          disabled
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>

      <div class="hint">Enter 전송 · Shift + Enter 줄바꿈</div>
    </div>

  </div>

  <script>
    (function () {
      "use strict";

      var $ = function (id) {
        return document.getElementById(id);
      };

      var app = $("app");
      var list = $("list");
      var thread = $("thread");
      var input = $("prompt");
      var send = $("send");
      var form = $("form");

      var ROLES = {
        teacher: {
          label: "교사",
          intro:
            "교육 활동과 수업 운영, 자료 작성 등 학교 업무에 필요한 내용을 함께 정리해 보세요.",
          system:
            "당신은 교사, 학생, 교육청 간의 이해와 소통을 돕는 Allways의 AI 업무 지원 도우미입니다. 교사의 관점에서 교육 활동, 수업 운영, 자료 작성, 학교 업무를 지원합니다. 질문의 맥락을 파악하고 명확하고 실용적인 한국어로 답변하세요. 예산 관련 질문은 필요한 경우에만 다루며, 근거가 없는 수치나 규정을 만들어 내지 마세요."
        },

        student: {
          label: "학생",
          intro:
            "학교생활과 교육 활동에 관해 궁금한 점을 알아보고, 생각과 의견을 정리해 보세요.",
          system:
            "당신은 교사, 학생, 교육청 간의 이해와 소통을 돕는 Allways의 AI 도우미입니다. 학생이 학교생활, 교육 활동, 학교 운영과 관련된 내용을 이해하고 자신의 의견을 명확하게 표현하도록 지원합니다. 학생의 눈높이에 맞춰 쉽고 정확한 한국어로 답변하세요. 질문과 관련이 없는 주제를 억지로 연결하지 마세요."
        },

        office: {
          label: "교육청 관계자",
          intro:
            "학교 현황과 운영 계획을 검토하고, 필요한 업무 자료와 예산안을 확인해 보세요.",
          system:
            "당신은 교사, 학생, 교육청 간의 이해와 소통을 돕는 Allways의 AI 업무 지원 도우미입니다. 교육청 관계자의 업무를 지원하며 학교 운영 현황 분석, 계획서 검토, 업무 자료 작성, 예산안 항목과 산출 근거 확인 등을 돕습니다. 예산안을 검토할 때는 제공된 자료를 근거로 항목별 금액, 합계, 산출 근거, 누락 가능성 및 확인이 필요한 사항을 구분하세요. 실제 자료가 제공되지 않았다면 내용을 추정해 사실처럼 말하지 마세요. 관련 규정이나 정책은 확인 가능한 근거를 바탕으로 설명하고 한국어로 답변하세요."
        }
      };

      var role = null;
      var busy = false;

      function autosize() {
        input.style.height = "24px";
        input.style.overflowY = "hidden";

        var nextHeight = Math.min(input.scrollHeight, 180);
        input.style.height = nextHeight + "px";

        if (input.scrollHeight > 180) {
          input.style.overflowY = "auto";
        }

        send.disabled = busy || !input.value.trim();
      }

      function scrollDown() {
        thread.scrollTop = thread.scrollHeight;
      }

      function addMessage(type, text) {
        var row = document.createElement("div");
        row.className = "msg " + type;

        var bubble = document.createElement("div");
        bubble.className = "bubble";

        if (text != null) {
          bubble.textContent = text;
        }

        row.appendChild(bubble);
        list.appendChild(row);
        scrollDown();

        return {
          row: row,
          bubble: bubble
        };
      }

      async function ask(rawText) {
        var text = String(rawText || "").trim();

        if (busy || !text || !role) {
          return;
        }

        var selectedRole = role;

        busy = true;
        autosize();

        app.classList.add("chatting");
        addMessage("user", text);

        input.value = "";
        autosize();

        var ai = addMessage("ai");

        var typing = document.createElement("span");
        typing.className = "typing";
        typing.setAttribute("aria-label", "답변 작성 중");

        for (var i = 0; i < 3; i++) {
          typing.appendChild(document.createElement("i"));
        }

        ai.bubble.appendChild(typing);

        var started = performance.now();

        try {
          var res = await fetch("/api/worker-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              prompt: text,
              system: selectedRole.system
            })
          });

          var data = await res.json().catch(function () {
            return null;
          });

          if (!res.ok || !data) {
            throw new Error(
              (data && data.error) ||
              ("요청 실패 (" + res.status + ")")
            );
          }

          var reply =
            data.response != null
              ? String(data.response)
              : JSON.stringify(data, null, 2);

          ai.bubble.textContent = reply || "(빈 응답)";

          var meta = document.createElement("div");
          meta.className = "meta";
          meta.textContent =
            ((performance.now() - started) / 1000).toFixed(1) + "초";

          ai.bubble.appendChild(meta);

        } catch (err) {
          ai.row.classList.add("error");
          ai.bubble.textContent =
            "요청을 처리하지 못했습니다. " +
            (err.message || "잠시 후 다시 시도해 주세요.");

        } finally {
          busy = false;
          autosize();
          scrollDown();
        }
      }

      function clearChat() {
        list.querySelectorAll(".msg").forEach(function (message) {
          message.remove();
        });

        app.classList.remove("chatting");
        input.value = "";
        autosize();
        thread.scrollTop = 0;
      }

      function selectRole(key) {
        if (busy || !ROLES[key]) {
          return;
        }

        role = ROLES[key];

        $("roleBadge").textContent = role.label + " · 변경";
        $("heroText").textContent = role.intro;

        clearChat();

        app.classList.add("has-role");
        input.focus();
      }

      input.addEventListener("input", autosize);

      input.addEventListener("keydown", function (e) {
        // 한글 IME 조합 중 Enter 입력은 전송하지 않습니다.
        if (
          e.key === "Enter" &&
          !e.shiftKey &&
          !e.isComposing &&
          e.keyCode !== 229
        ) {
          e.preventDefault();
          form.requestSubmit();
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        ask(input.value);
      });

      document.querySelectorAll("[data-role]").forEach(function (button) {
        button.addEventListener("click", function () {
          selectRole(button.getAttribute("data-role"));
        });
      });

      $("roleBadge").addEventListener("click", function () {
        if (busy) {
          return;
        }

        clearChat();
        role = null;
        app.classList.remove("has-role");
      });

      $("newChat").addEventListener("click", function () {
        if (busy) {
          return;
        }

        clearChat();
        input.focus();
      });

      autosize();
    })();
  </script>
</body>
</html>`;
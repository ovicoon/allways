export const HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#000000" />
  <title>Allways</title>
  <link rel="icon" type="image/svg+xml" href="/allways.svg" />

  <style>
    :root {
      color-scheme: dark;
      --bg: #000000;
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
      min-height: 80px;
      margin: 0 auto;
      padding: 16px 32px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      text-decoration: none;
    }

    .brand .logo {
      display: block;
      width: auto;
      height: 48px;
      max-width: min(280px, 58vw);
      object-fit: contain;
      object-position: left center;
    }

    /* Allways 캐릭터 (1024px 이미지의 여백을 잘라 가운데 캐릭터만 보이게 한다) */

    .character {
      --w: 64px;
      position: relative;
      display: block;
      flex: none;
      width: var(--w);
      height: calc(var(--w) * 0.75);
      overflow: hidden;
    }

    .character img {
      position: absolute;
      top: calc(var(--w) * -0.40625);
      left: calc(var(--w) * -0.5);
      width: calc(var(--w) * 2);
      height: calc(var(--w) * 2);
      max-width: none;
      image-rendering: pixelated;
    }

    /* AI 말풍선마다 붙는 프로필 사진 */

    .avatar {
      --w: 48px;
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
      padding: 16px 24px 32px;
    }

    .picker-inner {
      width: 100%;
      max-width: var(--content-width);
      margin: 0 auto;
    }

    .eyebrow {
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .picker h1 {
      margin: 0 0 24px;
      font-size: clamp(22px, 3.5vw, 30px);
      line-height: 1.3;
      font-weight: 600;
      letter-spacing: -0.04em;
      word-break: keep-all;
      color: var(--text);
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
      min-height: 74px;
      padding: 14px 6px;
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
      gap: 4px;
      min-width: 0;
    }

    .role strong {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -0.025em;
    }

    .role-description {
      color: var(--muted);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
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

    /* 역할 선택 후 첫 화면에서 눈을 깜빡이는 캐릭터 */

    .hero-character {
      --w: 96px;
      --look-x: 0;
      --look-y: 0;
      margin: 0 0 20px;
    }

    /* 눈 레이어. --look-x/y 는 캐릭터 도트 1칸(var(--w) / 16) 단위 */

    .hero-character .eyes {
      transform: translate(
        calc(var(--look-x) * var(--w) / 16),
        calc(var(--look-y) * var(--w) / 16)
      );
      transition: transform 120ms ease-out;
    }

    .hero-character.blinking .eyes {
      visibility: hidden;
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
      align-items: flex-start;
      gap: 12px;
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
      flex: 1;
      max-width: 100%;
      padding-top: 2px;
    }

    .msg.ai.error .bubble {
      color: #d0d0d0;
    }

    /* Markdown (AI 답변 전용) */

    .bubble.markdown {
      white-space: normal;
    }

    .markdown > :first-child {
      margin-top: 0;
    }

    .markdown > :last-child {
      margin-bottom: 0;
    }

    .markdown p,
    .markdown ul,
    .markdown ol,
    .markdown pre,
    .markdown table,
    .markdown blockquote {
      margin: 0 0 14px;
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .markdown h4 {
      margin: 22px 0 10px;
      line-height: 1.5;
      font-weight: 600;
    }

    .markdown h1 { font-size: 1.35em; }
    .markdown h2 { font-size: 1.2em; }
    .markdown h3,
    .markdown h4 { font-size: 1.05em; }

    .markdown ul,
    .markdown ol {
      padding-left: 22px;
    }

    .markdown li + li {
      margin-top: 4px;
    }

    .markdown strong {
      font-weight: 600;
    }

    .markdown a {
      color: var(--text);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .markdown code {
      padding: 2px 6px;
      border-radius: 6px;
      background: var(--surface-hover);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 0.88em;
    }

    .markdown pre {
      padding: 14px 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      overflow-x: auto;
      line-height: 1.6;
    }

    .markdown pre code {
      padding: 0;
      background: none;
      white-space: pre;
    }

    .markdown blockquote {
      padding-left: 14px;
      border-left: 3px solid var(--border);
      color: var(--muted);
    }

    .markdown table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
      font-size: 0.93em;
      line-height: 1.6;
    }

    .markdown th,
    .markdown td {
      padding: 7px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    .markdown th {
      background: var(--surface);
      font-weight: 600;
    }

    .markdown hr {
      margin: 20px 0;
      border: 0;
      border-top: 1px solid var(--border);
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
      margin-left: 6px;
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
        min-height: 72px;
        padding: 16px 20px;
      }

      .brand .logo {
        height: 40px;
        max-width: 58vw;
      }

      .avatar {
        --w: 40px;
      }

      .msg.ai {
        gap: 8px;
      }

      .header-actions {
        gap: 14px;
      }

      .header-button {
        font-size: 12px;
      }

      .picker {
        align-items: flex-start;
        padding: 20px 20px 28px;
      }

      .picker h1 {
        margin-bottom: 18px;
        font-size: 20px;
      }

      .role {
        min-height: 66px;
        padding: 12px 2px;
      }

      .role strong {
        font-size: 14px;
      }

      .role-description {
        font-size: 11px;
      }

      .thread-inner {
        gap: 26px;
        padding: 28px 20px 24px;
      }

      .hero h2 {
        font-size: 37px;
      }

      .hero-character {
        --w: 80px;
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
        <img class="logo" src="/allways.svg" alt="Allways" />
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
        <h1 id="pickerTitle">참여할 교육 공동체를 선택하세요</h1>

        <div class="roles">
          <button class="role" type="button" data-role="school">
            <span class="role-copy">
              <strong>학교 관련자</strong>
              <span class="role-description">
                교육 활동, 학교 행정 업무, 민원 확인 및 답변 등록
              </span>
            </span>
            <span class="role-arrow" aria-hidden="true">→</span>
          </button>

          <button class="role" type="button" data-role="family">
            <span class="role-copy">
              <strong>학생 및 학부모</strong>
              <span class="role-description">
                학교생활 이해, 교육 활동 안내, 의견 및 민원 전달
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
          <span class="character hero-character" id="heroCharacter" aria-hidden="true">
            <img src="/Allways%20character/closed%20eyes/1.png" alt="" />
            <img class="eyes" src="/Allways%20character/eyes/1.png" alt="" />
          </span>
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
    </div>

  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js"></script>
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
        school: {
          label: "학교 관련자",
          intro:
            "교육 활동과 학교 행정 업무를 정리하고, 접수된 민원을 확인해 답변을 등록해 보세요.",
          system:
            "당신은 학교 구성원 간의 소통을 돕는 Allways의 AI 업무 지원 도우미입니다. 교직원 등 학교 관련자의 관점에서 교육 활동, 수업 운영, 자료 작성, 학교 행정 업무, 예산 집행, 시설 관리 및 민원 답변 업무를 지원합니다. 명확하고 실용적인 한국어로 답변하며, 근거가 없는 규정이나 수치를 만들어 내지 마세요."
        },

        family: {
          label: "학생 및 학부모",
          intro:
            "학교생활과 교육 활동에 관해 궁금한 점을 알아보고, 의견이나 민원을 전달해 보세요.",
          system:
            "당신은 학교 구성원 간의 소통을 돕는 Allways의 AI 도우미입니다. 학생과 학부모가 학교생활, 교육 활동, 가정 연계 교육, 학교 운영과 관련된 내용을 이해하고 자신의 의견을 명확하게 전달하도록 지원합니다. 학생도 이해할 수 있도록 쉽고 친절하며 정확한 한국어로 답변하고, 근거가 없는 규정이나 사실을 만들어 내지 마세요."
        }
      };

      // AI 말풍선 프로필 사진으로 쓰는 Allways 캐릭터. thinking 애니메이션은 파일명 번호 순서가 프레임 순서
      var CHARACTER_DIR = "/Allways%20character/";
      var CHARACTER_DEFAULT = CHARACTER_DIR + "default.png";
      var THINKING_FRAMES = [1, 2, 3, 4, 5].map(function (n) {
        return CHARACTER_DIR + "thinking/" + n + ".png";
      });
      var THINKING_FRAME_MS = 180;
      var thinkingTimer = null;
      var thinkingImg = null;
      var framesPreloaded = false;

      // 첫 화면 캐릭터 눈 깜빡임 (눈 레이어를 잠깐 숨김). 간격은 BLINK_INTERVAL_MS + (0 ~ BLINK_OFFSET_MS)
      var BLINK_CLOSED_MS = 140;
      var BLINK_INTERVAL_MS = 4000;
      var BLINK_OFFSET_MS = 800;
      var blinkTimer = null;
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      // 눈이 마우스 쪽을 바라본다. 멀수록 더 쏠리지만 LOOK_MAX_X/Y(도트 칸 수)를 넘지 않는다
      var LOOK_MAX_X = 1;
      var LOOK_MAX_Y = 0.75;
      var LOOK_REACH_PX = 320;
      var lookFrame = null;

      var role = null;
      var busy = false;
      // 현재 대화의 이전 질문/답변. 매 요청에 함께 보내 모델이 맥락을 기억하게 한다 (새 대화/역할 변경 시 초기화)
      var history = [];

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

        var avatarImg = null;

        if (type === "ai") {
          var avatar = document.createElement("span");
          avatar.className = "character avatar";
          avatar.setAttribute("aria-hidden", "true");

          avatarImg = document.createElement("img");
          avatarImg.src = CHARACTER_DEFAULT;
          avatarImg.alt = "";
          avatar.appendChild(avatarImg);
          row.appendChild(avatar);
        }

        row.appendChild(bubble);
        list.appendChild(row);
        scrollDown();

        return {
          row: row,
          bubble: bubble,
          avatar: avatarImg
        };
      }

      // 프레임 전환 때 깜빡이지 않도록 미리 불러 둔다
      function preloadFrames() {
        if (framesPreloaded) {
          return;
        }

        framesPreloaded = true;
        THINKING_FRAMES.forEach(function (src) {
          new Image().src = src;
        });
      }

      function startBlinking() {
        var character = $("heroCharacter");

        stopBlinking();

        if (reduceMotion.matches) {
          return;
        }

        function schedule() {
          blinkTimer = setTimeout(
            blink,
            BLINK_INTERVAL_MS + Math.random() * BLINK_OFFSET_MS
          );
        }

        function blink() {
          character.classList.add("blinking");

          blinkTimer = setTimeout(function () {
            character.classList.remove("blinking");
            schedule();
          }, BLINK_CLOSED_MS);
        }

        schedule();
      }

      function stopBlinking() {
        if (blinkTimer) {
          clearTimeout(blinkTimer);
          blinkTimer = null;
        }

        $("heroCharacter").classList.remove("blinking");
      }

      // 포인터 위치를 받아 눈 위치를 정한다. 거리에 따라 tanh 로 완만하게 한계까지 쏠림
      // 포인터가 창 밖으로 나가도 마지막 위치를 그대로 바라본다
      function lookAt(x, y) {
        var character = $("heroCharacter");
        var lookX = 0;
        var lookY = 0;

        if (!reduceMotion.matches) {
          var rect = character.getBoundingClientRect();
          var dx = x - (rect.left + rect.width / 2);
          var dy = y - (rect.top + rect.height / 2);
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0) {
            var pull = Math.tanh(dist / LOOK_REACH_PX);
            lookX = (dx / dist) * pull * LOOK_MAX_X;
            lookY = (dy / dist) * pull * LOOK_MAX_Y;
          }
        }

        character.style.setProperty("--look-x", lookX.toFixed(3));
        character.style.setProperty("--look-y", lookY.toFixed(3));
      }

      function queueLook(x, y) {
        if (lookFrame) {
          cancelAnimationFrame(lookFrame);
        }

        lookFrame = requestAnimationFrame(function () {
          lookFrame = null;
          lookAt(x, y);
        });
      }

      // 지금 생성 중인 답변의 프로필 사진(img)만 thinking 프레임으로 돌린다
      function startThinking(img) {
        var frame = 0;

        stopThinking();
        thinkingImg = img;

        function show() {
          img.src = THINKING_FRAMES[frame];
          frame = (frame + 1) % THINKING_FRAMES.length;
        }

        show();
        thinkingTimer = setInterval(show, THINKING_FRAME_MS);
      }

      function stopThinking() {
        if (thinkingTimer) {
          clearInterval(thinkingTimer);
          thinkingTimer = null;
        }

        if (thinkingImg) {
          thinkingImg.src = CHARACTER_DEFAULT;
          thinkingImg = null;
        }
      }

      // AI 답변만 Markdown 으로 렌더링한다. 라이브러리를 못 불러오면 일반 텍스트로 표시
      function renderMarkdown(el, text) {
        if (window.marked && window.DOMPurify) {
          el.innerHTML = DOMPurify.sanitize(marked.parse(text, { gfm: true, breaks: true }));
          el.classList.add("markdown");
        } else {
          el.textContent = text;
        }
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
        startThinking(ai.avatar);

        var started = performance.now();

        try {
          var res = await fetch("/api/worker-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              prompt: text,
              history: history,
              system: selectedRole.system,
              // 데모이므로 고른 역할을 그대로 보낸다 (서버는 "school" 일 때만 민원 답변 등록 허용)
              role: selectedRole.key
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

          // 민원 접수용 >>>EXECUTE SQL: 표시는 답변 맨 끝에 오므로, 표시부터 끝까지 잘라낸다
          var marker = reply.lastIndexOf(">>>EXECUTE SQL:");
          if (marker !== -1) {
            reply = reply.slice(0, marker).trim();
          }

          if (reply) {
            renderMarkdown(ai.bubble, reply);
          } else {
            ai.bubble.textContent = "(빈 응답)";
          }

          if (reply) {
            history.push(
              { role: "user", content: text },
              { role: "assistant", content: reply }
            );
          }

          var meta = document.createElement("div");
          meta.className = "meta";
          meta.textContent =
            ((performance.now() - started) / 1000).toFixed(1) + "초" +
            (data.complaint_submitted ? " · 민원 접수됨" : "") +
            (data.complaint_answered ? " · 민원 답변 등록됨" : "");

          ai.bubble.appendChild(meta);

        } catch (err) {
          ai.row.classList.add("error");
          ai.bubble.classList.remove("markdown");
          ai.bubble.textContent =
            "요청을 처리하지 못했습니다. " +
            (err.message || "잠시 후 다시 시도해 주세요.");

        } finally {
          stopThinking();
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
        history = [];
        input.value = "";
        autosize();
        thread.scrollTop = 0;
      }

      function selectRole(key) {
        if (busy || !ROLES[key]) {
          return;
        }

        role = ROLES[key];
        role.key = key;

        $("roleBadge").textContent = role.label + " · 변경";
        $("heroText").textContent = role.intro;
        preloadFrames();

        clearChat();

        app.classList.add("has-role");
        startBlinking();
        input.focus();
      }

      window.addEventListener("pointermove", function (e) {
        queueLook(e.clientX, e.clientY);
      });

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
        stopBlinking();
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
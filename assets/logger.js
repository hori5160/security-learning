// assets/logger.js（ブラウザだけで完結版：localStorageにログ保存＋ダウンロード）
(function () {
  const KEY_EVENTS = "sec_learn_events";
  const KEY_SESSION = "sec_learn_session_id";
  const KEY_USER = "sec_learn_user_label";
  const KEY_SCENARIO = "sec_learn_scenario_id";
  const KEY_PAGE_ENTER = "sec_learn_page_enter_ts";

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  function nowIso() { return new Date().toISOString(); }

  function loadEvents() {
    try { return JSON.parse(localStorage.getItem(KEY_EVENTS) || "[]"); }
    catch { return []; }
  }
  function saveEvents(events) {
    localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
  }
  function pushEvent(e) {
    const events = loadEvents();
    events.push(e);
    saveEvents(events);
  }

  function getOrCreateSession() {
    let sid = localStorage.getItem(KEY_SESSION);
    if (!sid) { sid = uuid(); localStorage.setItem(KEY_SESSION, sid); }
    return sid;
  }

  function getOrAskUserLabel() {
    let u = localStorage.getItem(KEY_USER);
    if (!u) {
      u = prompt("学習者ラベルを入力（例：A01）※本名は入力しないでね") || "anon";
      u = u.trim().slice(0, 32) || "anon";
      localStorage.setItem(KEY_USER, u);
    }
    return u;
  }

  function getScenarioId() {
    return localStorage.getItem(KEY_SCENARIO) || "unknown";
  }

  function log(event_type, target = "", meta = {}) {
    const entry = {
      ts: nowIso(),
      session_id: getOrCreateSession(),
      user_label: getOrAskUserLabel(),
      scenario_id: getScenarioId(),
      event_type,
      page: location.pathname || location.href, // file://対策
      target,
      meta,
    };
    pushEvent(entry);
  }

  function flushDwell() {
    const enter = Number(localStorage.getItem(KEY_PAGE_ENTER) || Date.now());
    const dwellMs = Date.now() - enter;
    localStorage.setItem(KEY_PAGE_ENTER, String(Date.now()));
    log("dwell", "", { dwellMs });
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportJSON() {
    const events = loadEvents();
    download(`behavior_log_${getOrCreateSession()}.json`, JSON.stringify(events, null, 2));
  }

  function exportCSV() {
    const events = loadEvents();
    const header = ["ts","session_id","user_label","scenario_id","event_type","page","target","meta_json"];
    const rows = events.map(e => ([
      e.ts, e.session_id, e.user_label, e.scenario_id, e.event_type,
      e.page, e.target, JSON.stringify(e.meta || {})
    ]).map(v => `"${String(v).replaceAll('"','""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `behavior_log_${getOrCreateSession()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  window.SecLogger = {
    startScenario: function (scenarioId) {
      localStorage.setItem(KEY_SCENARIO, scenarioId);
      localStorage.setItem(KEY_PAGE_ENTER, String(Date.now()));
      log("session_start", "", { scenarioId });
      log("page_view", "", { title: document.title });
    },
    log,
    endSession: function () { log("session_end", "", {}); },
    exportJSON,
    exportCSV,
    clearLogs: function () { localStorage.removeItem(KEY_EVENTS); }
  };

  // 全クリックログ
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("a,button,input,div,span");
    if (!el) return;
    const tag = el.tagName.toLowerCase();
    const text = (el.innerText || el.value || "").trim().slice(0, 60);
    const href = el.getAttribute && el.getAttribute("href");
    const id = el.id ? `#${el.id}` : "";
    const cls = el.className ? "." + String(el.className).trim().split(/\s+/).slice(0, 3).join(".") : "";
    const target = `${tag}${id}${cls}`;
    log("click", target, { text, href });
  });

  // ページ離脱で滞在時間
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushDwell();
  });
  window.addEventListener("beforeunload", () => { flushDwell(); });
})();

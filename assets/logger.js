// assets/logger.js（最小版：必要なものだけ＝decision中心／localStorage保存＋CSV出力）
(function () {
  const KEY_EVENTS   = "sec_learn_events";
  const KEY_SESSION  = "sec_learn_session_id";
  const KEY_USER     = "sec_learn_user_label";
  const KEY_SCENARIO = "sec_learn_scenario_id";

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

  function setUserLabel(label) {
    const v = String(label || "").trim().slice(0, 32);
    if (v) localStorage.setItem(KEY_USER, v);
  }

  function getUserLabelFromUrl() {
    try {
      const u = new URLSearchParams(location.search).get("u");
      if (u) {
  localStorage.setItem("user_label", u);
}
const user_label = localStorage.getItem("user_label") || "anon";
      if (!u) return "";
      const v = u.trim().slice(0, 32);
      // 変な文字が入らないよう軽く制限（A01, user-01 など想定）
      if (!/^[A-Za-z0-9_-]{1,32}$/.test(v)) return "";
      return v;
    } catch { return ""; }
  }

  function getOrAskUserLabel() {
    let u = localStorage.getItem(KEY_USER) || "";
    if (u) return u;

    const uParam = getUserLabelFromUrl();
    if (uParam) {
      setUserLabel(uParam);
      return uParam;
    }

    // URLに ?u=A01 を付けて配布するのが基本（無いときだけ入力）
    u = (prompt("参加者IDを入力（例：A01）※本名は入力しないでね") || "").trim().slice(0, 32);
    if (!u) u = "anon";
    setUserLabel(u);
    return u;
  }

  function getScenarioId() {
    return localStorage.getItem(KEY_SCENARIO) || "unknown";
  }

  // 起動時にURLの ?u= があれば自動セット（以後はlocalStorageに残る）
  const bootLabel = getUserLabelFromUrl();
  if (bootLabel) setUserLabel(bootLabel);

  function log(event_type, target = "", meta = {}) {
    const entry = {
      ts: nowIso(),
      session_id: getOrCreateSession(),
      user_label: getOrAskUserLabel(),
      scenario_id: getScenarioId(),
      event_type,
      page: location.pathname || location.href,
      target,
      meta,
    };
    pushEvent(entry);
  }

  function downloadBlob(filename, blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportCSV() {
    const events = loadEvents();
    const header = ["ts","session_id","user_label","scenario_id","event_type","page","target","meta_json"];
    const rows = events.map(e => ([
      e.ts, e.session_id, e.user_label, e.scenario_id, e.event_type,
      e.page, e.target, JSON.stringify(e.meta || {})
    ]).map(v => `"${String(v).replaceAll('"','""')}"`).join(","));

    // ★Excelの文字化け対策：UTF-8 BOM を先頭に付ける
    const csv = "\ufeff" + [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(`behavior_log_${getOrCreateSession()}.csv`, blob);
  }

  function clearLogs() {
    localStorage.removeItem(KEY_EVENTS);
  }

  window.SecLogger = {
    startScenario: function (scenarioId) {
      localStorage.setItem(KEY_SCENARIO, scenarioId);
      log("session_start", "", { scenarioId });
      log("page_view", "", { title: document.title });
    },
    log,
    exportCSV,
    clearLogs,
    setUserLabel,
  };
})();

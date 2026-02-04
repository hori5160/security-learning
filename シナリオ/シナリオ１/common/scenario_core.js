// scenario_core.js（全問共通のロジック）
(() => {
  const SCENARIO_KEY = "delivery10_v1";

  const LS = {
    order: `sec_${SCENARIO_KEY}_order`,
    runId: `sec_${SCENARIO_KEY}_runId`,
    state: `sec_${SCENARIO_KEY}_state`,
    weak:  `sec_${SCENARIO_KEY}_weak`,
  };

  /*追加分*/
  function toZenkaku(n){
  return String(n).replace(/[0-9]/g, c => "０１２３４５６７８９"[c]);
}
function toHankaku(s){
  return String(s).replace(/[０-９]/g, c => "0123456789"["０１２３４５６７８９".indexOf(c)]);
}
function folderName(q){              // 1 -> "１問"
  return `${toZenkaku(q)}問`;
}


  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
    catch { return fallback; }
  }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function nowId() { return `${Date.now()}_${Math.random().toString(16).slice(2)}`; }

  // --- QuizState（あなたのAPI互換：setAnswer/clear/summary） ---
  const QuizState = {
    load() { return load(LS.state, { answers: {}, startedAt: Date.now() }); },
    save(st) { save(LS.state, st); },

    setAnswer(q, isCorrect, choice, correct) {
      const st = this.load();
      st.answers[String(q)] = { q, isCorrect: !!isCorrect, choice, correct, at: Date.now() };
      this.save(st);
    },

    clear() { localStorage.removeItem(LS.state); },

    summary(total = 10) {
      const st = this.load();
      let correctCount = 0;
      for (let i = 1; i <= total; i++) {
        const a = st.answers[String(i)];
        if (a && a.isCorrect) correctCount++;
      }
      return { total, correct: correctCount, wrong: total - correctCount, state: st };
    },

    getWrongList(total = 10) {
      const st = this.load();
      const wrongs = [];
      for (let i = 1; i <= total; i++) {
        const a = st.answers[String(i)];
        if (a && !a.isCorrect) wrongs.push(i);
      }
      return wrongs;
    }
  };

  // --- QuizFlow（出題順：誤答優先＋残りシャッフル） ---
  const QuizFlow = {
    ensureOrder(total = 10, { adaptive = true } = {}) {
      let order = load(LS.order, null);
      if (!order || !Array.isArray(order) || order.length !== total) {
        this.startNewRun(total, { adaptive });
        order = load(LS.order, []);
      }
      return { order, runId: load(LS.runId, null) };
    },

    startNewRun(total = 10, { adaptive = true } = {}) {
      const base = Array.from({ length: total }, (_, i) => i + 1);

      let weak = [];
      if (adaptive) {
        weak = QuizState.getWrongList(total);
        save(LS.weak, weak);
      }

      const weakSet = new Set(weak);
      const weakPart = weak.filter(n => n >= 1 && n <= total);
      const restPart = base.filter(n => !weakSet.has(n));

      const order = weakPart.concat(shuffle(restPart));
      save(LS.order, order);
      save(LS.runId, nowId());
      return order;
    },

    getOrder() { return load(LS.order, []); },

    getNextQ(currentQ) {
      const order = this.getOrder();
      const idx = order.indexOf(Number(currentQ));
      if (idx < 0) return null;
      return order[idx + 1] ?? null;
    },

    getPos(currentQ) {
      const order = this.getOrder();
      const idx = order.indexOf(Number(currentQ));
      return idx >= 0 ? (idx + 1) : null;
    }
  };

function renderProgress(q, total = 10) {
  try {
    // 順番が無ければ作る（既にあれば維持）
    QuizFlow.ensureOrder(total, { adaptive: true });

    const pos = QuizFlow.getPos(q) ?? q; // posが取れなければqで代用
    const text = `第${pos}問 / 全${total}問`;

    // クイズ画面のバッジがあれば更新
    const badge = document.querySelector(".quiz-badge");
    if (badge) badge.textContent = text;

    // 上部に progressChip があれば更新
    const chip = document.getElementById("progressChip");
    if (chip) chip.textContent = text;
  } catch (e) {
    console.warn("renderProgress error:", e);
  }
}

// 既に存在していたら上書きしない（事故防止）
if (!window.QuizState) window.QuizState = QuizState;
if (!window.QuizFlow)  window.QuizFlow  = QuizFlow;

// ★追加：HTML側から使う補助関数も公開する
if (!window.folderName) window.folderName = folderName;
if (!window.toZenkaku)  window.toZenkaku  = toZenkaku;
if (!window.toHankaku)  window.toHankaku  = toHankaku;

if (!window.renderProgress) window.renderProgress = renderProgress;

})();



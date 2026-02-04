// scenario_config.js（例：1問）← SCだけにする
window.SC = {
  no: 3,
  total: 10,
  correct: "phish",
  nextQuiz: "../４問/quiz_delivery.html",

  inbox: { /* ... */ },
  sms:   { /* ... */ },
  cues: ["SMSでURL", "短縮URL", "24時間以内"],
  bias: ["焦らせ", "不安", "公式っぽさ"]
};

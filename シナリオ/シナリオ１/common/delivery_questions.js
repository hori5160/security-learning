// delivery_questions.js
// 10問ぶんの「表示文面」と「学習ポイント」をここだけで管理する

window.Delivery10 = (() => {
  const TOTAL = 10;
  const SCENARIO_ID = "delivery10"; // localStorageのsec_learn_scenario_idと合わせる

  // 全問「本当はフィッシング」想定（= 二択の正解は phish）
  // もし混ぜたくなったら correct を "safe" にした問題も作れます。
  const QUESTIONS = [
    {
      q: 1,
      title: "宅配便の通知",
      sender: "090-1234-5678",
      date: "10:35",
      snippet: "不在のためお荷物を持ち帰りました。24時間以内に確認して...",
      smsBody:
        "【〇〇急便】不在のため荷物を持ち帰りました。24時間以内に確認してください。",
      urlText: "https://t.co/s3fbabFWTO",
      fakeDomainForLog: "re-delivery-example.com/confirm",
      webTitle: "再配達の手続き",
      webSub: "※お荷物番号：A-10XXXX",
      webLead: "再配達のため、受取情報の確認が必要です。",
      webWarn: "※住所・電話番号を入力してください",
      correct: "phish",
      cues: ["SMSでURL", "短縮URL", "24時間以内"],
      bias: ["焦らせ", "公式っぽさ", "不安"]
    },

    {
      q: 2,
      title: "料金未払い（利用停止）",
      sender: "080-44xx-33xx",
      date: "12:10",
      snippet: "重要：本日中に手続きが無い場合、回線が停止されます...",
      smsBody:
        "【通信サポート】未払いが確認されました。本日中に手続きが無い場合、回線が停止されます。",
      urlText: "https://bit.ly/3x-STOP",
      fakeDomainForLog: "carrier-billing-check.example/stop",
      webTitle: "お支払い確認",
      webSub: "サポート窓口",
      webLead: "本人確認のため、情報の入力が必要です。",
      webWarn: "※電話番号・住所を入力してください",
      correct: "phish",
      cues: ["本日中", "短縮URL", "回線停止で焦らせる"],
      bias: ["焦らせ", "損失回避", "不安"]
    },

    {
      q: 3,
      title: "アカウント異常ログイン",
      sender: "Security",
      date: "18:02",
      snippet: "不審なログインが検出されました。本人確認が必要です...",
      smsBody:
        "【セキュリティ】不審なログインが検出されました。今すぐ本人確認を行ってください。",
      urlText: "https://t.co/verify-acc",
      fakeDomainForLog: "account-verify.example/login",
      webTitle: "本人確認",
      webSub: "セキュリティ確認",
      webLead: "アカウント保護のため、確認が必要です。",
      webWarn: "※氏名・電話番号・住所を入力してください",
      correct: "phish",
      cues: ["今すぐ", "送信元が曖昧", "短縮URL"],
      bias: ["焦らせ", "権威っぽさ", "不安"]
    },

    {
      q: 4,
      title: "友だち写真（なりすまし）",
      sender: "友だち",
      date: "20:44",
      snippet: "これ見て！写真送るね→...",
      smsBody:
        "これ見て！写真送るね→（URL）",
      urlText: "https://tinyurl.com/pic-xx",
      fakeDomainForLog: "photo-share.example/view",
      webTitle: "写真を表示",
      webSub: "共有アルバム",
      webLead: "表示するには確認が必要です。",
      webWarn: "※氏名・電話番号を入力してください",
      correct: "phish",
      cues: ["知人を装う", "短縮URL", "確認を要求"],
      bias: ["親近感", "好奇心", "焦らせ"]
    },

    {
      q: 5,
      title: "学校アカウント期限",
      sender: "School-IT",
      date: "08:05",
      snippet: "アカウント期限が本日で切れます。更新してください...",
      smsBody:
        "【学校IT】アカウント期限が本日で切れます。更新してください。",
      urlText: "https://bit.ly/school-renew",
      fakeDomainForLog: "edu-renew.example/update",
      webTitle: "アカウント更新",
      webSub: "学校サポート",
      webLead: "期限切れを防ぐため更新が必要です。",
      webWarn: "※氏名・電話番号・住所を入力してください",
      correct: "phish",
      cues: ["本日で切れる", "短縮URL", "SMSで届く違和感"],
      bias: ["焦らせ", "権威っぽさ", "不安"]
    },

    {
      q: 6,
      title: "フリマ購入確認",
      sender: "Flema",
      date: "14:18",
      snippet: "発送のため住所確認が必要です。こちらから...",
      smsBody:
        "【フリマ】発送のため住所確認が必要です。こちらから入力してください。",
      urlText: "https://t.co/address",
      fakeDomainForLog: "flea-address.example/input",
      webTitle: "発送先住所の確認",
      webSub: "注文番号：F-22XXXX",
      webLead: "発送のため、受取情報の確認が必要です。",
      webWarn: "※住所・電話番号を入力してください",
      correct: "phish",
      cues: ["住所入力を急かす", "短縮URL", "取引アプリで確認すべき"],
      bias: ["利便性", "焦らせ", "損失回避"]
    },

    {
      q: 7,
      title: "有料登録完了（ワンクリック系）",
      sender: "Support",
      date: "23:11",
      snippet: "有料登録が完了しました。キャンセルはこちら...",
      smsBody:
        "【重要】有料登録が完了しました。キャンセルはこちら。",
      urlText: "https://tinyurl.com/cancel-xx",
      fakeDomainForLog: "billing-cancel.example/cancel",
      webTitle: "キャンセル手続き",
      webSub: "サポート",
      webLead: "本人確認のため情報が必要です。",
      webWarn: "※氏名・電話番号・住所を入力してください",
      correct: "phish",
      cues: ["勝手に完了", "キャンセルで誘導", "短縮URL"],
      bias: ["不安", "焦らせ", "損失回避"]
    },

    {
      q: 8,
      title: "当選（クーポン）",
      sender: "Campaign",
      date: "16:30",
      snippet: "おめでとうございます！当選しました。受取はこちら...",
      smsBody:
        "おめでとうございます！当選しました。受取はこちら→",
      urlText: "https://bit.ly/gift-xx",
      fakeDomainForLog: "gift-claim.example/receive",
      webTitle: "特典の受け取り",
      webSub: "キャンペーン",
      webLead: "受け取り手続きが必要です。",
      webWarn: "※氏名・電話番号・住所を入力してください",
      correct: "phish",
      cues: ["おめでとう", "短縮URL", "個人情報要求"],
      bias: ["欲望", "好奇心", "焦らせ"]
    },

    {
      q: 9,
      
    },

    {
      q: 10,
    }
  ];

  function clampQ(q) {
    const n = Number(q);
    if (!Number.isFinite(n)) return 1;
    return Math.min(TOTAL, Math.max(1, Math.floor(n)));
  }
  function getQFromUrl() {
    const p = new URLSearchParams(location.search);
    return clampQ(p.get("q") || 1);
  }
  function isEmbed() {
    const p = new URLSearchParams(location.search);
    return p.get("embed") === "1";
  }
  function getQ(q) {
    const n = clampQ(q);
    return QUESTIONS[n - 1];
  }
  function nextQ(q) {
    const n = clampQ(q);
    return n < TOTAL ? n + 1 : null;
  }

  return { TOTAL, SCENARIO_ID, QUESTIONS, clampQ, getQFromUrl, isEmbed, getQ, nextQ };
})();

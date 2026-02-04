// scenario_config.js（この問の内容だけを定義）
// ※UIは各HTML側。ここは「文面・正解・参考URL」だけを変えればOK。
window.SC = {
  no: 8,          // 何問目の内容か（表示はURLの ?q= を優先）
  total: 10,
  correct: "phish",

  // クイズ画面（2択）に出す文章
  quiz: {
    title: "携帯電話会社から料金支払いの通知が来ています。",
    subtitle: "「未払い」「利用停止」など不安をあおる内容＋URL付きSMSは要注意。",
    // 正解時：何秒後に解説へ自動遷移するか（0なら自動遷移しない）
    correctCountdownSec: 3
  },

  // 受信一覧（Messagesの一覧）1行目の文面
  inbox: {
    sender: "〇〇通信サポート",
    date: "10:35",
    snippet: "【重要】ご利用料金のお支払い確認が取れておりません。確認はこちら"
  },

  // SMS詳細（吹き出し本文とURL表示テキスト）
  sms: {
    headerDisplay: "docomoサポート",
    fromDisplay: "+81 0032069000",
    date: "10:35",
    body:
      "【〇〇通信】ご利用料金のお支払い確認ができていません。\n" +
      "本日中にお手続きがない場合、回線の一部機能が制限される可能性があります。\n" +
      "下記よりご確認ください。",
    urlText: "https://b-payments.example/confirm"
  },

  // フィッシングページ（ブラウザ画面）の文面
  phish: {
    meta: "※学習用の疑似画面です（入力内容は送信・保存しません）。",
    title: "ご利用料金のお支払い",
    description: "未納料金のお支払い確認が必要です。",
    warning: "※支払い情報を入力してください",
    button: "支払い手続きを進める",
    modalTitle: "⚠ カード情報を入力してしまいました！",
    modalBody:
      "本物の攻撃では、入力したカード情報が不正利用される可能性があります。\n" +
      "SMS内のリンクから支払いを求めるのは典型的な手口です。"
  },

  // 振り返り（解説）の見出し・ポイント
  reveal: {
    headline: "「未払い料金」「利用停止」などのSMSは、まず疑う！",
    cards: [
      {
        title: "➤ まず確認するポイント",
        items: [
          "SMSのURLはタップしない（短縮URLや不自然なドメインは特に危険）",
          "文面が急かす（本日中／24時間以内／停止予告）場合は要注意",
          "公式に見せかけた文字（docomo / pay / ntt など）でも信用しない"
        ]
      },
      {
        title: "➤ 正しい対処（確認手順）",
        items: [
          "公式アプリ（My docomo 等）や公式サイトを自分で開いて料金状況を確認",
          "SMSの送信元番号・公式ドメイン一覧と照合して判断する",
          "不安なら公式窓口へ（SMSに書かれた連絡先には連絡しない）"
        ]
      },
      {
        title: "➤ もし入力してしまったら…",
        items: [
          "カード会社に連絡して利用停止・不正利用の確認",
          "ID/パスワードを入力した場合は直ちに変更し、2段階認証を設定",
          "必要に応じて警察・消費生活センター等へ相談"
        ]
      }
    ],
    importantHtml:
      "ドコモ公式は、SMS/メール内のリンクではなく「信頼できるブックマーク等」から確認するよう注意喚起しています。<br>" +
      "<strong>URLに「docomo」が入っていても公式とは限りません。</strong>",

    refs: [
      { label: "本物のドコモ連絡か確認（送信元番号/公式URL一覧）", url: "https://www.docomo.ne.jp/info/anti-phishing/confirmation/" },
      { label: "ドコモ：フィッシング詐欺の実例", url: "https://www.docomo.ne.jp/info/anti-phishing/example/" },
      { label: "docomo：フィッシングSMSについて（plus message）", url: "https://ssw.web.docomo.ne.jp/plsmessa/plme_news/info/plusmessage-phishing.html" },
      { label: "警察庁：架空料金請求詐欺（SMS等）", url: "https://www.npa.go.jp/bureau/safetylife/sos47/case/fictitious-billing/" },
      { label: "IPA：通信事業者をかたる偽SMS（スミッシング）注意喚起", url: "https://www.ipa.go.jp/security/anshin/attention/2021/mgdayori20211222.html" }
    ]
  }
};

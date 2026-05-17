// じゃんけんの手データ
const JANKEN_HANDS = [
  { file: 'gu', alt: 'グー', emoji: '✊' },
  { file: 'cho', alt: 'チョキ', emoji: '✌️' },
  { file: 'pa', alt: 'パー', emoji: '✋' },
];

// 勝敗テーブル（行: 自分, 列: PC）
const JUDGE_TABLE = [
  ['あいこ', 'あなたの「勝ち」', 'あなたの「負け」'],
  ['あなたの「負け」', 'あいこ', 'あなたの「勝ち」'],
  ['あなたの「勝ち」', 'あなたの「負け」', 'あいこ'],
];

// 各要素を取得
const greeting = document.querySelector('#koneko-greeting');

const jankenBtns = document.querySelector('#janken-btns');
const playField = document.querySelector('#play-field');
const ready = document.querySelector('#ready');
const judgeField = document.querySelector('#judge-field');

const myHandsEl = document.querySelector('#my-hands');
const pcHandsEl = document.querySelector('#pc-hands');
const judgmentEl = document.querySelector('#judgment');

const startBtn = document.querySelector('#start-btn');
const retryArea = document.querySelector('#retry-area');
const retryBtn = document.querySelector('#retry-btn');
const presentArea = document.querySelector('#present-area');
const presentBtn = document.querySelector('#present-btn');
const returnBtn = document.querySelector('#return-btn');
const presentView = document.querySelector('#present-view');
const randomPresent = document.querySelector('#random-present');
const itemBox = document.querySelector('#item-box');

const viewYourScore = document.querySelector('#your-score');
const footPrints = document.querySelector('#foot-prints');

const helpBtn = document.querySelector('#help-btn');
const helpModal = document.querySelector('#help-modal');
const helpClose = document.querySelector('#help-close');

// オーディオまとめ
const AUDIO = {
  submit: new Audio('audio/submit.mp3'),
  nya: new Audio('audio/nya.mp3'),
  bgm: new Audio('audio/bgm.mp3'),
  gu: new Audio('audio/gu.mp3'),
  cho: new Audio('audio/cho.mp3'),
  pa: new Audio('audio/pa.mp3'),
  myHand: new Audio('audio/my-hand.mp3'),
  draw: new Audio('audio/draw.mp3'),
  win: new Audio('audio/win.mp3'),
  lose: new Audio('audio/lose.mp3'),
  wao: new Audio('audio/wao.mp3'),
  add: new Audio('audio/add.mp3'),
  lost: new Audio('audio/lost.mp3'),
  finish: new Audio('audio/finish.mp3'),
  dodon: new Audio('audio/dodon.mp3'),
  present: new Audio('audio/present.mp3'),
  retry: new Audio('audio/retry.mp3'),
};
// BGMだけはloop
AUDIO.bgm.loop = true;

const muteBtn = document.querySelector('#mute-btn');
let isMuted = false;
const iconOn = document.querySelector('#icon-volume-on');
const iconOff = document.querySelector('#icon-volume-off');
iconOff.style.display = 'none';

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  Object.values(AUDIO).forEach((audio) => {
    audio.muted = isMuted;
  });
  iconOn.style.display = isMuted ? 'none' : 'block';
  iconOff.style.display = isMuted ? 'block' : 'none';
});

//猫からのプレゼントを格納
const catPresent = [
  { img: 'nekokan', alt: '猫の缶詰', label: 'ねこのかんづめ' },
  { img: 'churu', alt: 'ちゅーる', label: 'ちゅーる' },
  { img: 'toy', alt: 'ねこじゃらし', label: 'ねこじゃらし' },
];

// 初めは勝敗などを非表示にしておく
function init() {
  playField.style.display = 'none';
  judgeField.style.display = 'none';
  presentArea.style.display = 'none';
  presentView.style.display = 'none';
  itemBox.style.display = 'none';
  helpBtn.style.display = 'none';
  renderHandButtons(); // じゃんけんの描画
  initFootPrints(); //足跡の描画
}

// じゃんけんの描画
function handImg(index) {
  const { file, alt } = JANKEN_HANDS[index];
  return `<img src="img/${file}.webp" alt="${alt}" class="w-full h-auto rounded-xl">`;
}

function renderHandButtons() {
  JANKEN_HANDS.forEach((hand, index) => {
    jankenBtns.insertAdjacentHTML(
      'beforeend',
      `
      <div class="flex items-center text-center">
        <button class="p-4 md:p-8 janken-btn hand-btn" type="button" data-hand="${index}">
          <div class="flex items-center justify-center text-7xl md:text-8xl">
            ${hand.emoji}
          </div>
        </button>
      </div>
    `,
    );
  });
}

function initFootPrints() {
  for (let i = 0; i < yourScore; i++) {
    footPrints.insertAdjacentHTML('beforeend', '🐾');
  }
}

// localStorageを参照
function getItems() {
  return JSON.parse(localStorage.getItem('koneko-items') || '[]');
}
// アイテム表示
function showItemBoxIfExists() {
  if (getItems().length > 0) {
    itemBox.style.display = 'block';
    renderItemBox();
  } else {
    itemBox.style.display = 'none';
  }
}
let activeItem = null; // 'nekokan' | 'churu' | 'toy' | null

//ゲームスタート
startBtn.addEventListener('click', function () {
  this.classList.add('active');
  AUDIO.submit.play();

  setTimeout(() => {
    AUDIO.nya.play();
    greeting.style.display = 'none';
    playField.style.display = 'block';
    showItemBoxIfExists();
    AUDIO.bgm.play();
  }, 1000);
});

// 特典をカウントする変数を初期化
let yourScore = 3;

function playJanken(myHand) {
  // ▼ テスト用（使うときはコメントを外す）============
  // 必ず勝てる
  // const pcHand = [1, 2, 0][myHand];

  // 必ず負ける
  // const pcHand = [2, 0, 1][myHand];

  // 必ずあいこ
  // const pcHand = myHand;
  // ▲ テストここまで ==================================

  // ▼ 本番用コード============
  let pcHand;

  if (activeItem === 'churu') {
    // ちゅーる：必ず勝てる手をこねこが出す
    pcHand = [1, 2, 0][myHand];
    activeItem = null;
  } else if (activeItem === 'toy') {
    // ねこじゃらし：あいこにならない手をこねこが出す
    const noDrawTable = [
      [1, 2], // グーを出したとき：チョキかパー（チョキなら勝ち、パーなら負け）
      [0, 2], // チョキを出したとき：グーかパー
      [0, 1], // パーを出したとき：グーかチョキ
    ];
    pcHand = noDrawTable[myHand][Math.floor(Math.random() * 2)];
    activeItem = null;
  } else {
    pcHand = Math.floor(Math.random() * JANKEN_HANDS.length);
  }
  // ▲ ここまで ==================================

  const { file } = JANKEN_HANDS[pcHand];
  AUDIO[file].play();
  const result = JUDGE_TABLE[myHand][pcHand];

  applyResultEffect(result); //勝敗の結果
  showResult(myHand, pcHand, result); //表示の描画
}

//sleep関数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playAndReset() {
  await sleep(1000);
  AUDIO.draw.play();
  await sleep(2000);
  resetView();
}

//勝敗の結果を設定
function applyResultEffect(result) {
  if (result === 'あなたの「勝ち」') {
    fireConfetti(); // 勝ったら紙吹雪を出す
    AUDIO.wao.play(); //歓声！

    setTimeout(() => {
      AUDIO.win.play(); // あなたの勝ち
      setTimeout(() => {
        AUDIO.add.play(); // ペタ

        // ねこのかんづめ：勝ちの足跡が2倍
        const addCount = activeItem === 'nekokan' ? 2 : 1;
        if (activeItem === 'nekokan') activeItem = null; // ← リセット追加

        for (let i = 0; i < addCount; i++) {
          if (footPrints.childNodes.length < 10) {
            footPrints.insertAdjacentHTML('beforeend', '🐾');
            yourScore += 1;
          }
        }
        viewYourScore.textContent = yourScore;

        //10こ揃ったら終了
        if (footPrints.childNodes.length >= 10) {
          retryArea.style.display = 'none';
          AUDIO.wao.play(); //歓声！
          AUDIO.dodon.play(); //和太鼓
          AUDIO.finish.play(); //やったね！

          setTimeout(() => {
            AUDIO.present.play(); //僕からのプレゼントだよ
            AUDIO.wao.play(); // 歓声！
          }, 1000);

          judgeField.insertAdjacentHTML('beforeend', '<p id="win-message" class="pb-2 2xl:pb-4 -mt-2 2xl:-mt-4 text-xl 2xl:text-3xl text-center 2xl:leading-relaxed">やったね！<br>僕からのプレゼントだよ！🎉</p>');
          presentArea.style.display = 'block';
        }
      }, 1500);
    }, 1000);
  } else if (result === 'あなたの「負け」') {
    setTimeout(() => {
      AUDIO.lose.play(); // あなたの負け
      setTimeout(() => {
        AUDIO.lost.play(); // ポン
        footPrints.lastChild && footPrints.removeChild(footPrints.lastChild);
        yourScore -= 1;
        viewYourScore.textContent = yourScore;
        //0になったらここで終了
        if (footPrints.childNodes.length === 0) {
          setTimeout(() => AUDIO.retry.play(), 1000);

          retryArea.style.display = 'none';
          judgeField.insertAdjacentHTML('beforeend', '<p id="retry-message" class="text-3xl md:text-4xl my-4 text-center">またチャレンジしてね🐾</p>');
        }
      }, 1500);
    }, 1000);
  } else if (result === 'あいこ') {
    retryArea.style.display = 'none';
    playAndReset();
  }
}

// 勝ったら紙吹雪を出す
function fireConfetti() {
  confetti({
    angle: randomInRange(55, 125),
    spread: randomInRange(50, 70),
    particleCount: randomInRange(50, 100),
    origin: { y: 0.6 },
  });
}

//値は関数でランダムに生成する
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

//勝敗表示の描画
function showResult(myHand, pcHand, result) {
  myHandsEl.textContent = JANKEN_HANDS[myHand].emoji;
  pcHandsEl.innerHTML = handImg(pcHand);
  judgmentEl.textContent = result;
  viewYourScore.textContent = yourScore;

  ready.style.display = 'none';
  jankenBtns.style.display = 'none';
  judgeField.style.display = 'block';
  itemBox.style.display = 'none';
}

// じゃんけん
jankenBtns.addEventListener('click', (e) => {
  AUDIO.myHand.play();
  const btn = e.target.closest('.janken-btn');
  if (!btn) return;
  playJanken(Number(btn.dataset.hand));
});

// もう一度ボタン
function resetView() {
  ready.style.display = 'block';
  jankenBtns.style.display = 'flex';
  retryArea.style.display = 'block';
  judgeField.style.display = 'none';
  activeItem = null;
  showActiveItem();
  showItemBoxIfExists();
}
retryBtn.addEventListener('click', resetView);

//プレゼントボタン
presentBtn.addEventListener('click', () => {
  judgeField.style.display = 'none';
  presentArea.style.display = 'none';
  presentView.style.display = 'block';

  // 毎回ランダムに生成
  const random = catPresent[Math.floor(Math.random() * catPresent.length)];
  randomPresent.innerHTML = `<img id="present-img" src="img/${random.img}.webp" alt="${random.alt}" class="max-h-96 mx-auto rounded-xl">`;

  presentView.insertAdjacentHTML('afterbegin', `<p id="item-message" class="text-2xl md:text-3xl my-4 text-center">${random.label}を手に入れた！</p>`);

  // アイテムを保存
  saveItem(random);
});

// アイテムを保存
function saveItem(item) {
  const items = getItems();
  items.push({ img: item.img, alt: item.alt, label: item.label });
  localStorage.setItem('koneko-items', JSON.stringify(items));
}

// 起動時にlocalStorageから読み込んで表示する
function renderItemBox() {
  const itemList = document.querySelector('#item-list');
  const items = getItems();
  itemList.innerHTML = '';

  items.forEach((item, index) => {
    itemList.insertAdjacentHTML(
      'beforeend',
      `<div class="flex flex-col items-center gap-1">
        <img src="img/${item.img}.webp" alt="${item.alt}" title="${item.label}" class="w-30 rounded-lg">
        <button class="text-lg bg-yellow-400 rounded-full mt-4 px-4 py-2 font-bold use-item-btn" data-index="${index}" data-img="${item.img}">
          つかう
        </button>
      </div>`,
    );
  });

  // つかうボタンのイベント
  itemList.querySelectorAll('.use-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeItem = btn.dataset.img;

      // 使ったアイテムをlocalStorageから削除
      const items = getItems();
      items.splice(Number(btn.dataset.index), 1);
      localStorage.setItem('koneko-items', JSON.stringify(items));
      itemBox.style.display = 'none';

      renderItemBox();
      // 発動中のアイテムを表示
      showActiveItem();
    });
  });
}

// 発動中アイテムの表示
function showActiveItem() {
  document.querySelector('#active-item')?.remove();
  if (!activeItem) return;
  const item = catPresent.find((i) => i.img === activeItem);
  playField.insertAdjacentHTML('afterbegin', `<p id="active-item" class="text-center text-xl font-bold text-yellow-500 mb-2">${item.label} 発動中！</p>`);
}

returnBtn.addEventListener('click', () => {
  // スコアリセット
  yourScore = 3;
  footPrints.innerHTML = '';
  initFootPrints();

  // 追加したメッセージ（やったね／またチャレンジ）を削除
  document.querySelector('#retry-message')?.remove();
  document.querySelector('#win-message')?.remove();
  document.querySelector('#item-message')?.remove();
  activeItem = null;
  document.querySelector('#active-item')?.remove();
  showActiveItem();

  // 表示をリセットしてトップに戻る
  judgeField.style.display = 'none';
  presentArea.style.display = 'none';
  presentView.style.display = 'none';

  retryArea.style.display = 'block';
  greeting.style.display = 'none';
  playField.style.display = 'block';
  ready.style.display = 'block';
  jankenBtns.style.display = 'flex';
  helpBtn.style.display = "block";

  showItemBoxIfExists();
});

// 持ち物の取扱説明書
helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'flex';
});

helpClose.addEventListener('click', () => {
  helpModal.style.display = 'none';
});

// 背景クリックでも閉じる
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) helpModal.style.display = 'none';
});

// 起動
init();

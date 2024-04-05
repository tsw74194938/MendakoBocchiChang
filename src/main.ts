import { Application, Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { config as designConfig, originalStageHeight, originalStageWidth, resizeIfNeeded } from './resize';
import { jump, jumpSync } from './jump';
import { calcSnappedPosition, sleep } from './util';
import manifest from './manifest.json';
import { Karaage } from './karaage';

let bocchi: Sprite;
let karaage: Karaage;
let karaageButton: Sprite;
let isKaraageMode = false;
const app = new Application();

const stageWidth = (): number => {
  return originalStageWidth(app);
};
const stageHeight = (): number => {
  return originalStageHeight(app);
};

async function init() {
  await app.init({
    width: designConfig.maxWidth,
    height: designConfig.maxWidth / designConfig.aspectRatio,
    backgroundColor: '#ffffff',
  });
  app.stage.interactive = true;

  document.getElementById('app')?.appendChild(app.canvas);

  // アセット群を事前に読み込む
  // SeeAlso: https://pixijs.com/8.x/guides/components/assets
  await Assets.init({ manifest: manifest });
  Assets.backgroundLoadBundle(['main']);

  resizeIfNeeded(app);
  window.addEventListener('resize', (_) => {
    resizeIfNeeded(app);
  });

  //================
  // Bocchi
  //================
  bocchi = Sprite.from(await Assets.load('bocchi'));
  bocchi.anchor.set(0.5, 0.5);
  bocchi.scale = 0.7;
  bocchi.interactive = true;
  bocchi.x = stageWidth() / 2;
  bocchi.y = stageHeight() / 2;
  bocchi.onclick = onTouchBocchi;
  bocchi.ontouchstart = onTouchBocchi;

  //================
  // KaraageButton
  //================
  karaageButton = Sprite.from(await Assets.load('karaageButton'));
  karaageButton.scale = 0.5;
  karaageButton.interactive = true;
  karaageButton.x = 18;
  karaageButton.y = 18;
  karaageButton.onclick = onTouchKaraageButton;
  karaageButton.ontouchstart = onTouchKaraageButton;

  //================
  // Karaage
  //================
  let karaageTexture = await Assets.load('karaage');
  karaage = new Karaage(karaageTexture);
  karaage.onDragged = onDragKaraageEnd;

  //================

  const bg = Sprite.from(await Assets.load('house'));
  bg.interactive = false;
  app.stage.addChild(bg);

  app.stage.addChild(bocchi);
  app.stage.addChild(karaageButton);
}

async function onTouchBocchi() {
  Sound.from(await Assets.load('touchSound')).play();
  jump(1, 15, app.screen.height / app.stage.scale.y / 2, (y) => {
    bocchi.y = y;
  });
}

async function onTouchKaraageButton() {
  if (isKaraageMode) {
    karaage.removeFromParent();
  }
  isKaraageMode = true;
  karaage.x = 250;
  karaage.y = 80;
  karaage.addToParent(app.stage);
}

async function onDragKaraageEnd(event: FederatedPointerEvent) {
  const position = calcSnappedPosition(
    {
      width: stageWidth(),
      height: stageHeight(),
    },
    karaage.snapInfo
  );
  karaage.x = position.x;
  karaage.y = position.y;

  if (bocchi.containsPoint(event.getLocalPosition(bocchi, undefined, event.global))) {
    const pakupakuSound = Sound.from(await Assets.load('pakupakuSound'));
    const touchSound = Sound.from(await Assets.load('touchSound'));

    // 事前処理
    karaage.interactive = false;
    karaageButton.interactive = false;
    bocchi.interactive = false;

    // 唐揚げを口に運ぶ
    karaage.y = bocchi.y + 60;
    karaage.x = bocchi.x;

    // パク
    await sleep(200);
    pakupakuSound.play();
    await jumpSync(1, 8, stageHeight() / 2, (y) => {
      bocchi.y = y;
    });

    // パク
    await sleep(200);
    pakupakuSound.play();
    await jumpSync(1, 8, stageHeight() / 2, (y) => {
      bocchi.y = y;
    });

    // パク
    await sleep(200);
    pakupakuSound.play();
    await jumpSync(1, 8, stageHeight() / 2, (y) => {
      bocchi.y = y;
    });

    // ごっくん
    await sleep(500);
    karaage.removeFromParent();

    // ジャンプ
    await sleep(200);
    touchSound.play();
    await jumpSync(1, 15, stageHeight() / 2, (y) => {
      bocchi.y = y;
    });

    // 事後処理
    isKaraageMode = false;
    karaage.interactive = true;
    karaageButton.interactive = true;
    bocchi.interactive = true;
  }
}

init();

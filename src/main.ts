import { Application, Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { config as designConfig, originalStageHeight, originalStageWidth, resizeIfNeeded } from './resize';
import { calcSnappedPosition, sleep } from './util';
import { Karaage } from './karaage';
import { Bocchi } from './bocchi';
import manifest from './manifest.json';

let bocchi: Bocchi;
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
  let bocchiTexture = await Assets.load('bocchi');
  bocchi = new Bocchi(bocchiTexture);
  bocchi.baseX = stageWidth() / 2;
  bocchi.baseY = stageHeight() / 2;

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

  bocchi.addToParent(app.stage);
  app.stage.addChild(karaageButton);
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

  if (bocchi.isTouched(event)) {
    // 事前処理
    karaage.interactive = false;
    karaageButton.interactive = false;
    bocchi.interactive = false;

    // 唐揚げを口に運ぶ
    karaage.y = bocchi.baseY + 60;
    karaage.x = bocchi.baseX;

    await sleep(200);
    await bocchi.paku();
    await sleep(200);
    await bocchi.paku();
    await sleep(200);
    await bocchi.paku();
    await sleep(500);
    karaage.removeFromParent();
    await sleep(200);
    await bocchi.pyon();

    // 事後処理
    isKaraageMode = false;
    karaage.interactive = true;
    karaageButton.interactive = true;
    bocchi.interactive = true;
  }
}

init();

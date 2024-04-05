import { Application, Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { config as designConfig, resizeIfNeeded } from './resize';
import { jump, jumpSync } from './jump';
import { sleep } from './util';
import manifest from './manifest.json';

let bocchi: Sprite;
let karaage: Sprite;
let karaageButton: Sprite;
let isKaraageMode = false;
const app = new Application();

async function init() {
  await app.init({
    width: designConfig.maxWidth,
    height: designConfig.maxWidth / designConfig.aspectRatio,
    backgroundColor: '#ffffff',
  });

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
  bocchi.x = app.screen.width / app.stage.scale.x / 2;
  bocchi.y = app.screen.height / app.stage.scale.y / 2;
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
  karaage = Sprite.from(await Assets.load('karaage'));
  karaage.scale = 0.5;
  karaage.interactive = true;
  karaage.eventMode = 'static';
  karaage.cursor = 'pointer';
  karaage.anchor.set(0.5, 0.5);
  karaage.onpointerdown = (_) => {
    onDragKaraageStart();
  };

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
    app.stage.removeChild(karaage);
    app.stage.onpointermove = null;
    app.stage.onpointerup = null;
    app.stage.onpointerupoutside = null;
  }

  isKaraageMode = true;

  karaage.x = 250;
  karaage.y = 80;
  Sound.from(await Assets.load('popSound')).play();
  app.stage.addChild(karaage);
}

function onDragKaraageStart() {
  app.stage.onpointermove = onDragKaraageMove;
  app.stage.onpointerup = onDragKaraageEnd;
  app.stage.onpointerupoutside = onDragKaraageEnd;
}

function onDragKaraageMove(event: FederatedPointerEvent) {
  karaage.parent.toLocal(event.global, undefined, karaage.position);
}

async function onDragKaraageEnd(event: FederatedPointerEvent) {
  snapKaraage(karaage);

  app.stage.onpointermove = null;
  app.stage.onpointerup = null;
  app.stage.onpointerupoutside = null;

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
    await jumpSync(1, 8, app.screen.height / app.stage.scale.y / 2, (y) => {
      bocchi.y = y;
    });

    // パク
    await sleep(200);
    pakupakuSound.play();
    await jumpSync(1, 8, app.screen.height / app.stage.scale.y / 2, (y) => {
      bocchi.y = y;
    });

    // パク
    await sleep(200);
    pakupakuSound.play();
    await jumpSync(1, 8, app.screen.height / app.stage.scale.y / 2, (y) => {
      bocchi.y = y;
    });

    // ごっくん
    await sleep(500);
    app.stage.removeChild(karaage);

    // ジャンプ
    await sleep(200);
    touchSound.play();
    await jumpSync(1, 15, app.screen.height / app.stage.scale.y / 2, (y) => {
      bocchi.y = y;
    });

    // 事後処理
    isKaraageMode = false;
    karaage.interactive = true;
    karaageButton.interactive = true;
    bocchi.interactive = true;
  }
}

function snapKaraage(obj: Sprite) {
  obj.position.x = Math.min(
    Math.max(obj.position.x, obj.width / 2),
    app.screen.width / app.stage.scale.x - obj.width / 2
  );
  obj.position.y = Math.min(
    Math.max(obj.position.y, obj.height / 2),
    app.screen.height / app.stage.scale.y - obj.height / 2
  );
}

init();

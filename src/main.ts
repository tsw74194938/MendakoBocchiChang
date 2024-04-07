import { Application, Assets, Container, FederatedPointerEvent, Sprite } from 'pixi.js';
import { config as designConfig, originalStageHeight, originalStageWidth, resizeIfNeeded } from './resize';
import { bringToBackward, bringToForward, calcSnappedPosition } from './util';
import { Karaage } from './karaage';
import { Bocchi } from './bocchi';
import manifest from './manifest.json';
import { Button } from './button';

let bocchi: Bocchi;
let karaageButton: Button;
// zIndexを操作した時、唐揚げが他の要素の裏に回らないようにするためのコンテナ
let karaageContainer: Container;
let karaages: Karaage[] = [];
let isBocchiEating = false;
const MAX_KARAAGE_COUNT = 10;
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
  app.stage.sortableChildren = true;

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
  bocchi = new Bocchi();
  bocchi.baseX = stageWidth() / 2;
  bocchi.baseY = stageHeight() / 2;

  //================
  // KaraageButton
  //================
  const buttonTexture = await Assets.load('karaageButton');
  karaageButton = new Button(buttonTexture);
  karaageButton.scale = 0.5;
  karaageButton.x = 100;
  karaageButton.y = 80;
  karaageButton.onTap = onTouchKaraageButton;

  karaageContainer = new Container();
  karaageContainer.interactive = true;

  const bg = Sprite.from(await Assets.load('house'));
  bg.interactive = false;
  app.stage.addChild(bg);

  bocchi.addToParent(app.stage);
  karaageButton.addToParent(app.stage);
  app.stage.addChild(karaageContainer);
}

async function onTouchKaraageButton(button: Button) {
  let karaageTexture = await Assets.load('karaage');
  const karaage = new Karaage(karaageTexture);
  karaage.y = 80;

  if (karaages.length == 0) {
    karaage.x = 250;
  } else {
    const maxX = karaages
      .filter((k) => k.y == 80)
      .map((k) => k.x)
      .reduce((a, b) => Math.max(a, b), 250);
    karaage.x = maxX + 20;
  }

  karaage.addToParent(karaageContainer);
  karaage.onDragStart = onDragKaraageStart;
  karaage.onDragMove = onDragKaraageMove;
  karaage.onDragEnd = onDragKaraageEnd;
  karaages.push(karaage);

  if (karaages.length > MAX_KARAAGE_COUNT - 1) {
    button.isEnabled = false;
  }
}

const onDragKaraageStart = (karaage: Karaage, _: FederatedPointerEvent) => {
  bringToForward(karaage, karaages);
};

const onDragKaraageMove = async (_: Karaage, event: FederatedPointerEvent) => {
  if (isBocchiEating) {
    return;
  }
  bocchi.onKaraageDragMove(event);
};

const onDragKaraageEnd = async (karaage: Karaage, event: FederatedPointerEvent) => {
  if (isBocchiEating) {
    return;
  }

  const position = calcSnappedPosition(
    {
      width: stageWidth(),
      height: stageHeight(),
    },
    karaage.snapInfo
  );
  karaage.x = position.x;
  karaage.y = position.y;

  bocchi.onKaraageDragEnd();
  if (bocchi.isTouched(event)) {
    bringToBackward(karaage, karaages);

    // 事前処理
    isBocchiEating = true;
    karaage.interactive = false;
    bocchi.interactive = false;

    // 唐揚げを食べる
    await bocchi.eatKaraage(karaage, () => {
      karaage.removeFromParent();
      karaageButton.isEnabled = true;
    });

    karaages = karaages.filter((k) => k !== karaage);

    // 事後処理
    isBocchiEating = false;
    karaage.interactive = true;
    bocchi.interactive = true;
  }
};

init();

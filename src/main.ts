import { Application, Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { config as designConfig, originalStageHeight, originalStageWidth, resizeIfNeeded } from './resize';
import { calcSnappedPosition } from './util';
import { Karaage } from './karaage';
import { Bocchi } from './bocchi';
import manifest from './manifest.json';

let bocchi: Bocchi;
let karaageButton: Sprite;
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
  karaageButton = Sprite.from(await Assets.load('karaageButton'));
  karaageButton.scale = 0.5;
  karaageButton.interactive = true;
  karaageButton.x = 18;
  karaageButton.y = 18;
  karaageButton.onclick = onTouchKaraageButton;
  karaageButton.ontouchstart = onTouchKaraageButton;

  //================

  const bg = Sprite.from(await Assets.load('house'));
  bg.interactive = false;
  app.stage.addChild(bg);

  bocchi.addToParent(app.stage);
  app.stage.addChild(karaageButton);
}

async function onTouchKaraageButton() {
  if (karaages.length > MAX_KARAAGE_COUNT - 1) {
    return;
  }

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

  karaage.addToParent(app.stage);
  karaage.onDragStart = onDragKaraageStart;
  karaage.onDragMove = onDragKaraageMove;
  karaage.onDragEnd = onDragKaraageEnd;
  karaages.push(karaage);
}

const onDragKaraageStart = (karaage: Karaage, _: FederatedPointerEvent) => {
  const zIndices = karaages.map((k) => k.zIndex);
  const frontmostKaraageIndex = zIndices.indexOf(Math.max(...zIndices));

  // デフォルトだとzIndexは0なので、最も手前のzIndex値が0だった場合は、1にすることで最前面に来るようにする
  const topZIndex = karaages[frontmostKaraageIndex].zIndex == 0 ? 1 : karaages[frontmostKaraageIndex].zIndex;

  // 手前の唐揚げとタップされた唐揚げで、zIndexを交換する
  karaages[frontmostKaraageIndex].zIndex = karaage.zIndex;
  karaage.zIndex = topZIndex;
};

const onDragKaraageMove = async (_: Karaage, event: FederatedPointerEvent) => {
  if (isBocchiEating) {
    return;
  }
  bocchi.lookAtKaraage(event);
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

  if (bocchi.isTouched(event)) {
    bocchi.direction = 'front';

    // 事前処理
    isBocchiEating = true;
    karaage.interactive = false;
    bocchi.interactive = false;

    // 唐揚げを口に運ぶ
    karaage.y = bocchi.baseY + 60;
    karaage.x = bocchi.baseX;

    // 唐揚げを食べる
    await bocchi.eatKaraage(() => {
      karaage.removeFromParent();
    });

    karaages = karaages.filter((k) => k !== karaage);

    // 事後処理
    isBocchiEating = false;
    karaage.interactive = true;
    bocchi.interactive = true;
  }
};

init();

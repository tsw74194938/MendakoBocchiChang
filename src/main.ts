import { Application, Assets, FederatedPointerEvent, Sprite } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { config as designConfig, resizeIfNeeded } from './resize';
import { jump } from './jump';
import imgBocchiChang from '/img/bocchi-chang.png';
import imgKaraage from '/img/karaage.png';
import imgKaraageBtn from '/img/karaage-btn.png';
import imgBocchiHouse from '/img/bocchi-house.png';
import audioTouch from '/audio/bocchi-touch.mp3';
import audioPakuPaku from '/audio/bocchi-pakupaku.mp3';
import audioPop from '/audio/karaage-pop.mp3';

let bocchi: Sprite;
let karaage: Sprite;
let karaageButton: Sprite;
let pakupakuSound: Sound;
let touchSound: Sound;
let isKaraageMode = false;
const app = new Application();

async function init() {
  await app.init({
    width: designConfig.maxWidth,
    height: designConfig.maxWidth / designConfig.aspectRatio,
    backgroundColor: '#ffffff',
  });

  document.getElementById('app')?.appendChild(app.canvas);

  const manifest = {
    bundles: [
      {
        name: 'main',
        assets: [
          { alias: 'house', src: imgBocchiHouse },
          { alias: 'bocchi', src: imgBocchiChang },
          { alias: 'karaage', src: imgKaraage },
          { alias: 'karaageButton', src: imgKaraageBtn },
          { alias: 'touchSound', src: audioTouch },
          { alias: 'pakupakuSound', src: audioPakuPaku },
          { alias: 'popSound', src: audioPop },
        ],
      },
    ],
  };
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
  karaageButton.anchor.set(1, 0);
  karaageButton.scale = 0.5;
  karaageButton.interactive = true;
  karaageButton.x = app.screen.width / app.stage.scale.x - 18;
  karaageButton.y = 18;
  karaageButton.onclick = onTouchKaraageButton;
  karaageButton.ontouchstart = onTouchKaraageButton;

  //================
  // Karaage
  //================
  karaage = Sprite.from(await Assets.load('karaage'));
  karaage.scale = 0.5;
  karaage.x = 100;
  karaage.y = 100;
  karaage.interactive = true;
  karaage.eventMode = 'static';
  karaage.cursor = 'pointer';
  karaage.anchor.set(0.5, 0.5);
  karaage.onpointerdown = (_) => {
    onDragKaraageStart();
  };

  //================

  pakupakuSound = Sound.from(await Assets.load('pakupakuSound'));
  touchSound = Sound.from(await Assets.load('touchSound'));

  const bg = Sprite.from(await Assets.load('house'));
  bg.interactive = false;
  app.stage.addChild(bg);

  app.stage.addChild(bocchi);
  app.stage.addChild(karaageButton);
}

async function onTouchBocchi() {
  jump(app.screen.height / app.stage.scale.y / 2, 1, 15, (y) => {
    bocchi.y = y;
  });
  touchSound.play();
}

async function onTouchKaraageButton() {
  isKaraageMode = !isKaraageMode;
  if (isKaraageMode) {
    karaage.x = 100;
    karaage.y = 100;
    Sound.from(await Assets.load('popSound')).play();
    app.stage.addChild(karaage);
  } else {
    app.stage.removeChild(karaage);
    app.stage.onpointermove = null;
    app.stage.onpointerup = null;
    app.stage.onpointerupoutside = null;
  }
}

function onDragKaraageStart() {
  app.stage.onpointermove = onDragKaraageMove;
  app.stage.onpointerup = onDragKaraageEnd;
  app.stage.onpointerupoutside = onDragKaraageEnd;
}

function onDragKaraageMove(event: FederatedPointerEvent) {
  karaage.parent.toLocal(event.global, undefined, karaage.position);
}

function onDragKaraageEnd(event: FederatedPointerEvent) {
  snapKaraage(karaage);

  app.stage.onpointermove = null;
  app.stage.onpointerup = null;
  app.stage.onpointerupoutside = null;

  if (bocchi.containsPoint(event.getLocalPosition(bocchi, undefined, event.global))) {
    karaage.interactive = false;
    karaageButton.interactive = false;
    bocchi.interactive = false;

    karaage.y = bocchi.y + 60;
    karaage.x = bocchi.x;

    setTimeout(() => {
      pakupakuSound.play();
      jump(
        app.screen.height / app.stage.scale.y / 2,
        1,
        8,
        (y) => {
          bocchi.y = y;
        },
        () => {
          setTimeout(() => {
            pakupakuSound.play();
            jump(
              app.screen.height / app.stage.scale.y / 2,
              1,
              8,
              (y) => {
                bocchi.y = y;
              },
              () => {
                setTimeout(() => {
                  pakupakuSound.play();
                  jump(
                    app.screen.height / app.stage.scale.y / 2,
                    1,
                    8,
                    (y) => {
                      bocchi.y = y;
                    },
                    () => {
                      setTimeout(() => {
                        setTimeout(() => {
                          touchSound.play();
                          jump(
                            app.screen.height / app.stage.scale.y / 2,
                            1,
                            15,
                            (y) => {
                              bocchi.y = y;
                            },
                            () => {
                              isKaraageMode = false;
                              karaage.interactive = true;
                              karaageButton.interactive = true;
                              bocchi.interactive = true;
                            },
                          );
                        }, 200);
                        app.stage.removeChild(karaage);
                      }, 500);
                    },
                  );
                }, 200);
              },
            );
          }, 200);
        },
      );
    }, 200);
  }
}

function snapKaraage(obj: Sprite) {
  obj.position.x = Math.min(
    Math.max(obj.position.x, obj.width / 2),
    app.screen.width / app.stage.scale.x - obj.width / 2,
  );
  obj.position.y = Math.min(
    Math.max(obj.position.y, obj.height / 2),
    app.screen.height / app.stage.scale.y - obj.height / 2,
  );
}

init();

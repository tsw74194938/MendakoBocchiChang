import { Application, Assets, Sprite } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { config as designConfig, resizeIfNeeded } from './resize';
import { jump } from './jump';
import bocchiChang from '/img/bocchi-chang.png';
import touchSound from '/audio/bocchi-touch.mp3';

const app = new Application();

async function init() {
  await app.init({
    width: designConfig.maxWidth,
    height: designConfig.maxWidth / designConfig.aspectRatio,
    backgroundColor: 0xabcfb5,
  });

  document.getElementById('app')?.appendChild(app.canvas);

  const manifest = {
    bundles: [
      {
        name: 'main',
        assets: [
          { alias: 'bocchiTexture', src: bocchiChang },
          { alias: 'touchSound', src: touchSound },
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

  const bocchi = Sprite.from(await Assets.load('bocchiTexture'));
  bocchi.anchor.set(0.5, 0.5);
  bocchi.scale = 0.7;
  bocchi.x = app.screen.width / app.stage.scale.x / 2;
  bocchi.y = app.screen.height / app.stage.scale.y / 2;
  app.stage.addChild(bocchi);

  bocchi.interactive = true;
  bocchi.onclick = (_) => {
    onTouch(bocchi);
  };
  bocchi.ontouchstart = (_) => {
    onTouch(bocchi);
  };
}

async function onTouch(bocchi: Sprite) {
  jump(app.screen.height / app.stage.scale.y / 2, (y) => {
    bocchi.y = y;
  });

  const sound = Sound.from(await Assets.load('touchSound'));
  sound.resume();
  sound.play();
}

init();

import { Application, Assets, Sprite } from 'pixi.js';
import { config as designConfig, resizeIfNeeded } from './resize';
import bocchiChang from '/img/bocchi-chang.png';

const app = new Application();

async function init() {
  await app.init({
    width: designConfig.maxWidth,
    height: designConfig.maxWidth / designConfig.aspectRatio,
    backgroundColor: 0xabcfb5,
  });
  document.getElementById('app')?.appendChild(app.canvas);

  resizeIfNeeded(app);
  window.addEventListener('resize', (_) => {
    resizeIfNeeded(app);
  });

  const bocchi = Sprite.from(await Assets.load(bocchiChang));
  bocchi.anchor.set(0.5, 0.5);
  bocchi.scale = 0.7;
  bocchi.x = app.screen.width / app.stage.scale.x / 2;
  bocchi.y = app.screen.height / app.stage.scale.y / 2;
  app.stage.addChild(bocchi);
}

init();

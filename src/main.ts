import { Application, Assets, Sprite } from 'pixi.js';

const app = new Application();

async function init() {
  await app.init({
    width: 600,
    height: 600,
    backgroundColor: 0xabcfb5,
  });
  document.body.appendChild(app.canvas);

  const texture = await Assets.load('./img/bocchi-chang.png');
  const sprite = Sprite.from(texture);
  sprite.anchor.set(0.5, 0.5);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;
  app.stage.addChild(sprite);

  app.ticker.add((time) => {
    sprite.rotation -= 0.05 * time.deltaTime;
  });
}

init();

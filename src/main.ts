import { Application } from 'pixi.js';

const app = new Application();

async function init() {
  await app.init({
    width: 400,
    height: 300,
    backgroundColor: 0x000000,
  });
  document.body.appendChild(app.canvas);
}

init();

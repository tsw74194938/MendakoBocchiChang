import { Application } from 'pixi.js';

export const config = {
  minWidth: 320,
  maxWidth: 925,
  aspectRatio: 16 / 12,
};

/**
 * 描画領域のリサイズを行う
 * @param width リサイズ後の横幅
 * @param app リサイズ対象のアプリ
 */
const resize = (width: number, app: Application) => {
  app.renderer.resize(width, width / config.aspectRatio);
  app.stage.scale = width / config.maxWidth;
};

/**
 * ウインドウサイズの更新時に呼び出され、必要であれば描画領域のリサイズを行う
 * @param app リサイズ対象のアプリ
 */
export const resizeIfNeeded = (app: Application) => {
  if (window.innerWidth > config.maxWidth) {
    if (app.stage.width != config.maxWidth) {
      resize(config.maxWidth, app);
    }
  } else if (window.innerWidth < config.minWidth) {
    if (app.stage.width != config.minWidth) {
      resize(config.minWidth, app);
    }
  } else {
    resize(window.innerWidth, app);
  }
};

/**
 * @param app リサイズ対象のアプリ
 * @returns リサイズ前のStageの横幅
 */
export const originalStageWidth = (app: Application): number => {
  return app.screen.width / app.stage.scale.x;
};

/**
 * @param app リサイズ対象のアプリ
 * @returns リサイズ前のStageの縦幅
 */
export const originalStageHeight = (app: Application): number => {
  return app.screen.height / app.stage.scale.y;
};

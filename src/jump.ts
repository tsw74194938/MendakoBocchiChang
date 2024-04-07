import { Ticker } from 'pixi.js';

let jumping = false;
let tick: (ticker: Ticker) => void = () => {};

/**
 * ジャンプ位置を計算する
 * 着地したら終了する
 *
 * @param gravity 重力
 * @param power 初速
 * @param baseY ジャンプ開始時のY座標
 * @param updateY Y座標実行時に呼び出されるクロージャ
 * @param onComplete 終了時に呼び出されるクロージャ
 */
export const jump = (
  gravity: number,
  power: number,
  baseY: number,
  updateY: (y: number) => void,
  onComplete: () => void = () => {}
) => {
  _jump(gravity, power, baseY, updateY, onComplete);
};

/**
 * ジャンプ位置を計算する
 * 着地まで待ち合わせることができる
 *
 * @param gravity 重力
 * @param power 初速
 * @param baseY ジャンプ開始時のY座標
 * @param updateY Y座標実行時に呼び出されるクロージャ
 */
export const jumpSync = async (
  gravity: number,
  power: number,
  baseY: number,
  updateY: (_: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    _jump(gravity, power, baseY, updateY, () => {
      resolve();
    });
  });
};

/**
 * ジャンプ位置を計算する
 * 着地したら終了する
 *
 * @param gravity 重力
 * @param power 初速
 * @param baseY ジャンプ開始時のY座標
 * @param updateY Y座標実行時に呼び出されるクロージャ
 * @param onComplete 終了時に呼び出されるクロージャ
 */
const _jump = (gravity: number, power: number, baseY: number, updateY: (y: number) => void, onComplete: () => void) => {
  // ジャンプ実行中に呼び出されたら、初期位置に戻ってジャンプし直す
  if (jumping) {
    Ticker.shared.remove(tick);
    updateY(baseY);
  }

  jumping = true;

  // 経過時間
  let time = 0;

  tick = (ticker: Ticker) => {
    // 鉛直投げ上げの式: 高さ=初速*時間 - 1/2 * 時間^2
    const height = power * time - (1 / 2) * gravity * Math.pow(time, 2);

    if (height < 0) {
      jumping = false;
      Ticker.shared.remove(tick);
      updateY(baseY);
      onComplete();
      return;
    }

    updateY(baseY + height * -1);

    // 5くらいで割って、なんかいい感じにする
    time += ticker.deltaMS / 5;
  };

  Ticker.shared.add(tick);
};

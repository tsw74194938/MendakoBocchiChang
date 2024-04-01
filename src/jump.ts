import { Ticker } from 'pixi.js';

let jumping = false;
const gravity = 1;
const power = 15;
let tick: (ticker: Ticker) => void;

export function jump(from: number, onUpdateY: (_: number) => void) {
  if (jumping) {
    Ticker.shared.remove(tick);
    onUpdateY(from);
  }
  jumping = true;

  let time = 0;

  tick = (ticker: Ticker) => {
    const jumpHeight = (-gravity / 2) * Math.pow(time, 2) + power * time;

    if (jumpHeight < 0) {
      jumping = false;
      Ticker.shared.remove(tick);
      onUpdateY(from);
      return;
    }

    onUpdateY(from + jumpHeight * -1);
    time += ticker.deltaMS / 5;
  };

  Ticker.shared.add(tick);
}

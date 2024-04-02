import { Ticker } from 'pixi.js';

let jumping = false;
let tick: (ticker: Ticker) => void;

export function jump(
  from: number,
  gravity: number = 1,
  power: number = 15,
  onUpdateY: (_: number) => void,
  onComplete: () => void = () => {},
) {
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
      onComplete();
      return;
    }

    onUpdateY(from + jumpHeight * -1);
    time += ticker.deltaMS / 5;
  };

  Ticker.shared.add(tick);
}

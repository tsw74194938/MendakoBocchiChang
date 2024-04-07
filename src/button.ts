import { Container, FederatedPointerEvent, Sprite, Texture } from 'pixi.js';

/**
 * ボタン
 */
export class Button {
  private view: Sprite;
  onTap: (button: Button, event: FederatedPointerEvent) => void = () => {};

  constructor(texture: Texture) {
    this.view = Sprite.from(texture);
    this.view.interactive = true;
    this.view.onclick = this._onTap;
    this.view.ontouchstart = this._onTap;
  }

  get x(): number {
    return this.view.x;
  }

  set x(x: number) {
    this.view.x = x;
  }

  get y(): number {
    return this.view.y;
  }

  set y(y: number) {
    this.view.y = y;
  }

  set scale(scale: number) {
    this.view.scale = scale;
  }

  set isEnabled(isEnabled: boolean) {
    this.view.alpha = isEnabled ? 1 : 0.6;
    this.view.interactive = isEnabled;
  }

  addToParent = async (parent: Container) => {
    parent.addChild(this.view);
  };

  private _onTap = (event: FederatedPointerEvent) => {
    this.onTap(this, event);
  };
}

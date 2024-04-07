import { Container, FederatedPointerEvent, Sprite, Texture } from 'pixi.js';

/**
 * ボタン
 */
export class Button {
  private view: Sprite;
  private _scale: number;
  onTap: (button: Button, event: FederatedPointerEvent) => void = () => {};

  constructor(texture: Texture) {
    this.view = Sprite.from(texture);
    this.view.interactive = true;
    this.view.anchor.set(0.5, 0.5);
    this._scale = this.view.scale.x;

    this.view.onpointerdown = () => {
      this.view.scale = this._scale * 0.9;
    };
    this.view.onpointerup = (event: FederatedPointerEvent) => {
      this.onTap(this, event);
      this.view.scale = this._scale * 1;
    };
    this.view.onpointerupoutside = () => {
      this.view.scale = this._scale * 1;
    };
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
    this._scale = scale;
    this.view.scale = scale;
  }

  set isEnabled(isEnabled: boolean) {
    this.view.alpha = isEnabled ? 1 : 0.6;
    this.view.interactive = isEnabled;
  }

  addToParent = async (parent: Container) => {
    parent.addChild(this.view);
  };
}

import { Assets, Container, Sprite, FederatedPointerEvent, Texture } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { SnapTarget } from './util';

/**
 * 唐揚げ
 */
export class Karaage {
  private view: Sprite;
  onDragStart: (karaage: Karaage, event: FederatedPointerEvent) => void = (_) => {};
  onDragMove: (karaage: Karaage, event: FederatedPointerEvent) => void = (_) => {};
  onDragEnd: (karaage: Karaage, event: FederatedPointerEvent) => void = (_) => {};

  constructor(texture: Texture) {
    this.view = Sprite.from(texture);

    this.view.scale = 0.5;
    this.view.interactive = true;
    this.view.eventMode = 'static';
    this.view.cursor = 'pointer';
    this.view.anchor.set(0.5, 0.5);
    this.view.on('pointerdown', this._onDragStart);
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

  get zIndex(): number {
    return this.view.zIndex;
  }

  set zIndex(zIndex: number) {
    this.view.zIndex = zIndex;
  }

  get interactive(): boolean {
    return this.view.interactive;
  }

  set interactive(interactive: boolean) {
    this.view.interactive = interactive;
  }

  get snapInfo(): SnapTarget {
    return {
      position: {
        x: this.view.position.x,
        y: this.view.position.y,
      },
      size: {
        width: this.view.width,
        height: this.view.height,
      },
      anchor: {
        x: this.view.anchor.x,
        y: this.view.anchor.y,
      },
    };
  }

  addToParent = async (parent: Container) => {
    const sound = Sound.from(await Assets.load('popSound'));
    sound.play();
    parent.addChild(this.view);
  };

  removeFromParent = () => {
    this.view.parent.off('pointermove', this._onDragMove);
    this.view.parent.off('pointerup', this._onDragEnd);
    this.view.parent.off('pointerupoutside', this._onDragEnd);
    this.view.parent.removeChild(this.view);
  };

  private _onDragStart = (event: FederatedPointerEvent) => {
    this.onDragStart(this, event);
    this.view.parent.on('pointermove', this._onDragMove);
    this.view.parent.on('pointerup', this._onDragEnd);
    this.view.parent.on('pointerupoutside', this._onDragEnd);
  };

  private _onDragMove = (event: FederatedPointerEvent) => {
    this.onDragMove(this, event);
    this.view.parent.toLocal(event.global, undefined, this.view.position);
  };

  private _onDragEnd = async (event: FederatedPointerEvent) => {
    this.view.parent.off('pointermove', this._onDragMove);
    this.view.parent.off('pointerup', this._onDragEnd);
    this.view.parent.off('pointerupoutside', this._onDragEnd);
    this.onDragEnd(this, event);
  };
}

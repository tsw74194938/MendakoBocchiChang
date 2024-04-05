import { Assets, Container, Sprite, FederatedPointerEvent, Texture } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { SnapTarget } from './util';

/**
 * 唐揚げ
 */
export class Karaage {
  private view: Sprite;
  onDragged: (karaage: Karaage, event: FederatedPointerEvent) => void = (_) => {};

  constructor(texture: Texture) {
    this.view = Sprite.from(texture);

    this.view.scale = 0.5;
    this.view.interactive = true;
    this.view.eventMode = 'static';
    this.view.cursor = 'pointer';
    this.view.anchor.set(0.5, 0.5);
    this.view.on('pointerdown', this.onDragStart);
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
    this.view.parent.off('pointermove', this.onDragMove);
    this.view.parent.off('pointerup', this.onDragEnd);
    this.view.parent.off('pointerupoutside', this.onDragEnd);
    this.view.parent.removeChild(this.view);
  };

  private onDragStart = () => {
    this.view.parent.on('pointermove', this.onDragMove);
    this.view.parent.on('pointerup', this.onDragEnd);
    this.view.parent.on('pointerupoutside', this.onDragEnd);
  };

  private onDragMove = (event: FederatedPointerEvent) => {
    this.view.parent.toLocal(event.global, undefined, this.view.position);
  };

  private onDragEnd = async (event: FederatedPointerEvent) => {
    this.view.parent.off('pointermove', this.onDragMove);
    this.view.parent.off('pointerup', this.onDragEnd);
    this.view.parent.off('pointerupoutside', this.onDragEnd);
    this.onDragged(this, event);
  };
}

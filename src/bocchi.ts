import { Sound } from '@pixi/sound';
import { Assets, Container, FederatedPointerEvent, Sprite } from 'pixi.js';
import { jump, jumpSync } from './jump';

/// めんだこぼちが顔を向ける方向
export type Direction =
  | 'up'
  | 'upleft'
  | 'upright'
  | 'front'
  | 'frontleft'
  | 'frontright'
  | 'left'
  | 'right'
  | 'down'
  | 'downleft'
  | 'downright';

/**
 * めんだこぼち
 */
export class Bocchi {
  private view: Sprite;
  private _direction: Direction;
  private pakupakuSound: Sound | undefined = undefined;
  private touchSound: Sound | undefined = undefined;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseX: number;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseY: number;

  constructor() {
    this.view = new Sprite();
    this._direction = 'front';
    this._baseX = this.view.x;
    this._baseY = this.view.y;

    this.view.anchor.set(0.5, 0.5);
    this.view.scale = 0.7;
    this.view.interactive = true;

    this.view.on('click', this.onTouch);
    this.view.on('touchstart', this.onTouch);

    this.updateTexture();

    Assets.load('pakupakuSound').then((a) => (this.pakupakuSound = Sound.from(a)));
    Assets.load('touchSound').then((a) => (this.touchSound = Sound.from(a)));
  }

  get baseX(): number {
    return this._baseX;
  }

  set baseX(x: number) {
    this._baseX = x;
    this.view.x = x;
  }

  get baseY(): number {
    return this._baseY;
  }

  set baseY(y: number) {
    this._baseY = y;
    this.view.y = y;
  }

  set direction(direction: Direction) {
    this._direction = direction;
    this.updateTexture();
  }

  get interactive(): boolean {
    return this.view.interactive;
  }

  set interactive(interactive: boolean) {
    this.view.interactive = interactive;
  }

  addToParent = (parent: Container) => {
    parent.addChild(this.view);
  };

  isTouched = (event: FederatedPointerEvent): boolean => {
    return this.view.containsPoint(event.getLocalPosition(this.view, undefined, event.global));
  };

  /**
   * めんだこぼちにタップ値を注視させる
   * @param event タップ位置
   */
  lookAt = (event: FederatedPointerEvent) => {
    type Vertical = 'up' | 'down' | 'front';
    type Horizontal = 'front' | 'left' | 'frontleft' | 'frontright' | 'right';
    const frontAreaSide = 100;

    let touchPosition = event.getLocalPosition(this.view, undefined, event.global);

    const verticalPosition = ((): Vertical => {
      const viewHeight = this.view.height / this.view.scale.y;
      const marginTop = 80;
      const marginBottom = 80;
      if (touchPosition.y < (-1 * viewHeight) / 2 + marginTop) {
        return 'up';
      } else if (viewHeight / 2 - marginBottom < touchPosition.y) {
        return 'down';
      } else {
        return 'front';
      }
    })();

    const horizontalPosition = ((): Horizontal => {
      const viewWidth = this.view.width / this.view.scale.x;
      if (touchPosition.x < (-1 * viewWidth) / 2) {
        return 'left';
      } else if (touchPosition.x < -1 * frontAreaSide) {
        return 'frontleft';
      } else if (viewWidth / 2 < touchPosition.x) {
        return 'right';
      } else if (frontAreaSide < touchPosition.x) {
        return 'frontright';
      } else {
        return 'front';
      }
    })();

    const direction = ((): Direction => {
      switch (horizontalPosition) {
        case 'left':
          switch (verticalPosition) {
            case 'up':
              return 'upleft';
            case 'down':
              return 'downleft';
            case 'front':
              return 'left';
          }
        case 'frontleft':
          switch (verticalPosition) {
            case 'up':
              return 'upleft';
            case 'down':
              return 'downleft';
            case 'front':
              return 'frontleft';
          }
        case 'right':
          switch (verticalPosition) {
            case 'up':
              return 'upright';
            case 'down':
              return 'downright';
            case 'front':
              return 'right';
          }
        case 'frontright':
          switch (verticalPosition) {
            case 'up':
              return 'upright';
            case 'down':
              return 'downright';
            case 'front':
              return 'frontright';
          }
        case 'front':
          switch (verticalPosition) {
            case 'up':
              return 'up';
            case 'down':
              return 'down';
            case 'front':
              return 'front';
          }
      }
    })();

    this.direction = direction;
  };

  /**
   * パクッと食べる
   */
  paku = async () => {
    this.pakupakuSound?.play();
    await jumpSync(1, 8, this._baseY, (y) => {
      this.view.y = y;
    });
  };

  /**
   * ぴょんっとジャンプする
   * 連続で呼び出すと、連続でジャンプする
   */
  pyon = async () => {
    this.touchSound?.play();
    jump(1, 15, this._baseY, (y) => {
      this.view.y = y;
    });
  };

  private updateTexture = () => {
    const textureName = this.textureName(this._direction);
    Assets.load(textureName).then((t) => {
      this.view.texture = t;
    });
  };

  private textureName = (direction: Direction): string => {
    switch (direction) {
      case 'up':
        return 'bocchi-up';
      case 'upleft':
        return 'bocchi-upleft';
      case 'upright':
        return 'bocchi-upright';
      case 'front':
        return 'bocchi-front';
      case 'frontleft':
        return 'bocchi-frontleft';
      case 'frontright':
        return 'bocchi-frontright';
      case 'left':
        return 'bocchi-left';
      case 'right':
        return 'bocchi-right';
      case 'down':
        return 'bocchi-down';
      case 'downleft':
        return 'bocchi-downleft';
      case 'downright':
        return 'bocchi-downright';
      default:
        return 'bocchi-front';
    }
  };

  /**
   * ぼっちちゃんのタッチ時に呼び出される
   */
  private onTouch = () => {
    this.direction = 'front';
    this.pyon();
  };
}

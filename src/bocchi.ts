import { Sound } from '@pixi/sound';
import { Assets, Container, FederatedPointerEvent, Sprite, Texture } from 'pixi.js';
import { jump, jumpSync } from './jump';

/**
 * めんだこぼち
 */
export class Bocchi {
  private view: Sprite;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseX: number;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseY: number;

  constructor(texture: Texture) {
    this.view = Sprite.from(texture);
    this._baseX = this.view.x;
    this._baseY = this.view.y;

    this.view.anchor.set(0.5, 0.5);
    this.view.scale = 0.7;
    this.view.interactive = true;

    this.view.on('click', this.onTouch);
    this.view.on('touchstart', this.onTouch);
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
   * パクッと食べる
   */
  paku = async () => {
    Sound.from(await Assets.load('pakupakuSound')).play();
    await jumpSync(1, 8, this._baseY, (y) => {
      this.view.y = y;
    });
  };

  /**
   * ぴょんっとジャンプする
   * 連続で呼び出すと、連続でジャンプする
   */
  pyon = async () => {
    Sound.from(await Assets.load('touchSound')).play();
    jump(1, 15, this._baseY, (y) => {
      this.view.y = y;
    });
  };

  /**
   * ぼっちちゃんのタッチ時に呼び出される
   */
  private onTouch = () => {
    this.pyon();
  };
}

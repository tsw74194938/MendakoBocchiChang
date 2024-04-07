import { Sound } from '@pixi/sound';
import { Assets, Container, FederatedPointerEvent, Sprite, Texture } from 'pixi.js';
import { jump, jumpSync } from './jump';
import { sleep } from './util';
import { Karaage } from './karaage';

/// めんだこぼちが顔を向ける方向
type Direction =
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

let upTexture: Texture;
let upLeftTexture: Texture;
let upRightTexture: Texture;
let frontTexture: Texture;
let frontRightTexture: Texture;
let frontLeftTexture: Texture;
let leftTexture: Texture;
let rightTexture: Texture;
let downTexture: Texture;
let downLeftTexture: Texture;
let downRightTexture: Texture;
let pakupakuSound: Sound;
let touchSound: Sound;

export const loadBocchiAssets = async () => {
  upTexture = await Assets.load('bocchi-up');
  upLeftTexture = await Assets.load('bocchi-upleft');
  upRightTexture = await Assets.load('bocchi-upright');
  frontTexture = await Assets.load('bocchi-front');
  frontRightTexture = await Assets.load('bocchi-frontright');
  frontLeftTexture = await Assets.load('bocchi-frontleft');
  leftTexture = await Assets.load('bocchi-left');
  rightTexture = await Assets.load('bocchi-right');
  downTexture = await Assets.load('bocchi-down');
  downRightTexture = await Assets.load('bocchi-downright');
  downLeftTexture = await Assets.load('bocchi-downleft');
  pakupakuSound = await Assets.load('pakupakuSound');
  touchSound = await Assets.load('touchSound');
};

const texture = (direction: Direction): Texture => {
  switch (direction) {
    case 'up':
      return upTexture;
    case 'upleft':
      return upLeftTexture;
    case 'upright':
      return upRightTexture;
    case 'front':
      return frontTexture;
    case 'frontleft':
      return frontLeftTexture;
    case 'frontright':
      return frontRightTexture;
    case 'left':
      return leftTexture;
    case 'right':
      return rightTexture;
    case 'down':
      return downTexture;
    case 'downleft':
      return downLeftTexture;
    case 'downright':
      return downRightTexture;
  }
};

type UgokiState = 'ready' | 'eating' | 'jumping' | 'saisoku';

/**
 * めんだこぼち
 */
export class Bocchi {
  private view: Sprite;
  private ugokiState: UgokiState;
  private _direction: Direction;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseX: number;
  /// 着地位置
  /// Viewはアニメーション中に位置が変わるため、Viewの位置とは別で管理する
  private _baseY: number;
  private isKaraageWaiting: boolean = false;
  private karaageSaisokuTaskTimer: number | undefined;
  private karaageAkirameTaskTimer: number | undefined;

  constructor() {
    this.view = new Sprite(frontTexture);
    this.ugokiState = 'ready';
    this._direction = 'front';
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

  get isEatable(): boolean {
    return this.ugokiState == 'ready';
  }

  private set direction(direction: Direction) {
    this._direction = direction;
    this.view.texture = texture(this._direction);
  }

  addToParent = (parent: Container) => {
    parent.addChild(this.view);
  };

  isTouched = (event: FederatedPointerEvent): boolean => {
    return this.view.containsPoint(event.getLocalPosition(this.view, undefined, event.global));
  };

  // SECTION: ユーザアクション

  onKaraageMoving = (event: FederatedPointerEvent) => {
    if (this.ugokiState == 'eating') {
      return;
    }

    this.lookAtKaraage(event);

    // 食べさせてもらえるのを諦めるのをやめる
    if (this.karaageAkirameTaskTimer) {
      clearTimeout(this.karaageAkirameTaskTimer);
      this.karaageAkirameTaskTimer = undefined;
    }

    // 唐揚げを運んでいる最中に、不定期に催促する
    // 唐揚げ持ち運び終了時に揮発する
    if (!this.karaageSaisokuTaskTimer) {
      let delay = Math.random() * 3000 + 3000;
      this.karaageSaisokuTaskTimer = setTimeout(this.karaageSaisokuTask, delay);
    }
  };

  onKaraageMoveEnd = () => {
    // 唐揚げが置かれたら、もう催促はしない
    if (this.karaageSaisokuTaskTimer) {
      clearTimeout(this.karaageSaisokuTaskTimer);
      this.karaageSaisokuTaskTimer = undefined;
    }

    if (this.ugokiState != 'eating') {
      // しばらくしたら、食べさせてもらえるのを諦めて元の状態に戻る
      // もう一度唐揚げを運び始めるか、食べ始めた際に揮発する
      let delay = Math.random() * 1000 + 1000;
      this.karaageAkirameTaskTimer = setTimeout(() => {
        this.direction = 'front';
        this.isKaraageWaiting = false;
      }, delay);
    }
  };

  private onTouch = async () => {
    if (this.ugokiState == 'ready' || this.ugokiState == 'jumping') {
      this.ugokiState = 'jumping';
      touchSound.play();
      jump(
        1,
        15,
        this._baseY,
        (y) => {
          this.view.y = y;
        },
        () => {
          this.ugokiState = 'ready';
        }
      );
    }
  };

  /**
   * 唐揚げを食べる
   * @param 唐揚げ完食時に呼び出される
   */
  eatKaraage = async (karaage: Karaage, onAteKaraage: () => void) => {
    if (!this.isEatable) {
      return;
    }

    if (this.karaageAkirameTaskTimer) {
      clearTimeout(this.karaageAkirameTaskTimer);
      this.karaageAkirameTaskTimer = undefined;
    }

    this.ugokiState = 'eating';
    this.direction = 'front';

    // 唐揚げを口に運ぶ
    karaage.y = this.baseY + 60;
    karaage.x = this.baseX;

    const paku = async () => {
      pakupakuSound.play();
      await jumpSync(1, 8, this._baseY, (y) => {
        this.view.y = y;
      });
    };

    const pyon = async () => {
      touchSound.play();
      await jumpSync(1, 15, this._baseY, (y) => {
        this.view.y = y;
      });
    };

    await sleep(200);
    await paku();
    await sleep(200);
    await paku();
    await sleep(200);
    await paku();
    await sleep(500);
    onAteKaraage();
    await sleep(200);
    await pyon();
    if (this.isKaraageWaiting) {
      await pyon();
    }
    await sleep(200);

    this.isKaraageWaiting = false;
    this.ugokiState = 'ready';
  };

  // SECTION: 非同期実行アクション

  /**
   * 唐揚げを見ている間に定期的に実行したいタスク
   */
  private karaageSaisokuTask = async () => {
    if (this.ugokiState != 'ready') {
      let kimagureDelay = Math.random() * 3000 + 3000;
      this.karaageSaisokuTaskTimer = setTimeout(this.karaageSaisokuTask, kimagureDelay);
      return;
    }

    this.ugokiState = 'saisoku';
    // 唐揚げを見ていたら、催促する
    let jumpCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < jumpCount; i++) {
      touchSound.play();
      await jumpSync(1, 15, this._baseY, (y) => {
        this.view.y = y;
      });
      await sleep(200);
    }
    this.isKaraageWaiting = true;
    this.ugokiState = 'ready';

    let kimagureDelay = Math.random() * 3000 + 3000;
    this.karaageSaisokuTaskTimer = setTimeout(this.karaageSaisokuTask, kimagureDelay);
  };

  // SECTION: その他

  /**
   * めんだこぼちに唐揚げを注視させる
   * @param event 唐揚げ位置
   */
  private lookAtKaraage = (event: FederatedPointerEvent) => {
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
}

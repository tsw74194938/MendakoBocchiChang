export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

/**
 * 位置調整対象の情報
 */
export type SnapTarget = {
  position: Point;
  size: Size;
  anchor: {
    x: number;
    y: number;
  };
};

/**
 * sleepする
 * @param milliseconds sleepするミリ秒
 */
export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * targetの位置を枠内に収めるように調整し、調整後の位置を返す
 * @param frame: 枠のサイズ
 * @param target 調整対象の情報
 * @returns 調整後の位置
 */
export const calcSnappedPosition = (frame: Size, target: SnapTarget): Point => {
  return {
    x: Math.min(
      Math.max(target.position.x, target.size.width * target.anchor.x),
      frame.width - target.size.width * (1 - target.anchor.x)
    ),
    y: Math.min(
      Math.max(target.position.y, target.size.height * target.anchor.y),
      frame.height - target.size.height * (1 - target.anchor.y)
    ),
  };
};

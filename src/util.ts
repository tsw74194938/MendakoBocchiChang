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
 * zIndexをソート可能なI/F
 */
export interface ZSortable {
  zIndex: number;
}

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

/**
 * アイテムを最前面に持っていく
 * @param target 手前に持ってくる対象のアイテム
 * @param items 並び替え対象のアイテム群
 */
export const bringToForward = (target: ZSortable, items: ZSortable[]) => {
  const zIndices = items.map((i) => i.zIndex);
  const frontmostItemIndex = zIndices.indexOf(Math.max(...zIndices));
  target.zIndex = items[frontmostItemIndex].zIndex + 1;
};

/**
 * アイテムを最奥に持っていく
 * @param target 最奥に持っていく対象のアイテム
 * @param itemsa 並び替え対象のアイテム群
 */
export const bringToBackward = (target: ZSortable, items: ZSortable[]) => {
  const zIndices = items.map((i) => i.zIndex);
  const backmostItemIndex = zIndices.indexOf(Math.min(...zIndices));
  target.zIndex = items[backmostItemIndex].zIndex - 1;
};

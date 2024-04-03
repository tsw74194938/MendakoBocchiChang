/**
 * sleepする
 * @param milliseconds sleepするミリ秒
 */
export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

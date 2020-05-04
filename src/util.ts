export const asyncFilter = async <T>(
  arr: T[],
  pred: (el: T) => Promise<Boolean>
) => {
  const evalEls = await Promise.all(arr.map(pred));
  return arr.filter((_, i) => Boolean(evalEls[i]));
};

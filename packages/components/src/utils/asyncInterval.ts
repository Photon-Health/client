export const asyncInterval = async (callback: () => boolean, ms: number, triesLeft = 5) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      if (await callback()) {
        resolve(void 0);
        clearInterval(interval);
      } else if (triesLeft <= 1) {
        reject();
        clearInterval(interval);
      }
      triesLeft--;
    }, ms);
  });
};

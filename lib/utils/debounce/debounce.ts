export function debounceAsync<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  delay: number
) {
  let timeout: NodeJS.Timeout | null = null;
  let isRunning = false;

  return async (...args: Parameters<F>) => {
    if (isRunning) return; // prevent spamming while one is running

    if (timeout) clearTimeout(timeout);

    return new Promise<ReturnType<F>>((resolve) => {
      timeout = setTimeout(async () => {
        isRunning = true;
        try {
          const result = await fn(...args);
          resolve(result);
        } finally {
          isRunning = false;
        }
      }, delay);
    });
  };
}

/**
 * Уменьшить частоту выполнения функции
 * @param {Function} throttledFunction функция, которую нужно реже вызывать (обязательное)
 * @param {number} timeout интервал вызовов функции в мс (обязательное)
 */
export default function throttle(throttledFunction: (...args: any[]) => void, timeout: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function perform(...args: any[]) {
    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      throttledFunction(...args);

      clearTimeout(timer!);

      timer = null;
    }, timeout);
  };
}

/** requestIdleCallback with a timer fallback (Safari). */
export const idle = (fn, timeout = 800) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout }) : window.setTimeout(fn, 200);

export const cancelIdle = (id) =>
  'cancelIdleCallback' in window ? window.cancelIdleCallback(id) : window.clearTimeout(id);

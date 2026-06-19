/**
 * Animates scrolling to a target Y position smoothly using easeInOutCubic.
 * Works consistently across all browsers and configurations.
 * 
 * @param {number} targetY - The target scroll position in pixels.
 * @param {number} duration - Animation duration in milliseconds.
 */
export const smoothScrollTo = (targetY, duration = 600) => {
  const startY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  const difference = targetY - startY;
  const startTime = Date.now();

  console.log(`[smoothScrollTo] Starting scroll from ${startY} to ${targetY} over ${duration}ms. Difference: ${difference}`);

  if (difference === 0) {
    console.log('[smoothScrollTo] Scroll difference is 0. Aborting.');
    return;
  }

  function step() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // EaseInOutCubic timing function (gentler acceleration/deceleration)
    const easeProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    const nextY = startY + difference * easeProgress;
    window.scrollTo(0, nextY);

    console.log(`[smoothScrollTo] Frame - Elapsed: ${elapsed}ms, Progress: ${(progress * 100).toFixed(1)}%, Target Y: ${nextY}`);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      console.log('[smoothScrollTo] Scroll animation finished.');
    }
  }

  window.requestAnimationFrame(step);
};

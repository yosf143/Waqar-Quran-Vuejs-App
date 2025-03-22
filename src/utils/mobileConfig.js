export function setupTouchEvents() {

  document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {

      event.preventDefault();
    }
  }, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {

      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}
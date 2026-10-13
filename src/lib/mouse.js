// Normalised pointer position (-1..1), shared by the 3D scenes. A plain object => no re-renders.
export const mouse = { x: 0, y: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return; // touch is handled below (works while the page scrolls)
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );

  // Touch-drag gives a gentle tilt; letting go eases the scene back to centre (no gyroscope, no prompts).
  const touch = (e) => {
    const t = e.touches[0];
    if (!t) return;
    mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((t.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('touchstart', touch, { passive: true });
  window.addEventListener('touchmove', touch, { passive: true });
  const release = () => {
    mouse.x = 0;
    mouse.y = 0;
  };
  window.addEventListener('touchend', release, { passive: true });
  window.addEventListener('touchcancel', release, { passive: true });
}

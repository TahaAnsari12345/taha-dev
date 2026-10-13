// Lets the loading screen wait until the hero 3D scene has drawn its first frame.
let settle;
export const heroReady = new Promise((resolve) => {
  settle = resolve;
});

/** Called by the hero scene after its first frame, or by anything that means "no scene is coming". */
export const markHeroReady = () => settle();

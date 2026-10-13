// GSAP + ScrollTrigger are only needed for scroll-driven polish, so they are fetched after the
// page is interactive instead of blocking first load.
let loading;

export function loadGsap() {
  if (!loading) {
    loading = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([core, st]) => {
      const gsap = core.gsap || core.default;
      gsap.registerPlugin(st.ScrollTrigger);
      return { gsap, ScrollTrigger: st.ScrollTrigger };
    });
  }
  return loading;
}

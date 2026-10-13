import { lazy, useSyncExternalStore } from 'react';

/**
 * Below-the-fold sections are code-split AND only mounted when the visitor gets near them (or jumps
 * to them from the nav). That keeps the first load, and Lighthouse's main-thread budget, small.
 * Order matters: mounting a section always mounts the ones above it first so anchors land correctly.
 */
export const SECTION_ORDER = ['skills', 'projects', 'experience', 'achievements', 'github', 'contact'];

const loaders = {
  skills: () => import('../sections/Skills'),
  projects: () => import('../sections/Projects'),
  experience: () => import('../sections/Experience'),
  achievements: () => import('../sections/Achievements'),
  github: () => import('../sections/GitHubStats'),
  contact: () => import('../sections/Contact'),
};

export const sectionComponents = Object.fromEntries(SECTION_ORDER.map((id) => [id, lazy(loaders[id])]));

// Approximate heights for the empty placeholders (avoids a big jump when the real section mounts)
export const PLACEHOLDER_HEIGHT = {
  skills: 1500,
  projects: 3800,
  experience: 900,
  achievements: 800,
  github: 900,
  contact: 900,
};

let mountedIndex = -1;
const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useMountedIndex = () => useSyncExternalStore(subscribe, () => mountedIndex, () => -1);

export function mountUpTo(id) {
  const i = SECTION_ORDER.indexOf(id);
  if (i > mountedIndex) {
    mountedIndex = i;
    listeners.forEach((fn) => fn());
  }
}

const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Preloads + mounts everything up to `id`, then waits for layout to settle. No-op for hero/about. */
export async function ensureMounted(id) {
  const i = SECTION_ORDER.indexOf(id);
  if (i < 0) return;
  await Promise.all(SECTION_ORDER.slice(0, i + 1).map((k) => loaders[k]()));
  mountUpTo(id);
  await frame();
  await new Promise((r) => setTimeout(r, 80));
}

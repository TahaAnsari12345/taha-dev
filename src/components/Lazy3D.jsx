import { Component, Suspense, useEffect, useState } from 'react';
import useNearViewport from '../hooks/useNearViewport';
import { cancelIdle, idle } from '../lib/idle';

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** If WebGL fails at runtime we simply show the page without the 3D layer. */
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Mounts a (lazy) 3D scene only when its container is near the viewport and the browser is idle,
 * pauses its render loop when scrolled away, and degrades to nothing when WebGL is unavailable.
 *
 * `onReady` is passed to the scene (it calls it after its first frame). `onSettled` fires instead
 * when no scene will ever appear (no WebGL, or it crashed) so callers don't wait forever.
 */
export default function Lazy3D({ Scene, className = '', onReady, onSettled, enabled = true, ...sceneProps }) {
  const [ref, near] = useNearViewport({ margin: '300px' });
  const [ready, setReady] = useState(false);
  const [supported] = useState(webglSupported);
  const [hidden, setHidden] = useState(() => document.hidden);

  // Stop rendering while the tab is in the background
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (!supported) onSettled?.();
  }, [supported, onSettled]);

  // `enabled` lets a caller hold the (heavy) scene back until the page is interactive
  useEffect(() => {
    if (!enabled || !near || ready || !supported) return undefined;
    const id = idle(() => setReady(true));
    return () => cancelIdle(id);
  }, [enabled, near, ready, supported]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {supported && ready && (
        <SceneBoundary onFail={onSettled}>
          <Suspense fallback={null}>
            <Scene active={near && !hidden} onReady={onReady} {...sceneProps} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}

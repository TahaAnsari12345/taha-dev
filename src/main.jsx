import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource/fira-code/400.css';
import './index.css';
import App from './App';
import { isLowEnd, isNarrow } from './lib/device';

// Weak phones skip the costly glass blur and grain (CSS only applies below 1024px).
if (isNarrow() && isLowEnd()) document.documentElement.dataset.lite = '1';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

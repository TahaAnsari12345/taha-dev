import { useState } from 'react';
import { isFilled } from '../data/portfolio';
import Icon from './Icon';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts / older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

function Row({ label, value }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-widest text-muted">{label}</span>
        <span className="block truncate font-mono text-xs">{value}</span>
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="grid h-8 w-8 max-lg:h-11 max-lg:w-11 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-brand/15 hover:text-cyan"
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
      >
        <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Renders only when BOTH demo credentials are filled in (see src/data/portfolio.js). */
export default function DemoLogin({ demo }) {
  if (!demo || !isFilled(demo.email) || !isFilled(demo.password)) return null;
  return (
    <div className="glass w-full max-w-[260px] space-y-2 rounded-xl px-3 py-2">
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan">
        <Icon name="key" className="h-3 w-3" /> Demo login
      </p>
      <Row label="Email" value={demo.email} />
      <Row label="Password" value={demo.password} />
      {demo.note && <p className="text-[11px] leading-snug text-muted">{demo.note}</p>}
    </div>
  );
}

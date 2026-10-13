import { nav, profile } from '../data/portfolio';
import { scrollToId } from '../lib/scroll';
import Icon from './Icon';
import Socials from './Socials';

export default function Footer() {
  return (
    <footer className="relative border-t border-muted/15 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10">
      <div className="container-x flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-display text-lg font-bold">
            <span className="gradient-text">{profile.name}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} · Built with React, Three.js &amp; a lot of coffee.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(n.id);
                  }}
                  className="transition hover:text-cyan max-lg:inline-block max-lg:py-2"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resume} download={profile.resumeFileName} className="transition hover:text-cyan max-lg:inline-block max-lg:py-2">
                Resume
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Socials />
          <button
            type="button"
            onClick={() => scrollToId('top')}
            className="btn-ghost !min-h-[44px] !px-4"
            aria-label="Back to top"
          >
            <Icon name="up" className="h-4 w-4" /> Top
          </button>
        </div>
      </div>
    </footer>
  );
}

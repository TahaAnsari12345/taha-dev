import { LAUNCH_NOTE, isFilled } from '../data/portfolio';
import Icon from './Icon';
import LaunchButton from './LaunchButton';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/**
 * Live Demo / GitHub buttons. A link that is empty or still a "[ADD_...]" placeholder is simply
 * not rendered (no broken buttons). Projects with a `wakeId` get the wake-then-open LaunchButton.
 */
export default function ProjectLinks({ project, children }) {
  const { links, title, wakeId } = project;
  const { live, github } = links;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-3">
        {isFilled(live) &&
          (wakeId ? (
            <LaunchButton wakeId={wakeId} url={live} title={title} />
          ) : (
            <a href={live} {...ext} className="btn-primary" aria-label={`${title}: live demo (opens in a new tab)`}>
              Live Demo <Icon name="external" className="h-4 w-4" />
            </a>
          ))}
        {children}
        {isFilled(github) && (
          <a href={github} {...ext} className="btn-ghost" aria-label={`${title}: source code on GitHub (opens in a new tab)`}>
            <Icon name="github" className="h-4 w-4" /> GitHub
          </a>
        )}
      </div>
      {wakeId && isFilled(live) && <p className="max-w-md text-[11px] leading-snug text-muted">{LAUNCH_NOTE}</p>}
    </div>
  );
}

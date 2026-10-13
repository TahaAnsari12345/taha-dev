import { lazy, Suspense } from 'react';
import DemoLogin from './DemoLogin';
import { ProjectScreen } from './ProjectCard';
import ProjectLinks from './ProjectLinks';
import Reveal from './Reveal';
import TiltCard from './TiltCard';
import useNearViewport from '../hooks/useNearViewport';

const ShopziArchitecture = lazy(() => import('./ShopziArchitecture'));

/** Loads the (lazy) architecture diagram only when it is about to scroll into view. */
export function ArchitectureSlot({ data, title = 'Architecture' }) {
  const [ref, near] = useNearViewport({ once: true, margin: '300px' });
  return (
    <Reveal>
      <div ref={ref} className="glass rounded-[2rem] p-6 sm:p-10">
        <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-[0.25em] text-cyan">{title}</h4>
        <div className="min-h-[320px]">
          {near && (
            <Suspense fallback={null}>
              <ShopziArchitecture data={data} />
            </Suspense>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/** Large layout for the featured project (kept short: summary, 3 highlights, tech, links). */
export default function FeaturedProject({ project, compact = false }) {
  const card = (
        <article aria-labelledby="featured-title" className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <div className="blob -right-10 -top-10 h-72 w-72 bg-brand" aria-hidden="true" />
          <div className="relative grid items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" /> Featured project
              </span>
              <h3 id="featured-title" className="mt-4 text-3xl font-bold sm:text-5xl">
                {project.title}
              </h3>
              <p className="mt-2 text-base font-medium text-cyan sm:text-lg">{project.tagline}</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">{project.description}</p>

              <ul className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Highlights">
                {project.highlights.map((h) => (
                  <li key={h.title} className="glass rounded-xl px-3 py-2 text-sm font-medium">
                    <span aria-hidden="true" className="mr-2 text-cyan">
                      ▸
                    </span>
                    {h.title}
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                {project.tech.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ProjectLinks project={project}>
                  <DemoLogin demo={project.demo} />
                </ProjectLinks>
              </div>
            </div>

            <div className="lg:col-span-2">
              <TiltCard max={7}>
                <div style={{ transformStyle: 'preserve-3d' }}>
                  <div style={{ transform: 'translateZ(40px)' }}>
                    <ProjectScreen project={project} className="shadow-glow" />
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </article>
  );

  // `compact` = just the card (used as a slide in the phone carousel; its architecture sits below the carousel)
  if (compact) return card;
  return (
    <div className="space-y-6">
      <Reveal>{card}</Reveal>
      {project.architecture && <ArchitectureSlot data={project.architecture} />}
    </div>
  );
}

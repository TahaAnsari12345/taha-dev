import DemoLogin from './DemoLogin';
import ProjectLinks from './ProjectLinks';
import ProjectMockup from './ProjectMockup';
import TiltCard from './TiltCard';

/** Mockup or screenshot area. `image` (optional, in the data file) overrides the SVG mockup. */
export function ProjectScreen({ project, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-muted/20 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] ${className}`}
      style={{ aspectRatio: '5 / 3' }}
    >
      {project.image ? (
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <ProjectMockup kind={project.kind} accent={project.accent} title={project.title} />
      )}
    </div>
  );
}

export default function ProjectCard({ project }) {
  return (
    <TiltCard className="h-full">
      <article className="glass flex h-full flex-col rounded-3xl p-5 sm:p-6" style={{ transformStyle: 'preserve-3d' }}>
        {/* the screen floats above the card */}
        <div style={{ transform: 'translateZ(48px)' }} className="mb-5">
          <ProjectScreen project={project} />
        </div>

        <div className="flex flex-1 flex-col" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            {project.badge && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                {project.badge}
              </span>
            )}
          </div>
          {project.tagline && <p className="mt-1 text-sm font-medium text-cyan">{project.tagline}</p>}
          <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

          {project.highlights && (
            <ul className="mt-3 space-y-1 text-sm" aria-label={`${project.title} highlights`}>
              {project.highlights.map((h) => (
                <li key={h.title} className="flex gap-2">
                  <span aria-hidden="true" className="text-cyan">
                    ▸
                  </span>
                  {h.title}
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${project.title} tech stack`}>
            {project.tech.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            <ProjectLinks project={project}>
              <DemoLogin demo={project.demo} />
            </ProjectLinks>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

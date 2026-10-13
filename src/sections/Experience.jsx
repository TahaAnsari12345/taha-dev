import { useEffect, useRef } from 'react';
import { loadGsap } from '../lib/gsap';
import { experience } from '../data/portfolio';
import useDeviceTier from '../hooks/useDeviceTier';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';


export default function Experience() {
  const wrap = useRef(null);
  const line = useRef(null);
  const { reduce } = useDeviceTier();

  // The glowing spine "draws" itself as the timeline scrolls through the viewport.
  useEffect(() => {
    if (reduce) return undefined;
    let ctx;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          line.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: wrap.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
          },
        );
      }, wrap);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduce]);

  return (
    <section id="experience" className="section">
      <div className="container-x">
        <SectionHeading eyebrow="04 / Experience" title="Where I've been" accent="building">
          Hands-on internships that shaped how I ship software.
        </SectionHeading>

        <div ref={wrap} className="relative mx-auto max-w-3xl">
          <div aria-hidden="true" className="absolute bottom-0 left-[11px] top-2 w-px bg-muted/20 sm:left-[15px]" />
          <div
            ref={line}
            aria-hidden="true"
            style={reduce ? undefined : { transform: "scaleY(0)" }}
            className="absolute bottom-0 left-[11px] top-2 w-px origin-top bg-gradient-to-b from-brand via-cyan to-violet shadow-[0_0_12px_rgb(var(--cyan)/0.8)] sm:left-[15px]"
          />

          <ol className="space-y-10">
            {experience.map((job, i) => (
              <Reveal key={job.role} as="li" delay={i * 0.1} className="relative pl-10 sm:pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-6 grid h-6 w-6 place-items-center rounded-full bg-bg ring-2 ring-cyan sm:h-8 sm:w-8"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_12px_rgb(var(--cyan))]" />
                </span>
                <article className="glass rounded-2xl p-6 transition hover:border-cyan/40 hover:shadow-glow-cyan">
                  <p className="font-mono text-xs text-cyan">{job.period}</p>
                  <h3 className="mt-2 text-xl font-semibold">{job.role}</h3>
                  <p className="text-sm font-medium text-muted">{job.company}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

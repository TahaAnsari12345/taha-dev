import { about, profile } from '../data/portfolio';
import Counter from '../components/Counter';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import TiltCard from '../components/TiltCard';

export default function About() {
  return (
    <section id="about" className="section">
      <div className="blob -right-24 top-20 h-72 w-72 bg-brand" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading eyebrow="01 / About" title="Building complete products," accent="end to end" />

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="space-y-6 lg:col-span-3">
            {/* photo on the left of the text (small and above it on phones) */}
            <div className="grid items-start gap-6 sm:grid-cols-[210px_1fr] sm:gap-8">
              <Reveal className="mx-auto w-40 sm:mx-0 sm:w-full">
                <TiltCard max={8}>
                  <div
                    className="overflow-hidden rounded-2xl border border-brand/60 shadow-glow"
                    style={{ aspectRatio: '4 / 5' }}
                  >
                    <img
                      src={profile.portrait}
                      alt="Taha Ansari"
                      width="800"
                      height="1000"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TiltCard>
              </Reveal>

              <div className="space-y-6">
                {about.paragraphs.map((p, i) => (
                  <Reveal key={p} delay={i * 0.08}>
                    <p className="text-lg leading-relaxed text-muted">{p}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              {about.education.map((e, i) => (
                <Reveal key={e.title} delay={0.1 + i * 0.1}>
                  <article className="glass h-full rounded-2xl p-5">
                    <p className="font-mono text-xs uppercase tracking-widest text-cyan">Education</p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug">{e.title}</h3>
                    <p className="mt-1 text-sm text-muted">{e.place}</p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold text-fg">{e.meta}</span>
                      {e.period && <span className="font-mono text-xs text-muted">{e.period}</span>}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {about.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="glass flex h-full min-h-[150px] flex-col justify-between rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
                  <p className="font-display text-3xl font-bold gradient-text sm:text-4xl">
                    <Counter {...s} />
                  </p>
                  <p className="mt-4 text-sm text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

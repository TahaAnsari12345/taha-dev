import { achievements, certifications } from '../data/portfolio';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

export default function Achievements() {
  return (
    <section id="achievements" className="section">
      <div className="blob right-0 top-10 h-72 w-72 bg-cyan" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading eyebrow="05 / Achievements" title="Recognition &" accent="certifications" />

        <ul className="grid gap-5 md:grid-cols-3">
          {achievements.map((a, i) => (
            <Reveal key={a.title} as="li" delay={i * 0.1}>
              <article className="glass relative h-full overflow-hidden rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:shadow-glow sm:p-6">
                <span
                  aria-hidden="true"
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand/40 to-violet/30 blur-2xl"
                />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-violet text-white shadow-glow">
                  <Icon name={a.icon} className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold">{a.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12">
          <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-cyan">Certifications</h3>
          <ul className="grid gap-4 sm:grid-cols-3">
            {certifications.map((c) => (
              <li key={c.name} className="glass flex items-center gap-4 rounded-2xl p-4 sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan/15 text-cyan">
                  <Icon name="award" />
                </span>
                <div>
                  <p className="font-semibold leading-snug">{c.name}</p>
                  <p className="text-sm text-muted">{c.issuer}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { profile } from '../data/portfolio';
import useGitHubStats from '../hooks/useGitHubStats';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const langColors = ['#2563eb', '#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];

/** Counts up to `value` (and from the old value to a new one on refresh). Instant for reduced motion. */
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const current = useRef(shown);

  useEffect(() => {
    if (reduce) {
      current.current = value;
      setShown(value);
      return undefined;
    }
    let raf = 0;
    const from = current.current;
    const t0 = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      current.current = Math.round(from + (value - from) * (1 - (1 - t) ** 3));
      setShown(current.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </>
  );
}

/** "Updated X min ago", re-evaluated every 30 s. */
function UpdatedAgo({ at }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / 60000));
  const label = mins < 1 ? 'just now' : mins === 1 ? '1 min ago' : mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} h ago`;
  return <p className="mt-4 text-center font-mono text-xs text-muted">Updated {label}</p>;
}

function Stat({ icon, label, value, loading }) {
  return (
    <div className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
      <Icon name={icon} className="h-5 w-5 text-cyan" />
      <p className="mt-3 font-display text-3xl font-bold">
        {loading ? <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-muted/20" /> : <CountUp value={value} />}
      </p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

function Skeleton({ className }) {
  return <span className={`block animate-pulse rounded-lg bg-muted/20 ${className}`} />;
}

export default function GitHubStats() {
  const { status, data } = useGitHubStats();
  const loading = status === 'loading';
  const failed = status === 'error';

  return (
    <section id="github" className="section">
      <div className="container-x">
        <SectionHeading eyebrow="06 / GitHub" title="Open-source" accent="footprint">
          Live numbers from the public GitHub API.
        </SectionHeading>

        {!failed && (
          <Reveal>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <Stat icon="users" label="Followers" value={data?.followers} loading={loading} />
              <Stat icon="fork" label="Following" value={data?.following} loading={loading} />
              <Stat icon="repo" label="Public repos" value={data?.publicRepos} loading={loading} />
              <Stat icon="star" label="Total stars" value={data?.totalStars} loading={loading} />
            </div>
          </Reveal>
        )}

        {failed && (
          <Reveal>
            <div role="status" className="glass flex flex-col items-center gap-4 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted">
                Live GitHub stats can&apos;t be loaded right now. Everything is still on my profile.
              </p>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Icon name="github" className="h-4 w-4" /> View on GitHub
              </a>
            </div>
          </Reveal>
        )}

        {loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5" aria-hidden="true">
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <Skeleton className="h-3 w-28" />
              <div className="mt-6 space-y-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6 lg:col-span-3">
              <Skeleton className="h-3 w-28" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-2">
              <div className="glass h-full rounded-2xl p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Top languages</h3>
                {data.topLanguages.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No language data yet.</p>
                ) : (
                  <ul className="mt-5 space-y-4">
                    {data.topLanguages.map((l, i) => (
                      <li key={l.name}>
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span>{l.name}</span>
                          <span className="font-mono text-muted">{l.percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted/20">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: langColors[i % langColors.length] }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${l.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            <Reveal className="lg:col-span-3" delay={0.1}>
              <div className="glass h-full rounded-2xl p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Recently active</h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                  {data.latestRepos.map((r) => (
                    <li key={r.name}>
                      <a
                        href={r.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full rounded-xl border border-muted/15 p-4 transition hover:border-cyan/50 hover:bg-brand/10"
                      >
                        <p className="flex items-center justify-between gap-2 font-semibold">
                          <span className="truncate">{r.name}</span>
                          <Icon name="external" className="h-3.5 w-3.5 shrink-0 text-muted" />
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                          {r.description || 'No description yet.'}
                        </p>
                        <p className="mt-3 flex items-center gap-3 font-mono text-[11px] text-muted">
                          {r.language && <span>{r.language}</span>}
                          <span className="inline-flex items-center gap-1">
                            <Icon name="star" className="h-3 w-3" /> {r.stars}
                          </span>
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        )}

        {data?.updatedAt && <UpdatedAgo at={data.updatedAt} />}

        <Reveal className="mt-6 flex justify-center">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Icon name="github" className="h-4 w-4" /> View GitHub profile
          </a>
        </Reveal>
      </div>
    </section>
  );
}

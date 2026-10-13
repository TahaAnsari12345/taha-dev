import { useState } from 'react';
import { profile } from '../data/portfolio';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { useToast } from '../components/Toast';

const LIMITS = { name: 80, subject: 120, messageMin: 10, message: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const empty = { name: '', email: '', subject: '', message: '', website: '' }; // `website` = honeypot

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.subject.trim().length < 3) e.subject = 'Please add a short subject.';
  if (v.message.trim().length < LIMITS.messageMin) e.message = `Message should be at least ${LIMITS.messageMin} characters.`;
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

const contactItems = [
  { icon: 'mail', label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { icon: 'linkedin', label: 'LinkedIn', value: 'taha-ansari', href: profile.linkedin, external: true },
  { icon: 'github', label: 'GitHub', value: 'TahaAnsari12345', href: profile.github, external: true },
  { icon: 'pin', label: 'Location', value: profile.location },
];

export default function Contact() {
  const { toast } = useToast();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    if (status === 'success' || status === 'error') setStatus('idle');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('success');
      setValues(empty);
      toast({ type: 'success', message: "Message sent. Thanks for reaching out, I'll get back to you soon." });
    } catch {
      setStatus('error');
      toast({
        type: 'error',
        message: `Couldn't send your message. Please try again, or email me at ${profile.email}.`,
      });
    }
  };

  const sending = status === 'sending';
  const describe = (k) => (errors[k] ? `${k}-error` : undefined);

  return (
    <section id="contact" className="section">
      <div className="blob -left-24 bottom-0 h-80 w-80 bg-brand" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading eyebrow="07 / Contact" title="Let's build something" accent="together">
          Hiring, collaborating or just saying hi? Send a message and I&apos;ll reply directly.
        </SectionHeading>

        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <form onSubmit={onSubmit} noValidate className="glass space-y-5 rounded-3xl p-6 sm:p-8" aria-busy={sending}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Name" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    value={values.name}
                    onChange={set('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={describe('name')}
                    className="input"
                    placeholder="Jane Doe"
                    disabled={sending}
                  />
                </Field>
                <Field id="email" label="Email" error={errors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={set('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describe('email')}
                    className="input"
                    placeholder="Your email address"
                    disabled={sending}
                  />
                </Field>
              </div>

              <Field id="subject" label="Subject" error={errors.subject}>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  maxLength={LIMITS.subject}
                  value={values.subject}
                  onChange={set('subject')}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={describe('subject')}
                  className="input"
                  placeholder="Software Engineer opportunity"
                  disabled={sending}
                />
              </Field>

              <Field id="message" label="Message" error={errors.message}>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={LIMITS.message}
                  value={values.message}
                  onChange={set('message')}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describe('message')}
                  className="input resize-y"
                  placeholder="Tell me about the role or project..."
                  disabled={sending}
                />
                <p className="mt-1 text-right font-mono text-[11px] text-muted">
                  {values.message.length}/{LIMITS.message}
                </p>
              </Field>

              {/* Honeypot: invisible to people, tempting to bots. Never fill this in. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={set('website')}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={sending} className="btn-primary min-w-[160px] max-sm:w-full disabled:cursor-not-allowed disabled:opacity-70">
                  {sending ? (
                    <>
                      <Icon name="spinner" className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <Icon name="check" className="h-4 w-4" /> Sent
                    </>
                  ) : (
                    <>
                      <Icon name="send" className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
                <p role="status" aria-live="polite" className="text-sm">
                  {status === 'success' && <span className="text-emerald-700 dark:text-emerald-400">Message sent. Thanks for reaching out!</span>}
                  {status === "error" && (
                    <span className="text-rose-600 dark:text-rose-400">
                      Sorry, that did not go through. Please try again, or email{" "}
                      <a href={`mailto:${profile.email}`} className="underline underline-offset-2">
                        {profile.email}
                      </a>
                      .
                    </span>
                  )}
                </p>
              </div>
            </form>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.1}>
            <ul className="space-y-4">
              {contactItems.map((c) => {
                const body = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/15 text-cyan">
                      <Icon name={c.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] uppercase tracking-widest text-muted">{c.label}</span>
                      <span className="block truncate font-medium">{c.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="glass flex items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-cyan/50"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="glass flex items-center gap-4 rounded-2xl p-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

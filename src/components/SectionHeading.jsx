import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, accent, children, align = 'left' }) {
  return (
    <Reveal className={`mb-12 max-w-2xl sm:mb-16 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
        {title} {accent && <span className="gradient-text">{accent}</span>}
      </h2>
      {children && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{children}</p>}
    </Reveal>
  );
}

import { profile } from '../data/portfolio';
import Icon from './Icon';

const items = [
  { name: 'GitHub', icon: 'github', href: profile.github, external: true },
  { name: 'LinkedIn', icon: 'linkedin', href: profile.linkedin, external: true },
  { name: 'Email', icon: 'mail', href: `mailto:${profile.email}`, external: false },
];

export default function Socials({ className = '' }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {items.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            aria-label={s.name}
            className="glass grid h-11 w-11 place-items-center rounded-xl text-muted transition hover:-translate-y-0.5 hover:border-cyan/50 hover:text-cyan"
          >
            <Icon name={s.icon} className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

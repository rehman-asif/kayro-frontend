import { SOCIAL_LINKS } from '../../data/brand';

interface SocialLinksProps {
  className?: string;
}

export function SocialLinks({ className = 'footer-social' }: SocialLinksProps) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.handle}
        >
          <i className={link.icon} />
        </a>
      ))}
    </div>
  );
}

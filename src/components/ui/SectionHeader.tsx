interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  light?: boolean;
}

export function SectionHeader({ tag, title, description, light }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {tag && <span className="section-tag">{tag}</span>}
      <h2 style={light ? { color: 'var(--white)' } : undefined}>{title}</h2>
      {description && (
        <p style={light ? { color: 'rgba(255,255,255,0.7)' } : undefined}>{description}</p>
      )}
    </div>
  );
}

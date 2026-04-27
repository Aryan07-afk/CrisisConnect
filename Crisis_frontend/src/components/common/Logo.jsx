import { Link } from 'react-router-dom';

export default function Logo({ size = 'normal', link = true, hideText = false }) {
  const isLarge = size === 'large';
  
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: isLarge ? '12px' : '8px', justifyContent: 'center' }}>
      <div style={{ 
        width: isLarge ? '42px' : '30px', 
        height: isLarge ? '42px' : '30px', 
        borderRadius: isLarge ? '10px' : '8px', 
        background: 'linear-gradient(135deg, var(--brand) 0%, #8b5cf6 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#fff', 
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
        flexShrink: 0
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: isLarge ? '22px' : '18px' }}>shield</span>
      </div>
      {!hideText && (
        <div style={{ 
          fontSize: isLarge ? '24px' : '18px', 
          fontWeight: 800, 
          color: 'var(--t1)', 
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap'
        }}>
          Crisis<span style={{ color: 'var(--brand)' }}>Connect</span>
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to="/" style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
}

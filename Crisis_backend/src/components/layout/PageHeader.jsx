export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="topbar-right">{actions}</div>}
    </div>
  );
}

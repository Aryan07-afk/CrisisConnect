export default function Badge({ value, type }) {
  const cls = type || value?.toLowerCase().replace(/\s/g, '_') || 'medium';
  return <span className={`badge-pill ${cls}`}>{value}</span>;
}

export function PriorityDot({ priority }) {
  return <span className={`priority-dot ${priority}`} />;
}

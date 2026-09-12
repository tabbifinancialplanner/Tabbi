export function Card({ children, className, style, onClick, as: As = "div" }) {
  return (
    <As onClick={onClick} className={"tb-card" + (className ? " " + className : "")} style={style}>
      {children}
    </As>
  );
}

export function Button({ children, variant = "primary", size = "md", onClick, type = "button", disabled, style, full }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={style}
      className={`tb-btn tb-btn-${variant} tb-btn-${size}${full ? " tb-btn-full" : ""}`}>
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, label, active }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={"tb-iconbtn" + (active ? " active" : "")}>
      {children}
    </button>
  );
}

export function ProgressBar({ pct, color, height = 8, track }) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return (
    <div className="tb-progress-track" style={{ height, background: track }}>
      <div className="tb-progress-fill" style={{ width: clamped + "%", background: color || "var(--plum)" }} />
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`tb-badge tb-badge-${tone}`}>{children}</span>;
}

export function EmptyState({ title, body, action, icon }) {
  return (
    <div className="tb-empty">
      <div className="tb-empty-icon" aria-hidden="true">{icon || "👀"}</div>
      <div className="tb-empty-title font-display">{title}</div>
      {body ? <div className="tb-empty-body">{body}</div> : null}
      {action ? <div className="tb-empty-action">{action}</div> : null}
    </div>
  );
}

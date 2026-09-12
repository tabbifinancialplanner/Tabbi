import { Button } from "./Primitives.jsx";

export function Modal({ open, onClose, title, children, width }) {
  if (!open) return null;
  return (
    <div className="tb-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tb-modal" style={{ maxWidth: width || 480 }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="tb-modal-head">
          <h3 className="font-display" style={{ margin: 0 }}>{title}</h3>
          <button className="tb-iconbtn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="tb-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>{body}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="tb-field">
      <span className="tb-field-label">{label}</span>
      {children}
      {hint ? <span className="tb-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Input(props) { return <input {...props} className={"tb-input" + (props.className ? " " + props.className : "")} />; }
export function Select({ children, ...props }) { return <select {...props} className={"tb-input" + (props.className ? " " + props.className : "")}>{children}</select>; }
export function Textarea(props) { return <textarea {...props} className={"tb-input" + (props.className ? " " + props.className : "")} />; }

export function Tabs({ items, value, onChange }) {
  return (
    <div className="tb-tabs" role="tablist">
      {items.map(it => (
        <button key={it.value} role="tab" aria-selected={value === it.value}
          className={"tb-tab" + (value === it.value ? " active" : "")} onClick={() => onChange(it.value)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

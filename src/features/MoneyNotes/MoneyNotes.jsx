import { useState } from "react";
import { Card, Button, Modal, Field, Select, Textarea, EmptyState, Badge, ConfirmDialog } from "../../components/ui/index.js";
import { NOTE_CATEGORIES } from "../../data/models.js";
import { addNote, deleteNote } from "../../data/store.js";

export default function MoneyNotes({ state, toast }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ category: NOTE_CATEGORIES[0], text: "" });
  const [delId, setDelId] = useState(null);

  const notes = state.moneyNotes.slice().sort((a, b) => b.date.localeCompare(a.date));

  function save() {
    if (!form.text.trim()) return;
    addNote(form);
    setAddOpen(false);
    setForm({ category: NOTE_CATEGORIES[0], text: "" });
    toast("Note saved.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "var(--ink-soft)", margin: 0 }}>What am I learning?</p>
        <Button onClick={() => setAddOpen(true)}>+ New Note</Button>
      </div>

      {notes.length === 0 ? (
        <Card><EmptyState icon="📝" title="No money notes yet" body="Jot down money thoughts, reflections, or lessons as they come to you." action={<Button onClick={() => setAddOpen(true)}>+ New Note</Button>} /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notes.map(n => (
            <Card key={n.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Badge tone="info">{n.category}</Badge>
                <Button size="sm" variant="ghost" onClick={() => setDelId(n.id)}>Delete</Button>
              </div>
              <p style={{ margin: "10px 0 6px", fontSize: 15 }}>{n.text}</p>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{new Date(n.date).toLocaleDateString()}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New money note" width={420}>
        <Field label="Category">
          <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Note"><Textarea rows={5} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="What's on your mind about money today?" /></Field>
        <Button full onClick={save}>Save note</Button>
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} title="Delete note?" body="This can't be undone." danger confirmLabel="Delete"
        onConfirm={() => { deleteNote(delId); toast("Note deleted."); }} />
    </div>
  );
}

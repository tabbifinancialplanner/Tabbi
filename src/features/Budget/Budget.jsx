import { useState } from "react";
import { Card, ProgressBar, Button, Modal, Field, Input, Select, Tabs, EmptyState } from "../../components/ui/index.js";
import { fmtKES, budgetSummary } from "../../utils/calculations.js";
import { GROUPS, GROUP_LABELS } from "../../data/models.js";
import { getMonth, updateCategory, addCategory } from "../../data/store.js";

export default function Budget({ state, toast }) {
  const [period, setPeriod] = useState("monthly");
  const [editCat, setEditCat] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newCat, setNewCat] = useState({ group: GROUPS.MY_WANTS, name: "", planned: "" });

  const month = getMonth(state.currentMonthId);
  const b = budgetSummary(state, month.id);
  const groupOrder = [GROUPS.MUST_PAY, GROUPS.MY_WANTS, GROUPS.SAVINGS, GROUPS.INVESTMENTS];

  function savePlanned() {
    updateCategory(month.id, editCat.id, { planned: Number(editCat.planned) || 0 });
    setEditCat(null);
    toast("Budget updated.");
  }

  function saveNewCategory() {
    if (!newCat.name.trim()) return;
    addCategory(month.id, newCat.group, newCat.name.trim(), Number(newCat.planned) || 0);
    setAddOpen(false);
    setNewCat({ group: GROUPS.MY_WANTS, name: "", planned: "" });
    toast("Category added.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Tabs value={period} onChange={setPeriod} items={[{ value: "monthly", label: "Monthly" }, { value: "annual", label: "Annual" }, { value: "custom", label: "Custom" }]} />
        <Button onClick={() => setAddOpen(true)}>+ Category</Button>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div className="tb-grid tb-grid-3">
          <div><div className="tb-stat-label">Income</div><div className="tb-stat-value">{fmtKES(b.income)}</div></div>
          <div><div className="tb-stat-label">Planned</div><div className="tb-stat-value">{fmtKES(b.totalPlanned)}</div></div>
          <div><div className="tb-stat-label">Spent</div><div className="tb-stat-value">{fmtKES(b.totalSpent)}</div></div>
        </div>
      </Card>

      {period !== "monthly" && (
        <Card><EmptyState icon="🗓️" title={period === "annual" ? "Annual budgeting is coming to this view" : "Custom periods coming soon"} body="For now, plan month by month — see Annual View in the More menu for yearly totals." /></Card>
      )}

      {period === "monthly" && groupOrder.map(g => {
        const grp = b.byGroup[g];
        if (!grp.categories.length) return null;
        return (
          <Card key={g} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: 19 }}>{GROUP_LABELS[g]}</h3>
              <span style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{fmtKES(grp.spent)} / {fmtKES(grp.planned)}</span>
            </div>
            {grp.categories.map(c => (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <button onClick={() => setEditCat({ id: c.id, name: c.name, planned: c.planned })}
                    style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14.5, color: "var(--ink)", padding: 0 }}>
                    {c.name}
                  </button>
                  <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Planned {fmtKES(c.planned)} · Spent {fmtKES(c.spent)} · Remaining {fmtKES(c.remaining)}</span>
                </div>
                <ProgressBar pct={c.pct} color={c.pct >= 100 ? "var(--warn)" : g === GROUPS.MY_WANTS ? "var(--rose)" : "var(--sage)"} />
              </div>
            ))}
          </Card>
        );
      })}

      <Modal open={!!editCat} onClose={() => setEditCat(null)} title={editCat ? editCat.name : ""} width={380}>
        {editCat && (
          <div>
            <Field label="Planned amount (KSh)"><Input type="number" value={editCat.planned} onChange={e => setEditCat({ ...editCat, planned: e.target.value })} /></Field>
            <Button full onClick={savePlanned}>Save</Button>
          </div>
        )}
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New budget category" width={380}>
        <Field label="Group">
          <Select value={newCat.group} onChange={e => setNewCat({ ...newCat, group: e.target.value })}>
            {groupOrder.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
          </Select>
        </Field>
        <Field label="Name"><Input value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} placeholder="e.g. Travel" /></Field>
        <Field label="Planned amount (KSh)"><Input type="number" value={newCat.planned} onChange={e => setNewCat({ ...newCat, planned: e.target.value })} /></Field>
        <Button full onClick={saveNewCategory}>Add category</Button>
      </Modal>
    </div>
  );
}

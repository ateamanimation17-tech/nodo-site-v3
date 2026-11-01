"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";
import SpendingBreakdown from "./SpendingBreakdown";

type Category = { id: string; name: string; monthly_limit: number };
type Expense = { id: string; category_id: string; amount: number; note: string | null; spent_date: string };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DEFAULT_CATEGORIES = [
  "Groceries", "Restaurants", "Food Delivery", "Drinks", "Entertainment",
  "Bills", "Transport", "Shopping", "Health", "Other",
];

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export default function BudgetTracker() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [catName, setCatName] = useState("");
  const [catLimit, setCatLimit] = useState("");

  const [showLogExpense, setShowLogExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  async function load() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: cats } = await supabase
      .from("budget_categories")
      .select("id, name, monthly_limit")
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    let catList = (cats as Category[]) ?? [];

    // First-time users get a ready-made set of categories so they can log an
    // expense immediately instead of having to create one first.
    if (catList.length === 0) {
      const { data: seeded } = await supabase
        .from("budget_categories")
        .insert(
          DEFAULT_CATEGORIES.map((name, i) => ({
            user_id: user.id,
            name,
            monthly_limit: 0,
            position: i,
          }))
        )
        .select("id, name, monthly_limit");
      catList = (seeded as Category[]) ?? [];
    }

    setCategories(catList);
    if (!expenseCategory && catList.length > 0) setExpenseCategory(catList[0].id);

    const { start, end } = monthBounds(year, month);
    const { data: exp } = await supabase
      .from("budget_expenses")
      .select("id, category_id, amount, note, spent_date")
      .eq("user_id", user.id)
      .gte("spent_date", start)
      .lte("spent_date", end)
      .order("spent_date", { ascending: false });
    setExpenses((exp as Expense[]) ?? []);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  async function addCategory() {
    const limit = parseFloat(catLimit) || 0;
    if (!catName.trim()) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("budget_categories")
      .insert({ user_id: user.id, name: catName.trim(), monthly_limit: limit, position: categories.length })
      .select("id, name, monthly_limit")
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, data as Category]);
      setCatName("");
      setCatLimit("");
      setShowAddCategory(false);
    }
  }

  async function removeCategory(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("budget_categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function logExpense() {
    const amount = parseFloat(expenseAmount);
    if (!expenseCategory || Number.isNaN(amount)) return;
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({
        user_id: user.id,
        category_id: expenseCategory,
        amount,
        note: expenseNote.trim() || null,
      })
      .select("id, category_id, amount, note, spent_date")
      .single();

    if (!error && data) {
      setExpenses((prev) => [data as Expense, ...prev]);
      setExpenseAmount("");
      setExpenseNote("");
      setShowLogExpense(false);
    }
  }

  async function removeExpense(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("budget_expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const spentByCategory: Record<string, number> = {};
  for (const e of expenses) {
    spentByCategory[e.category_id] = (spentByCategory[e.category_id] ?? 0) + e.amount;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="eyebrow">Budget</p>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="btn-ghost rounded-full px-3 py-1.5 text-xs">
            ←
          </button>
          <span className="text-xs text-[color:var(--ink-faint)] font-mono-brand min-w-[90px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => shiftMonth(1)} disabled={isCurrentMonth} className="btn-ghost rounded-full px-3 py-1.5 text-xs disabled:opacity-40">
            →
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setShowAddCategory((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAddCategory ? "Cancel" : "Add category"}
        </button>
        {categories.length > 0 && (
          <button onClick={() => setShowLogExpense((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
            {showLogExpense ? "Cancel" : "Log expense"}
          </button>
        )}
      </div>

      {showAddCategory && (
        <div className="rounded-xl p-4 mb-5 flex gap-2 flex-wrap" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Category, e.g. Groceries"
            className="flex-1 min-w-[140px] rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={catLimit}
            onChange={(e) => setCatLimit(e.target.value)}
            placeholder="Monthly limit (€)"
            className="w-36 rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={addCategory} className="btn-ghost rounded-md px-4 py-2 text-xs">
            Add
          </button>
        </div>
      )}

      {showLogExpense && (
        <div className="rounded-xl p-4 mb-5 flex gap-2 flex-wrap" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
          <select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="Amount (€)"
            className="w-28 rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={expenseNote}
            onChange={(e) => setExpenseNote(e.target.value)}
            placeholder="Note (optional)"
            className="flex-1 min-w-[120px] rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={logExpense} className="btn-ghost rounded-md px-4 py-2 text-xs">
            Log
          </button>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">No categories yet — add one to start budgeting.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <SpendingBreakdown categories={categories} spentByCategory={spentByCategory} />

          <div className="flex flex-col gap-4">
            {categories.map((c) => {
              const spent = spentByCategory[c.id] ?? 0;
              const pct = c.monthly_limit > 0 ? Math.min(Math.round((spent / c.monthly_limit) * 100), 100) : 0;
              const over = c.monthly_limit > 0 && spent > c.monthly_limit;
              return (
                <div key={c.id} className="rounded-xl p-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-[15px] font-medium">{c.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono-brand tabular" style={{ color: over ? "#e08a8a" : "var(--ink-faint)" }}>
                        {formatEUR(spent)}
                        {c.monthly_limit > 0 ? ` / ${formatEUR(c.monthly_limit)}` : ""}
                      </span>
                      <button onClick={() => removeCategory(c.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                        ✕
                      </button>
                    </div>
                  </div>
                  {c.monthly_limit > 0 && (
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: over ? "#e08a8a" : "var(--accent)" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {expenses.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-1.5 mt-2">
                This month&apos;s expenses
              </p>
              <div className="flex flex-col gap-1.5">
                {expenses.map((e) => {
                  const cat = categories.find((c) => c.id === e.category_id);
                  return (
                    <div key={e.id} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: "1px solid var(--line)" }}>
                      <span className="truncate">
                        {cat?.name ?? "—"}
                        {e.note && <span className="text-[color:var(--ink-faint)]"> · {e.note}</span>}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono-brand tabular">{formatEUR(e.amount)}</span>
                        <button onClick={() => removeExpense(e.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

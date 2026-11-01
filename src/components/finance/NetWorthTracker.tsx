"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatEUR } from "@/lib/currency";

type Account = { id: string; name: string; kind: "asset" | "liability"; balance: number; is_main: boolean };
type Snapshot = { snapshot_date: string; net_worth: number };

const inputStyle = { background: "var(--bg-raised)", border: "1px solid var(--line-strong)" };

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NetWorthTracker({ refreshKey }: { refreshKey?: number } = {}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"asset" | "liability">("asset");
  const [balance, setBalance] = useState("");

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
    const { data } = await supabase
      .from("finance_accounts")
      .select("id, name, kind, balance, is_main")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    let accountList = (data as Account[]) ?? [];

    // First-time users get a live Main account (fed by income & expenses)
    // plus a Savings account alongside it, so net worth starts out
    // meaningful instead of empty.
    if (accountList.length === 0) {
      const { data: seeded } = await supabase
        .from("finance_accounts")
        .insert([
          { user_id: user.id, name: "Main account", kind: "asset", balance: 0, is_main: true },
          { user_id: user.id, name: "Savings account", kind: "asset", balance: 0, is_main: false },
        ])
        .select("id, name, kind, balance, is_main");
      accountList = (seeded as Account[]) ?? [];
    }

    setAccounts(accountList);

    const { data: history } = await supabase
      .from("net_worth_snapshots")
      .select("snapshot_date, net_worth")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(6);
    setSnapshots((history as Snapshot[]) ?? []);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [refreshKey]);

  async function saveSnapshot(nextAccounts: Account[]) {
    const netWorth = nextAccounts.reduce(
      (sum, a) => sum + (a.kind === "asset" ? a.balance : -a.balance),
      0
    );
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("net_worth_snapshots")
      .upsert(
        { user_id: user.id, snapshot_date: todayStr(), net_worth: netWorth },
        { onConflict: "user_id,snapshot_date" }
      );
    setSnapshots((prev) => [{ snapshot_date: todayStr(), net_worth: netWorth }, ...prev.filter((s) => s.snapshot_date !== todayStr())].slice(0, 6));
  }

  async function addAccount() {
    const value = parseFloat(balance);
    if (!name.trim() || Number.isNaN(value)) return;

    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("finance_accounts")
      .insert({ user_id: user.id, name: name.trim(), kind, balance: value, is_main: false })
      .select("id, name, kind, balance, is_main")
      .single();

    if (!error && data) {
      const next = [...accounts, data as Account];
      setAccounts(next);
      saveSnapshot(next);
      setName("");
      setBalance("");
      setShowAdd(false);
    }
  }

  async function updateBalance(id: string, value: number) {
    const supabase = getSupabaseClient();
    await supabase.from("finance_accounts").update({ balance: value, updated_at: new Date().toISOString() }).eq("id", id);
    const next = accounts.map((a) => (a.id === id ? { ...a, balance: value } : a));
    setAccounts(next);
    saveSnapshot(next);
  }

  async function removeAccount(id: string) {
    const supabase = getSupabaseClient();
    await supabase.from("finance_accounts").delete().eq("id", id);
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next);
    saveSnapshot(next);
  }

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-[color:var(--ink-faint)]">Loading…</p>
      </div>
    );
  }

  const assets = accounts.filter((a) => a.kind === "asset");
  const liabilities = accounts.filter((a) => a.kind === "liability");
  const netWorth = assets.reduce((s, a) => s + a.balance, 0) - liabilities.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <p className="eyebrow">Net worth</p>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-ghost rounded-full px-4 py-2 text-xs">
          {showAdd ? "Cancel" : "Add account"}
        </button>
      </div>
      <p className="font-display text-3xl tabular mb-1">{formatEUR(netWorth)}</p>
      {snapshots.length > 1 && (
        <p className="text-xs text-[color:var(--ink-faint)] font-mono-brand tabular mb-5">
          {snapshots
            .slice(0, 5)
            .reverse()
            .map((s) => formatEUR(s.net_worth))
            .join(" → ")}
        </p>
      )}
      {snapshots.length <= 1 && <div className="mb-5" />}

      {showAdd && (
        <div
          className="rounded-xl p-4 mb-5 flex flex-col gap-2"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--line)" }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account name, e.g. Savings account"
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={inputStyle}
          />
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "asset" | "liability")}
              className="rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            >
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
            </select>
            <input
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Balance (€)"
              className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <button onClick={addAccount} className="btn-ghost rounded-md px-4 py-2 text-xs self-start">
            Add
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <AccountGroup title="Assets" accounts={assets} onUpdate={updateBalance} onRemove={removeAccount} />
        <AccountGroup title="Liabilities" accounts={liabilities} onUpdate={updateBalance} onRemove={removeAccount} />
      </div>
    </div>
  );
}

function AccountGroup({
  title,
  accounts,
  onUpdate,
  onRemove,
}: {
  title: string;
  accounts: Account[];
  onUpdate: (id: string, value: number) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[color:var(--ink-faint)] font-mono-brand mb-2">{title}</p>
      {accounts.length === 0 ? (
        <p className="text-sm text-[color:var(--ink-faint)]">None yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: "1px solid var(--line)" }}>
              <div className="min-w-0">
                <p className="truncate">{a.name}</p>
                {a.is_main && (
                  <p className="text-[10px] text-[color:var(--ink-faint)]">auto · updates with income &amp; expenses</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {editing === a.id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                      const value = parseFloat(draft);
                      if (!Number.isNaN(value)) onUpdate(a.id, value);
                      setEditing(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="w-24 rounded-md px-2 py-1 text-xs outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditing(a.id);
                      setDraft(String(a.balance));
                    }}
                    className="text-xs font-mono-brand tabular"
                  >
                    {formatEUR(a.balance)}
                  </button>
                )}
                <button onClick={() => onRemove(a.id)} className="btn-ghost rounded-full px-2 py-1 text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

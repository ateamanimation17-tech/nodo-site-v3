import { getSupabaseClient } from "@/lib/supabaseClient";

const MAIN_ACCOUNT_NAME = "Main account";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getMainAccountId(userId: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data: existing } = await supabase
    .from("finance_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_main", true)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from("finance_accounts")
    .insert({ user_id: userId, name: MAIN_ACCOUNT_NAME, kind: "asset", balance: 0, is_main: true })
    .select("id")
    .single();
  if (created) return created.id as string;

  // Lost a creation race against another call (the one-main-per-user
  // constraint) — the other insert won, so re-read what it created.
  if (error) {
    const { data: retry } = await supabase
      .from("finance_accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_main", true)
      .limit(1)
      .maybeSingle();
    if (retry) return retry.id as string;
  }
  return null;
}

async function snapshotNetWorth(userId: string) {
  const supabase = getSupabaseClient();
  const { data: accounts } = await supabase
    .from("finance_accounts")
    .select("kind, balance")
    .eq("user_id", userId);
  const netWorth = ((accounts as { kind: string; balance: number }[]) ?? []).reduce(
    (sum, a) => sum + (a.kind === "asset" ? a.balance : -a.balance),
    0
  );
  await supabase
    .from("net_worth_snapshots")
    .upsert(
      { user_id: userId, snapshot_date: todayStr(), net_worth: netWorth },
      { onConflict: "user_id,snapshot_date" }
    );
}

/**
 * Moves money in or out of the user's live "Main account" — call this
 * whenever an expense is logged (negative delta) or income is received
 * (positive delta) — then refreshes today's net worth snapshot so the
 * Net Worth card's live total and trend stay accurate automatically.
 */
export async function adjustMainAccountBalance(userId: string, delta: number): Promise<void> {
  if (!delta) return;
  const supabase = getSupabaseClient();
  const accountId = await getMainAccountId(userId);
  if (!accountId) return;

  const { data: account } = await supabase
    .from("finance_accounts")
    .select("balance")
    .eq("id", accountId)
    .single();
  const current = (account?.balance as number) ?? 0;

  await supabase
    .from("finance_accounts")
    .update({ balance: current + delta, updated_at: new Date().toISOString() })
    .eq("id", accountId);

  await snapshotNetWorth(userId);
}

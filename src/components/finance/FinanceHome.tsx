"use client";

import { useState } from "react";
import NetWorthTracker from "./NetWorthTracker";
import IncomeTracker from "./IncomeTracker";
import BudgetTracker from "./BudgetTracker";
import SubscriptionTracker from "./SubscriptionTracker";
import SavingsGoals from "./SavingsGoals";

export default function FinanceHome() {
  // Bumped whenever an expense or income entry changes the live Main
  // account balance, so Net Worth (and Income's "net this month") refetch
  // and stay current without a page reload.
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="flex flex-col gap-8">
      <NetWorthTracker refreshKey={version} />
      <IncomeTracker refreshKey={version} onChange={bump} />
      <BudgetTracker onChange={bump} />
      <SubscriptionTracker />
      <SavingsGoals refreshKey={version} />
    </div>
  );
}

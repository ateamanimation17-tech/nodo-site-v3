"use client";

import NetWorthTracker from "./NetWorthTracker";
import BudgetTracker from "./BudgetTracker";
import SubscriptionTracker from "./SubscriptionTracker";
import SavingsGoals from "./SavingsGoals";

export default function FinanceHome() {
  return (
    <div className="flex flex-col gap-8">
      <NetWorthTracker />
      <BudgetTracker />
      <SubscriptionTracker />
      <SavingsGoals />
    </div>
  );
}

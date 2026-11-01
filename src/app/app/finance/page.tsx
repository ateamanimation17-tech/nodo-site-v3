import FinanceHome from "@/components/finance/FinanceHome";

export const metadata = { title: "Finance — NODO" };

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <p className="eyebrow mb-3">03 — Finance</p>
      <h1 className="font-display text-3xl md:text-4xl mb-10">Net worth, budgets & goals</h1>
      <FinanceHome />
    </div>
  );
}

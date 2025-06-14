"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/utils/formatCurrency";
import { startNewSettlement } from "@/lib/actions/settlement.actions";
import { useCurrentGroup } from "@/context/CurrentGroupContext";
import { useUser } from "@/context/UserContext";

const SettlementForm = () => {
  const router = useRouter();
  const { user } = useUser();
  const group = useCurrentGroup();
  if (!user || !group) {
    throw new Error("Missing user or group");
  }

  const { expenses } = useExpenses(group.id);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const unpaid = useMemo(
    () => expenses.filter((e) => !e.settlement_id),
    [expenses]
  );

  const selectedExpenses = useMemo(
    () => unpaid.filter((e) => selected.has(e.id)),
    [unpaid, selected]
  );

  const title = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startSettlement = async () => {
    if (selectedExpenses.length === 0) return;

    await startNewSettlement({
      groupId: group.id,
      initiator: user.id,
      selectedExpenses: selectedExpenses,
      title: title,
    });

    router.push(`/groups/${group.slug}`);
  };

  return (
    <>
      {unpaid.map((expense) => (
        <div key={expense.id} className="flex items-center gap-2">
          <Checkbox
            checked={selected.has(expense.id)}
            onCheckedChange={(v) => toggle(expense.id, v === true)}
          />
          <span>{expense.title}</span>
          <span className="text-muted-foreground">
            {formatCurrency(expense.amount)}
          </span>
        </div>
      ))}

      <Button
        variant="outline"
        disabled={selected.size === 0}
        onClick={startSettlement}
      >
        Start Settlement
      </Button>
    </>
  );
};

export default SettlementForm;

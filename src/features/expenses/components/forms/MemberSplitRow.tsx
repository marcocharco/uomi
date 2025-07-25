import { FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ExpenseFormSchema } from "@/features/expenses/schemas/expenseFormSchema";
import { Member, SplitType } from "@/types";
import { Control, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  getSelectedTotal,
  isOverTotalLimit,
  errorMsgForLimit,
} from "@/features/expenses/utils/splitsHelpers";
import { useEffect, useCallback } from "react";
import { calculateTotalShares } from "@/features/expenses/utils/totalSharesCalculator";
import { calculateSplitCosts } from "@/features/expenses/utils/splitCalculator";
import { formatCurrency } from "@/utils/formatCurrency";

type MemberSplitRowProps = {
  control: Control<z.infer<ReturnType<typeof ExpenseFormSchema>>>;
  member: Member;
  isSelected: boolean;
  splitType: SplitType;
  memberSplits: {
    userId: string;
    weight: number;
  }[];
  selectedMembers: string[];
  currentAmount: number;
  setError: UseFormReturn<
    z.infer<ReturnType<typeof ExpenseFormSchema>>
  >["setError"];
  clearErrors: UseFormReturn<
    z.infer<ReturnType<typeof ExpenseFormSchema>>
  >["clearErrors"];
};

const MemberSplitRow = ({
  control,
  member,
  isSelected,
  splitType,
  memberSplits,
  selectedMembers,
  currentAmount,
  setError,
  clearErrors,
}: MemberSplitRowProps) => {
  const memberIndexMap = Object.fromEntries(
    memberSplits.map((m, i) => [m.userId, i])
  );
  const memberIndex = memberIndexMap[member.id];

  const splitCosts =
    calculateSplitCosts({
      type: splitType,
      totalAmount: currentAmount,
      memberSplits: memberSplits,
      selectedMembers: selectedMembers,
    }) || [];
  const splitAmount =
    splitCosts.find((s) => s.userId === member.id)?.amount ?? 0;

  const totalShares = calculateTotalShares(memberSplits, selectedMembers);

  const splitCostLabel = (() => {
    switch (splitType) {
      case "even":
        return "";
      case "percentage":
        return "%";
      case "shares":
        return `/${totalShares}`;
      case "custom":
        return "$";
      default:
        return "";
    }
  })();

  const checkTotal = useCallback(
    (
      updated: {
        userId: string;
        weight: number;
      }[]
    ) => {
      const total = getSelectedTotal(updated, selectedMembers);

      if (isOverTotalLimit(total, splitType, currentAmount)) {
        setError("memberSplits", {
          type: "manual",
          message:
            splitType === "custom" || splitType === "percentage"
              ? errorMsgForLimit(splitType, currentAmount)
              : "Invalid split type",
        });
      } else {
        clearErrors("memberSplits");
      }
    },
    [selectedMembers, splitType, currentAmount, setError, clearErrors]
  );

  useEffect(() => {
    clearErrors(["memberSplits", "selectedMembers"]);
    checkTotal(memberSplits);
  }, [splitType, checkTotal, memberSplits, clearErrors]);

  return (
    <FormField
      control={control}
      name={`memberSplits.${memberIndex}.weight`}
      render={({ field }) => (
        <>
          <span>{formatCurrency(isSelected ? splitAmount || 0 : 0)}</span>
          <div className="relative">
            <Input
              placeholder={isSelected && splitType !== "even" ? "0" : "-"}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              disabled={!isSelected || splitType === "even"}
              value={
                isSelected && splitType !== "even"
                  ? field.value === 0
                    ? ""
                    : field.value
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes(".")) {
                  const [, decimal] = value.split(".");
                  if (decimal && decimal.length > 2) {
                    return;
                  }
                }

                const numValue = value === "" ? 0 : Number(value);

                const updated = [...memberSplits];
                updated[memberIndex] = {
                  ...updated[memberIndex],
                  weight: numValue,
                };

                checkTotal(updated);

                const maxValue =
                  splitType === "percentage"
                    ? 100
                    : splitType === "custom"
                    ? currentAmount
                    : splitType === "shares"
                    ? 99999
                    : Infinity;

                if (numValue > maxValue) {
                  if (splitType === "shares") return;
                  setError(`memberSplits.${memberIndex}.weight`, {
                    type: "manual",
                    message:
                      splitType === "percentage"
                        ? "Percentage cannot exceed 100%"
                        : `Custom split cannot exceed total amount ($${currentAmount})`,
                  });
                  if (splitType === "percentage") return;
                }

                if (numValue < 0) {
                  return;
                }

                // Update field
                field.onChange(parseFloat(value) || 0);
              }}
              onBlur={(e) => {
                let value = e.target.value;

                // Remove non-digit characters except decimal point
                value = value.replace(/[^\d.]/g, "");

                // Remove leading zeros
                value = value.replace(/^0+(?=\d)/, "");

                // Remove trailing zeros after decimal
                if (value.includes(".")) {
                  value = value.replace(/\.?0+$/, "");
                }

                // Handle empty or just decimal point
                if (value === "" || value === ".") {
                  value = "";
                }

                field.onChange(parseFloat(value) || 0);
              }}
              className="w-32 pr-8 input-no-spinner"
              onWheel={(e) => e.currentTarget.blur()}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {splitCostLabel}
            </span>
          </div>
          <FormMessage className="form-message" />
        </>
      )}
    />
  );
};

export default MemberSplitRow;

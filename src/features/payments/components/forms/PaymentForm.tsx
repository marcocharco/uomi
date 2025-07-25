import { Button } from "@/components/ui/button";
import { useCurrentGroup } from "@/features/groups/contexts/CurrentGroupContext";
import { useUser } from "@/features/users/context/UserContext";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { PaymentFormSchema } from "@/features/payments/schemas/paymentFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import AmountInput from "@/components/forms/AmountInput";
import { Form, FormLabel } from "@/components/ui/form";
import MemberSelectInput from "@/components/forms/MemberSelectInput";
import DatePickerInput from "@/components/forms/DatePickerInput";
import NoteInput from "@/components/forms/NoteInput";
import { getGroupSettlements } from "@/features/settlements/queries/getGroupSettlements";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { Checkbox } from "@/components/ui/checkbox";
import { Expense, ExpenseSplit } from "@/types";
import { DateToYMD } from "@/utils/formatDate";

const PaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useUser();
  const group = useCurrentGroup();

  if (!user || !group) {
    throw new Error("Missing user or group");
  }

  const groupMembers = group.members;
  const { expenses } = useExpenses(group.id);
  const { addSettlementPayment, addExpensePayment } = usePayments(group.id);

  const { data: settlements = [] } = useQuery({
    queryKey: ["groupSettlements", group.id],
    queryFn: () => getGroupSettlements(group.id),
  });
  const [settlementId, setSettlementId] = useState<string | null>(null);

  const formSchema = PaymentFormSchema();

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: FormValues = {
    amount: 0,
    paidTo: "",
    date: DateToYMD(new Date()),
    note: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<
    { expenseId: string; splitAmount: number }[]
  >([]);

  const [paymentType, setPaymentType] = useState<"settlement" | "balance">(
    "settlement"
  );

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (paymentType === "settlement") {
        await addSettlementPayment({
          paid_by: user.id,
          paid_to: values.paidTo,
          amount: values.amount,
          date: values.date,
          settlement_id: settlementId,
          note: values.note,
        });
      } else if (paymentType === "balance") {
        await addExpensePayment({
          paid_by: user.id,
          paid_to: values.paidTo,
          amount: values.amount,
          date: values.date,
          selectedExpenseSplits: selectedExpenses,
          note: values.note,
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const paidTo = useWatch({ control: form.control, name: "paidTo" });

  const openSettlements = settlements.filter((settlement) => {
    const paidToParticipant = settlement.participants.find(
      (participant) => participant.user.id === paidTo
    );
    const currentUserParticipant = settlement.participants.find(
      (participant) => participant.user.id === user.id
    );
    return (
      paidToParticipant &&
      currentUserParticipant &&
      paidToParticipant.remaining_balance < 0 &&
      currentUserParticipant.remaining_balance > 0
    );
  });
  const unpaidExpenses = expenses.filter((expense) => {
    const currentUserSplit = expense.splits.find(
      (split) => split.user.id === user.id
    );
    // expenses not in a settlement
    return (
      expense.paid_by.id === paidTo &&
      currentUserSplit &&
      expense.settlement === null &&
      currentUserSplit.remaining_owing > 0
    );
  });

  const handleExpenseCheck = (expense: Expense, checked: boolean) => {
    if (checked) {
      const split = expense.splits.find(
        (split: ExpenseSplit) => split.user.id === user.id
      );
      if (split) {
        setSelectedExpenses((prev) => [
          ...prev,
          { expenseId: expense.id, splitAmount: split.amount },
        ]);
      }
    } else {
      setSelectedExpenses((prev) =>
        prev.filter((e) => e.expenseId !== expense.id)
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        autoComplete="off"
      >
        <AmountInput control={form.control} name={"amount"} />
        <MemberSelectInput
          control={form.control}
          name="paidTo"
          formType="payment"
          groupMembers={groupMembers}
          currentUserId={user.id}
        />

        <Tabs
          defaultValue="settlement"
          className="w-[400px]"
          onValueChange={(val) =>
            setPaymentType(val as "settlement" | "balance")
          }
        >
          <TabsList>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            {/* <TabsTrigger value="expense">Expense</TabsTrigger> */}
          </TabsList>
          <TabsContent value="settlement">
            {paidTo == "" ? (
              <span>Choose a payment recepient</span>
            ) : openSettlements.length > 0 ? (
              <div className="space-y-2">
                <FormLabel className="form-label">
                  Choose Settlement{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    (optional)
                  </span>
                </FormLabel>
                {openSettlements.map((settlement) => (
                  <div key={settlement.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="settlement"
                      value={settlement.id}
                      checked={settlementId === settlement.id}
                      onChange={() => setSettlementId(settlement.id)}
                      id={`settlement-${settlement.id}`}
                    />
                    <label
                      htmlFor={`settlement-${settlement.id}`}
                      className="text-sm"
                    >
                      {settlement.title} - You Owe $
                      {settlement.participants.find(
                        (participant) => participant.user.id === user.id
                      )?.remaining_balance || ""}
                    </label>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="settlement"
                    value=""
                    checked={settlementId === null}
                    onChange={() => setSettlementId(null)}
                    id="settlement-none"
                  />
                  <label htmlFor="settlement-none" className="text-sm">
                    None (General Payment)
                  </label>
                </div>
              </div>
            ) : (
              <span>No open settlements</span>
            )}
          </TabsContent>
          <TabsContent value="balance">
            {paidTo == "" ? (
              <span>Choose a payment recepient</span>
            ) : unpaidExpenses.length > 0 ? (
              <>
                <FormLabel className="form-label">
                  Choose Expenses
                  <span className="text-muted-foreground font-normal text-sm">
                    {" "}
                    (select one or more)
                  </span>
                </FormLabel>
                {unpaidExpenses.map((expense: Expense) => {
                  const checked = selectedExpenses.some(
                    (e) => e.expenseId === expense.id
                  );
                  const split = expense.splits.find(
                    (split: ExpenseSplit) => split.user.id === user.id
                  );
                  return (
                    <div key={expense.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`expense-${expense.id}`}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          handleExpenseCheck(expense, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`expense-${expense.id}`}
                        className="text-sm"
                      >
                        {expense.title}{" "}
                        {split ? `- You owe $${split.remaining_owing}` : null}
                      </label>
                    </div>
                  );
                })}
              </>
            ) : (
              <span>No unpaid expenses</span>
            )}
          </TabsContent>
          {/* <TabsContent value="expense">
            Choose expenses to pay off (filtered by paid by)
          </TabsContent> */}
        </Tabs>

        <DatePickerInput control={form.control} name="date" />

        <NoteInput control={form.control} />

        <Button type="submit" className="form-btn" disabled={isLoading}>
          Submit Payment
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;

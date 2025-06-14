"use client";

import { addNewExpense } from "@/lib/actions/expense.actions";
import { getGroupExpenses } from "@/lib/queries/getGroupExpenses";
import { NewExpense } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useExpenses(groupId: string) {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groupExpenses", groupId],
    queryFn: () => getGroupExpenses(groupId),
  });

  const addExpense = useMutation({
    mutationFn: (values: NewExpense) => addNewExpense(values, groupId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["groupExpenses", groupId] }),
  });

  //   const editExpense = useMutation({
  //     mutationFn: (data: UpdateExpenseInput) => updateExpense(data),
  //     onSuccess: () => qc.invalidateQueries(["groupExpenses", slug]),
  //   });

  return {
    expenses: data ?? [],
    isLoading,
    isError,
    addExpense: addExpense.mutateAsync,
    // editExpense: editExpense.mutateAsync,
  };
}

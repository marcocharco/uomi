import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupExpenses from "./GroupExpenses";
import GroupBalances from "./GroupBalances";
import GroupSettlements from "./GroupSettlements";

const GroupTabs = () => {
  return (
    <Tabs defaultValue="expenses" className="w-full !gap-4">
      <TabsList className="flex gap-4">
        <TabsTrigger value="activity" className="px-2">
          Activity
        </TabsTrigger>
        <TabsTrigger value="expenses" className="px-2">
          Expenses
        </TabsTrigger>
        <TabsTrigger value="balances" className="px-2">
          Balances
        </TabsTrigger>
        <TabsTrigger value="payments" className="px-2">
          Payments
        </TabsTrigger>
        <TabsTrigger value="settlements" className="px-2">
          Settlements
        </TabsTrigger>
      </TabsList>
      <TabsContent value="activity" className="justify-center">
        <p>Activity Logs</p>
      </TabsContent>
      <TabsContent value="expenses">
        <GroupExpenses />
      </TabsContent>
      <TabsContent value="balances">
        <GroupBalances />
      </TabsContent>
      <TabsContent value="payments">
        <p>List of Payments</p>
      </TabsContent>
      <TabsContent value="settlements">
        {/* <p>List of Settlements</p> */}
        <GroupSettlements />
      </TabsContent>
    </Tabs>
  );
};

export default GroupTabs;

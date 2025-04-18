
import React from "react";
import { Link } from "react-router-dom";
import { Transaction } from "@/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDisplayDateTime } from "@/utils/dateUtils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary">Recent Transactions</CardTitle>
        <Link to="/revenue">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary/20">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left py-3 px-4 font-medium">Activity</th>
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium">Duration</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-primary/20 hover:bg-secondary/10"
                >
                  <td className="py-3 px-4">{transaction.activityName}</td>
                  <td className="py-3 px-4">
                    {formatDisplayDateTime(transaction.timeStart)}
                  </td>
                  <td className="py-3 px-4">{transaction.duration} min</td>
                  <td className="py-3 px-4">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.paymentMethod === "cash"
                          ? "bg-green-400/20 text-green-400"
                          : "bg-blue-400/20 text-blue-400"
                      }`}
                    >
                      {transaction.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;

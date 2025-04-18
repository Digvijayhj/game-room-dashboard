
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, CreditCard, Wallet } from "lucide-react";
import { formatCurrency } from "@/utils/dateUtils";

interface StatsOverviewProps {
  todayStats: {
    totalTransactions: number;
    totalRevenue: number;
    cashRevenue: number;
    cardRevenue: number;
  };
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ todayStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-secondary/80 to-background rounded-lg p-0 border border-primary/30 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            Today's Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayStats.totalTransactions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total game sessions today
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-secondary/80 to-background rounded-lg p-0 border border-primary/30 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            Today's Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total earnings today
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-secondary/80 to-background rounded-lg p-0 border border-primary/30 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
            <Wallet className="h-4 w-4 mr-2 text-primary" />
            Cash Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.cashRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cash payments received
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-secondary/80 to-background rounded-lg p-0 border border-primary/30 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
            <CreditCard className="h-4 w-4 mr-2 text-primary" />
            Card Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.cardRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Card payments received
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;

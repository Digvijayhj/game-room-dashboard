
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  dailyData: {
    date: string;
    revenue: number;
    transactions?: number;
  }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ dailyData }) => {
  // Chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))", 
    },
    transactions: {
      label: "Transactions",
      color: "hsl(var(--accent) / 0.8)", 
    },
  };

  // Process data to ensure both revenue and transactions are present
  const processedData = dailyData.map(item => ({
    ...item,
    transactions: item.transactions || 0
  }));

  // Custom tooltip component for more attractive tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-primary/30 p-3 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-primary font-medium mb-2">{`${label}`}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <span className="h-2 w-2 rounded-full bg-primary mr-1.5"></span>
                Revenue:
              </span>
              <span className="font-mono font-medium text-foreground">${payload[0].value}</span>
            </p>
            {payload.length > 1 && (
              <p className="text-sm flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <span className="h-2 w-2 rounded-full bg-accent/80 mr-1.5"></span>
                  Transactions:
                </span>
                <span className="font-mono font-medium text-foreground">{payload[1].value}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state for when there's no data
  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
      <TrendingUp className="h-12 w-12 mb-3 text-muted-foreground/50" />
      <p className="text-center">No revenue data available for the selected period</p>
      <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters or date range</p>
    </div>
  );

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-primary flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 opacity-80" />
          Weekly Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          {processedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={processedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted) / 0.3)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--muted) / 0.5)" }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  stroke="hsl(var(--primary))"
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--muted) / 0.5)" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--accent))"
                  tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--muted) / 0.5)" }}
                  tickFormatter={(value) => `${value}`}
                  hide={!processedData.some(d => d.transactions > 0)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue ($)" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                />
                {processedData.some(d => d.transactions > 0) && (
                  <Area
                    yAxisId="right"
                    type="monotone" 
                    dataKey="transactions" 
                    name="Transactions" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    fillOpacity={0.3}
                    fill="url(#colorTransactions)"
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;

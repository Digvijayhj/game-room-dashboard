
import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/dateUtils";
import { motion } from "framer-motion";

interface RevenueTreemapProps {
  revenueByActivity: { activity: string; revenue: number }[];
}

const RevenueTreemap: React.FC<RevenueTreemapProps> = ({ revenueByActivity }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  const categorizeActivity = (activity: string): string => {
    const lowerActivity = activity.toLowerCase();
    
    if (lowerActivity.includes('nintendo') || lowerActivity.includes('switch')) {
      return 'Nintendo Switch';
    } else if (lowerActivity.includes('playstation') || lowerActivity.includes('ps4') || lowerActivity.includes('ps5')) {
      return 'PlayStation';
    } else if (lowerActivity.includes('xbox')) {
      return 'Xbox';
    } else if (lowerActivity.includes('billiard') || lowerActivity.includes('pool')) {
      return 'Billiards';
    } else if (lowerActivity.includes('board game') || lowerActivity.includes('boardgame')) {
      return 'Board Games';
    } else if (lowerActivity.includes('vr')) {
      return 'VR Experience';
    } else {
      return 'Other Activities';
    }
  };

  const groupedData = revenueByActivity.reduce((acc, item) => {
    const category = categorizeActivity(item.activity);
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += item.revenue;
    return acc;
  }, {} as Record<string, number>);

  const formattedData = Object.entries(groupedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const chartConfig = {
    'PlayStation': { color: '#1e40af' }, // Deep Blue
    'Xbox': { color: '#3f7e23' }, // Green
    'Nintendo Switch': { color: '#dc2626' }, // Red
    'Billiards': { color: '#7e57c2' }, // Purple
    'Board Games': { color: '#f97316' }, // Orange
    'VR Experience': { color: '#0ea5e9' }, // Sky Blue
    'Other Activities': { color: '#6c757d' }, // Gray
  };

  const totalRevenue = formattedData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background/95 shadow-lg border border-border p-3 rounded-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm font-mono mt-1">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {`${((data.value / totalRevenue) * 100).toFixed(0)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="stat-card overflow-hidden hover:shadow-lg transition-shadow duration-300 border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-primary tracking-tight">
          Revenue by Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="h-[250px] w-full max-w-[400px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={3}  // Adding a small, consistent padding
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {formattedData.map((entry, index) => {
                    const color = chartConfig[entry.name as keyof typeof chartConfig]?.color || '#6c757d';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        stroke="none"
                        style={{
                          opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.6,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full flex flex-wrap justify-center gap-2">
            {formattedData.map((entry, index) => {
              const color = chartConfig[entry.name as keyof typeof chartConfig]?.color || '#6c757d';
              const percent = ((entry.value / totalRevenue) * 100).toFixed(0);
              
              return (
                <motion.div
                  key={`legend-${index}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="relative"
                >
                  <div 
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 hover:shadow-sm cursor-pointer text-xs`}
                    style={{
                      borderColor: color,
                      backgroundColor: activeIndex === index ? `${color}20` : 'transparent',
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">{entry.name}</span>
                    <span className="text-muted-foreground">{`${percent}%`}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTreemap;

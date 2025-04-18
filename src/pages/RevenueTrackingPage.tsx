import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, PaymentMethod, Transaction } from "@/types";
import { activitiesService, transactionsService } from "@/services/storageService";
import { formatCurrency, formatDisplayDate, formatDisplayDateTime, formatDisplayTime } from "@/utils/dateUtils";
import { CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, XAxis, YAxis } from "recharts";
import { Calendar, CalendarDays, CircleDollarSign, CreditCard, Download, Filter, Plus, Search, Wallet, BarChart3, PieChartIcon, TrendingUp, RefreshCcw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { toast } from "sonner";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RevenueTreemap from "@/components/charts/RevenueTreemap";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import TransactionsTable from "@/pages/TransactionsTable";

const COLORS = ["#8B5CF6", "#D946EF", "#EC4899", "#F97316", "#10B981", "#3B82F6"];

const PAYMENT_COLORS = {
  cash: "#10B981",
  card: "#6366F1"
};

const RevenueTrackingPage: React.FC = () => {
  
  const {
    hasPermission,
    user
  } = useAuth();
  
  const hasAddPermission = hasPermission(["admin", "developer", "attendant"]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendants, setAttendants] = useState<{
    id: string;
    name: string;
  }[]>([]);
  const [revenueByDayData, setRevenueByDayData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [activityRevenueData, setActivityRevenueData] = useState<any[]>([]);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [attendantFilter, setAttendantFilter] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<Transaction>>({
    activityId: "",
    timeStart: new Date().toISOString(),
    timeEnd: new Date(Date.now() + 30 * 60000).toISOString(),
    duration: 30,
    amount: 0,
    paymentMethod: "cash",
    isRefund: false
  });

  useEffect(() => {
    loadTransactions();
    loadActivities();
    const loadedTransactions = transactionsService.getAll();
    const uniqueAttendants = Array.from(new Map(loadedTransactions.map(t => [t.userId, {
      id: t.userId,
      name: t.userName
    }])).values());
    setAttendants(uniqueAttendants);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, dateRange, activityFilter, paymentFilter, attendantFilter]);

  const loadTransactions = () => {
    const data = transactionsService.getAll();
    setTransactions(data);
    setFilteredTransactions(data);
    prepareChartData(data);
  };

  const loadActivities = () => {
    const data = activitiesService.getAll();
    setActivities(data);
  };

  const prepareChartData = (transactionsData: Transaction[]) => {
    const revenueByDay = transactionsData.reduce((acc, transaction) => {
      const date = formatDisplayDate(transaction.timeStart);
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    const revenueData = Object.entries(revenueByDay).map(([date, amount]) => ({
      date,
      revenue: amount
    })).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }).slice(-7);
    setRevenueByDayData(revenueData);
    const paymentMethodCounts = transactionsData.reduce((acc, transaction) => {
      if (!acc[transaction.paymentMethod]) {
        acc[transaction.paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      acc[transaction.paymentMethod].count += 1;
      acc[transaction.paymentMethod].amount += transaction.amount;
      return acc;
    }, {} as Record<string, {
      count: number;
      amount: number;
    }>);
    const paymentData = Object.entries(paymentMethodCounts).map(([method, data]) => ({
      name: method === "cash" ? "Cash" : "Card",
      value: data.amount,
      count: data.count
    }));
    setPaymentMethodData(paymentData);
    const activityRevenue = transactionsData.reduce((acc, transaction) => {
      if (!acc[transaction.activityName]) {
        acc[transaction.activityName] = 0;
      }
      acc[transaction.activityName] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    const activityData = Object.entries(activityRevenue).map(([name, amount]) => ({
      name,
      value: amount
    }));
    setActivityRevenueData(activityData);
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(t => t.activityName.toLowerCase().includes(lowerSearchTerm) || t.userName.toLowerCase().includes(lowerSearchTerm));
    }
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      let toDate: Date;
      if (dateRange.to) {
        toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
      } else {
        toDate = new Date(fromDate);
        toDate.setHours(23, 59, 59, 999);
      }
      filtered = filtered.filter(t => new Date(t.timeStart) >= fromDate && new Date(t.timeStart) <= toDate);
    }
    if (activityFilter !== "all") {
      filtered = filtered.filter(t => t.activityId === activityFilter);
    }
    if (paymentFilter !== "all") {
      filtered = filtered.filter(t => t.paymentMethod === paymentFilter);
    }
    if (attendantFilter !== "all") {
      filtered = filtered.filter(t => t.userId === attendantFilter);
    }
    setFilteredTransactions(filtered);
    prepareChartData(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleActivityChange = (activityId: string) => {
    const selectedActivity = activities.find(a => a.id === activityId);
    if (selectedActivity) {
      if (formData.isRefund) {
        setFormData({
          ...formData,
          activityId,
          activityName: selectedActivity.name,
        });
      } else {
        const duration = formData.duration || 30;
        const timeStart = new Date().toISOString();
        const timeEnd = new Date(Date.now() + duration * 60000).toISOString();
        
        setFormData({
          ...formData,
          activityId,
          activityName: selectedActivity.name,
          timeStart,
          timeEnd,
          duration,
          amount: duration === 30 ? selectedActivity.pricePerHalfHour : selectedActivity.pricePerHour
        });
      }
    }
  };

  const handleDurationChange = (duration: number) => {
    if (formData.isRefund) return;
    
    const selectedActivity = activities.find(a => a.id === formData.activityId);
    if (selectedActivity) {
      const timeStart = new Date().toISOString();
      const timeEnd = new Date(Date.now() + duration * 60000).toISOString();
      setFormData({
        ...formData,
        timeStart,
        timeEnd,
        duration,
        amount: duration === 30 ? selectedActivity.pricePerHalfHour : selectedActivity.pricePerHour
      });
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData({
      ...formData,
      paymentMethod: method
    });
  };

  const handleRefundToggle = (checked: boolean) => {
    setFormData({
      ...formData,
      isRefund: checked,
      ...(checked ? {
        amount: 0,
      } : {
        timeStart: new Date().toISOString(),
        timeEnd: new Date(Date.now() + (formData.duration || 30) * 60000).toISOString(),
        amount: formData.activityId ? 
          (formData.duration === 30 
            ? (activities.find(a => a.id === formData.activityId)?.pricePerHalfHour || 0)
            : (activities.find(a => a.id === formData.activityId)?.pricePerHour || 0))
          : 0
      })
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData({
      ...formData,
      amount: isNaN(value) ? 0 : value
    });
  };

  const handleSubmitTransaction = () => {
    try {
      if (!formData.activityId || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const selectedActivity = activities.find(a => a.id === formData.activityId);
      if (!selectedActivity) {
        toast.error("Selected activity not found");
        return;
      }
      
      const amount = formData.isRefund ? -Math.abs(formData.amount as number) : Math.abs(formData.amount as number);
      
      if (formData.isRefund) {
        transactionsService.create({
          activityId: formData.activityId as string,
          activityName: formData.activityName as string,
          timeStart: new Date().toISOString(),
          timeEnd: new Date().toISOString(),
          duration: 0,
          amount: amount,
          paymentMethod: formData.paymentMethod as PaymentMethod,
          userId: user?.id || "",
          userName: user?.name || "",
          isRefund: true
        });
        
        toast.success(`Refund of ${formatCurrency(Math.abs(amount))} recorded for ${selectedActivity.name}!`);
      } else {
        transactionsService.create({
          activityId: formData.activityId as string,
          activityName: formData.activityName as string,
          timeStart: formData.timeStart as string,
          timeEnd: formData.timeEnd as string,
          duration: formData.duration as number,
          amount: amount,
          paymentMethod: formData.paymentMethod as PaymentMethod,
          userId: user?.id || "",
          userName: user?.name || "",
          isRefund: false
        });
        
        toast.success(`Transaction of ${formatCurrency(amount)} added for ${selectedActivity.name}!`);
      }
      
      setFormData({
        activityId: "",
        timeStart: new Date().toISOString(),
        timeEnd: new Date(Date.now() + 30 * 60000).toISOString(),
        duration: 30,
        amount: 0,
        paymentMethod: "cash",
        isRefund: false
      });
      
      setOpenNewDialog(false);
      loadTransactions();
      loadActivities();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process transaction");
    }
  };

  const handleExportData = () => {
    try {
      const headers = ["Activity", "Date & Time", "Duration", "Amount", "Payment", "Attendant"];
      const csvContent = [headers.join(","), ...filteredTransactions.map(t => [`"${t.activityName}"`, `"${formatDisplayDateTime(t.timeStart)}"`, `${t.duration} min`, t.amount, t.paymentMethod, `"${t.userName}"`].join(","))].join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    }
  };

  const ActivityTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-background/95 border border-game-primary/30 p-3 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-game-primary font-medium mb-2">{payload[0].name}</p>
          <p className="text-sm flex items-center justify-between">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-mono font-medium text-foreground">${payload[0].value}</span>
          </p>
        </div>;
    }
    return null;
  };

  const treemapData = activityRevenueData.map(item => ({
    name: item.name,
    size: item.value,
    value: item.value
  }));

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const cashRevenue = filteredTransactions.filter(t => t.paymentMethod === "cash").reduce((sum, t) => sum + t.amount, 0);
  const cardRevenue = filteredTransactions.filter(t => t.paymentMethod === "card").reduce((sum, t) => sum + t.amount, 0);

  const CustomTreemapContent = (props: any) => {
    const {
      x,
      y,
      width,
      height,
      index,
      name,
      value
    } = props;
    const color = COLORS[index % COLORS.length];
    return <g>
        <rect x={x} y={y} width={width} height={height} style={{
        fill: color,
        stroke: '#1A1F2C',
        strokeWidth: 2,
        opacity: 0.8
      }} />
        {width > 30 && height > 30 && <>
            <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={Math.min(width / 10, 14)} fontWeight="bold">
              {name}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="#fff" fontSize={Math.min(width / 10, 12)}>
              ${value}
            </text>
          </>}
      </g>;
  };

  return <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Revenue Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze revenue from game room activities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          {hasAddPermission && (
            <Dialog open={openNewDialog} onOpenChange={setOpenNewDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-card border-game-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-xl text-game-primary">
                    {formData.isRefund ? "Record Refund" : "Add New Transaction"}
                  </DialogTitle>
                  <DialogDescription>
                    {formData.isRefund 
                      ? "Record a refund for a game room activity" 
                      : "Record a new transaction for a game room activity"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="refund-toggle" 
                      checked={formData.isRefund} 
                      onCheckedChange={handleRefundToggle}
                    />
                    <Label htmlFor="refund-toggle" className="flex items-center">
                      <RefreshCcw className="h-4 w-4 mr-2 text-muted-foreground" />
                      This is a refund
                    </Label>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Activity</label>
                    <Select value={formData.activityId} onValueChange={handleActivityChange}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activities.map(activity => <SelectItem key={activity.id} value={activity.id}>
                            {activity.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {!formData.isRefund && (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Duration</label>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant={formData.duration === 30 ? "default" : "outline"}
                          className={formData.duration === 30 ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : ""}
                          onClick={() => handleDurationChange(30)}
                        >
                          30 Minutes
                        </Button>
                        <Button 
                          type="button" 
                          variant={formData.duration === 60 ? "default" : "outline"} 
                          className={formData.duration === 60 ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : ""}
                          onClick={() => handleDurationChange(60)}
                        >
                          1 Hour
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Payment Method</label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant={formData.paymentMethod === "cash" ? "default" : "outline"} 
                        className={formData.paymentMethod === "cash" ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : ""}
                        onClick={() => handlePaymentMethodChange("cash")}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Cash
                      </Button>
                      <Button 
                        type="button" 
                        variant={formData.paymentMethod === "card" ? "default" : "outline"} 
                        className={formData.paymentMethod === "card" ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : ""}
                        onClick={() => handlePaymentMethodChange("card")}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Card
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      {formData.isRefund ? "Refund Amount" : "Amount"}
                    </label>
                    <div className="flex items-center bg-muted/50 border rounded-md px-3">
                      <span className="text-muted-foreground">$</span>
                      <Input 
                        type="number" 
                        name="amount" 
                        value={formData.amount || 0} 
                        onChange={handleAmountChange} 
                        className="border-0 bg-transparent" 
                        step="0.01" 
                        min="0" 
                        disabled={!formData.isRefund && !!formData.activityId} 
                      />
                    </div>
                    {formData.isRefund && (
                      <p className="text-xs text-muted-foreground">
                        Enter the positive amount to refund. It will be recorded as a negative transaction.
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenNewDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSubmitTransaction}
                    className={formData.isRefund ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    {formData.isRefund ? "Record Refund" : "Submit Transaction"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </header>

      <div className="bg-secondary/30 rounded-lg border border-game-primary/20 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by activity or attendant..." className="pl-8 bg-background/50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Filter by date" align="end" className="w-full sm:w-[260px] bg-background/50" />
            
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {activities.map(activity => <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background/50">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={attendantFilter} onValueChange={setAttendantFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                <SelectValue placeholder="Attendant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attendants</SelectItem>
                {attendants.map(attendant => <SelectItem key={attendant.id} value={attendant.id}>
                    {attendant.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CircleDollarSign className="h-4 w-4 mr-2 text-game-primary" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-game-primary" />
              Cash Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.paymentMethod === 'cash').length} cash transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-game-primary" />
              Card Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cardRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.filter(t => t.paymentMethod === 'card').length} card transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart dailyData={revenueByDayData} />

        <RevenueTreemap revenueByActivity={activityRevenueData.map(item => ({
        activity: item.name,
        revenue: item.value
      }))} />

        <Card className="stat-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary tracking-tight flex items-center">
              <CreditCard className="h-5 w-5 mr-2 opacity-80" />
              Payment Method Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="flex flex-col items-center p-3 rounded-lg bg-background/50 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS.cash }}></div>
                    <span className="text-sm font-medium">Cash</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{formatCurrency(cashRevenue)}</div>
                  <div className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.paymentMethod === 'cash').length} transactions
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-3 rounded-lg bg-background/50 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS.card }}></div>
                    <span className="text-sm font-medium">Card</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{formatCurrency(cardRevenue)}</div>
                  <div className="text-xs text-muted-foreground">
                    {filteredTransactions.filter(t => t.paymentMethod === 'card').length} transactions
                  </div>
                </div>
              </div>
              
              <div className="h-[250px] w-full">
                <ChartContainer config={{
                  cash: { label: 'Cash', color: PAYMENT_COLORS.cash },
                  card: { label: 'Card', color: PAYMENT_COLORS.card }
                }}>
                  {paymentMethodData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          animationBegin={0}
                          animationDuration={400}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name.toLowerCase() === 'cash' ? PAYMENT_COLORS.cash : PAYMENT_COLORS.card}
                              stroke="hsl(var(--background))"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={
                            <ChartTooltipContent 
                              formatter={(value, name) => (
                                <div className="flex flex-col">
                                  <span className="font-bold">{formatCurrency(value as number)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {`${(((value as number) / totalRevenue) * 100).toFixed(1)}% of total revenue`}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {paymentMethodData.find(item => item.name.toLowerCase() === name?.toString().toLowerCase())?.count} transactions
                                  </span>
                                </div>
                              )}
                            />
                          } 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                      <CreditCard className="h-12 w-12 mb-3 text-muted-foreground/50" />
                      <p className="text-center">No payment data available for the selected period</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters or date range</p>
                    </div>
                  )}
                </ChartContainer>
              </div>
              
              {paymentMethodData.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {paymentMethodData
                    .sort((a, b) => b.value - a.value)
                    .map((entry, index) => (
                      <div key={`payment-detail-${index}`} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.name.toLowerCase() === 'cash' ? PAYMENT_COLORS.cash : PAYMENT_COLORS.card }}
                          ></div>
                          <span className="font-medium">{entry.name}</span>
                          <span className="text-xs text-muted-foreground">({entry.count} transactions)</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium">{formatCurrency(entry.value)}</span>
                          <span className="text-xs text-muted-foreground">
                            {`${((entry.value / totalRevenue) * 100).toFixed(0)}%`}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    <Card className="border border-game-primary/20 bg-gradient-to-br from-secondary to-background">
      <CardHeader>
        <CardTitle className="text-game-primary">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <TransactionsTable
              transactions={filteredTransactions}
              className="ag-theme-game-dashboard"
          />
        </div>
      </CardContent>
    </Card>
    </div>;
};

export default RevenueTrackingPage;

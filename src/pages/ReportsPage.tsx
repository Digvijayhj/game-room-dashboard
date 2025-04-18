
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, DailyReport, ShiftReport } from "@/types";
import { usersService } from "@/services/storageService";
import { 
  generateDailyReport, 
  generateShiftReport, 
  exportReport 
} from "@/services/reportService";
import { formatCurrency, formatDisplayDate } from "@/utils/dateUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  FileText,
  Calendar,
  Clock,
  User as UserIcon,
  CreditCard,
  Wallet,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [attendants, setAttendants] = useState<User[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<"daily" | "shift">("daily");
  
  // Daily report state
  const [dailyReportDate, setDailyReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  
  // Shift report state
  const [shiftReportDate, setShiftReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shiftReportUserId, setShiftReportUserId] = useState("");
  const [shiftReportStartTime, setShiftReportStartTime] = useState("09:00");
  const [shiftReportEndTime, setShiftReportEndTime] = useState("17:00");
  const [shiftReport, setShiftReport] = useState<ShiftReport | null>(null);
  
  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<"daily" | "shift" | null>(null);
  const [selectedReportData, setSelectedReportData] = useState<any>(null);
  const [customExportPath, setCustomExportPath] = useState("");
  
  // Colors for the chart
  const chartColors = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981"];

  useEffect(() => {
    // Load attendants for the shift report selector
    const users = usersService.getAll().filter(u => 
      u.role === "attendant" || u.role === "admin" || u.role === "developer"
    );
    setAttendants(users);
    
    // Set current user as default if they're an attendant
    if (user && users.some(u => u.id === user.id)) {
      setShiftReportUserId(user.id);
    } else if (users.length > 0) {
      setShiftReportUserId(users[0].id);
    }
  }, [user]);

  const generateReport = () => {
    try {
      if (selectedReportType === "daily") {
        const report = generateDailyReport(new Date(dailyReportDate));
        setDailyReport(report);
      } else {
        // Make sure we have a user selected
        if (!shiftReportUserId) {
          toast.error("Please select an attendant");
          return;
        }
        
        const report = generateShiftReport(
          shiftReportUserId,
          new Date(shiftReportDate),
          shiftReportStartTime,
          shiftReportEndTime
        );
        setShiftReport(report);
      }
      
      toast.success(`Report generated successfully!`);
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    }
  };

  const handleExport = () => {
    // Set the current report for the export dialog
    if (selectedReportType === "daily" && dailyReport) {
      setSelectedReport("daily");
      setSelectedReportData(dailyReport);
    } else if (selectedReportType === "shift" && shiftReport) {
      setSelectedReport("shift");
      setSelectedReportData(shiftReport);
    } else {
      toast.error("No report to export");
      return;
    }
    
    // Open the dialog
    setReportDialogOpen(true);
  };

  const confirmExport = () => {
    if (!selectedReportData) {
      toast.error("No report data to export");
      return;
    }
    
    try {
      let fileName;
      
      if (selectedReport === "daily") {
        fileName = `daily_report_${selectedReportData.date}.json`;
      } else {
        fileName = `shift_report_${selectedReportData.userName}_${selectedReportData.date}.json`;
      }
      
      exportReport(selectedReportData, fileName);
      toast.success("Report exported successfully");
      
      // In a real app, you'd upload to the specified path
      if (customExportPath) {
        toast.info(`In a production environment, this would be saved to: ${customExportPath}`);
      }
      
      setReportDialogOpen(false);
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export game room reports
        </p>
      </header>

      {/* Report type selector */}
      <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
        <CardHeader>
          <CardTitle className="text-primary">Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  selectedReportType === "daily" 
                    ? "border-primary bg-primary/10" 
                    : "border-muted hover:border-primary/50"
                }`}
                onClick={() => setSelectedReportType("daily")}
              >
                <div className="flex items-center mb-2">
                  <Calendar className={`h-5 w-5 mr-2 ${
                    selectedReportType === "daily" ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <h3 className={`font-medium ${
                    selectedReportType === "daily" ? "text-primary" : "text-foreground"
                  }`}>
                    Daily Report
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate a report of all transactions and revenue for a specific day
                </p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  selectedReportType === "shift" 
                    ? "border-primary bg-primary/10" 
                    : "border-muted hover:border-primary/50"
                }`}
                onClick={() => setSelectedReportType("shift")}
              >
                <div className="flex items-center mb-2">
                  <Clock className={`h-5 w-5 mr-2 ${
                    selectedReportType === "shift" ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <h3 className={`font-medium ${
                    selectedReportType === "shift" ? "text-primary" : "text-foreground"
                  }`}>
                    Shift Report
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate a report for a specific attendant's shift
                </p>
              </div>
            </div>

            {/* Report parameters */}
            <div className="mt-6 border-t border-muted pt-4">
              {selectedReportType === "daily" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyReportDate">Select Date</Label>
                    <Input
                      id="dailyReportDate"
                      type="date"
                      value={dailyReportDate}
                      onChange={(e) => setDailyReportDate(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shiftReportUser">Select Attendant</Label>
                    <Select
                      value={shiftReportUserId}
                      onValueChange={setShiftReportUserId}
                    >
                      <SelectTrigger id="shiftReportUser">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendants.map((attendant) => (
                          <SelectItem key={attendant.id} value={attendant.id}>
                            {attendant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftReportDate">Select Date</Label>
                    <Input
                      id="shiftReportDate"
                      type="date"
                      value={shiftReportDate}
                      onChange={(e) => setShiftReportDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftReportStartTime">Shift Start Time</Label>
                    <Input
                      id="shiftReportStartTime"
                      type="time"
                      value={shiftReportStartTime}
                      onChange={(e) => setShiftReportStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftReportEndTime">Shift End Time</Label>
                    <Input
                      id="shiftReportEndTime"
                      type="time"
                      value={shiftReportEndTime}
                      onChange={(e) => setShiftReportEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={generateReport}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report results - Daily */}
      {selectedReportType === "daily" && dailyReport && (
        <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-primary">
              Daily Report: {formatDisplayDate(dailyReport.date)}
            </CardTitle>
            <Button 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={handleExport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyReport.totalTransactions}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dailyReport.totalAmount)}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-primary" />
                    Cash Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dailyReport.cashAmount)}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    Card Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dailyReport.cardAmount)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Activity breakdown */}
            <div>
              <h3 className="text-lg font-medium mb-4">Activity Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sidebar-border">
                          <th className="text-left py-2 px-4 font-medium">Activity</th>
                          <th className="text-left py-2 px-4 font-medium">Transactions</th>
                          <th className="text-left py-2 px-4 font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyReport.activityBreakdown.map((activity, index) => (
                          <tr key={activity.activityId} className="border-b border-sidebar-border">
                            <td className="py-3 px-4">{activity.activityName}</td>
                            <td className="py-3 px-4">{activity.count}</td>
                            <td className="py-3 px-4">{formatCurrency(activity.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyReport.activityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="activityName" 
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`} 
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(26, 31, 44, 0.9)',
                          border: '1px solid hsl(var(--primary))',
                          borderRadius: '4px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {dailyReport.activityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report results - Shift */}
      {selectedReportType === "shift" && shiftReport && (
        <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-primary">
              Shift Report: {shiftReport.userName}
            </CardTitle>
            <Button 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={handleExport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="stat-card col-span-1 md:col-span-2 lg:col-span-4">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-muted-foreground mr-2">Attendant:</span>
                      <span className="font-medium">{shiftReport.userName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-muted-foreground mr-2">Date:</span>
                      <span className="font-medium">{formatDisplayDate(shiftReport.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-muted-foreground mr-2">Time:</span>
                      <span className="font-medium">{shiftReport.startTime} - {shiftReport.endTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shiftReport.totalTransactions}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(shiftReport.totalAmount)}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Wallet className="h-4 w-4 mr-2 text-primary" />
                    Cash Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(shiftReport.cashAmount)}</div>
                </CardContent>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    Card Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(shiftReport.cardAmount)}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Additional shift info if needed */}
            <div className="p-4 border border-muted rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">
                This report includes all transactions processed by {shiftReport.userName} during their shift on {formatDisplayDate(shiftReport.date)} from {shiftReport.startTime} to {shiftReport.endTime}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Export dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">
              Export Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exportPath">Custom Export Path (Optional)</Label>
              <Input
                id="exportPath"
                placeholder="e.g., /reports/gameroom/"
                value={customExportPath}
                onChange={(e) => setCustomExportPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                In a production environment, this would specify where to store the report on the server. For the demo, the report will be downloaded to your device.
              </p>
            </div>
            
            <div className="p-3 border border-primary/20 rounded-md bg-primary/5">
              <h4 className="font-medium mb-1 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Export Details
              </h4>
              <p className="text-sm text-muted-foreground">
                This will export a JSON file containing the complete report data that can be used for further analysis or imported into other systems.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              className="border-muted text-muted-foreground"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={confirmExport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;

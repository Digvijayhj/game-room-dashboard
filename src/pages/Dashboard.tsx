
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Transaction } from "@/types";
import { activitiesService, transactionsService } from "@/services/storageService";
import { BarChart3, Users, Gamepad2 } from "lucide-react";

// Import the refactored components
import StatsOverview from "@/components/dashboard/StatsOverview";
import ActivityLayout from "@/components/dashboard/ActivityLayout";
import CustomerManagement from "@/components/dashboard/CustomerManagement";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

const Dashboard: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    cashRevenue: 0,
    cardRevenue: 0,
  });

  // Fetch all data on mount and set up a refresh interval
  useEffect(() => {
    // Function to load all data
    const loadData = () => {
      console.log("Loading dashboard data...");
      
      // Get fresh data from storage services
      const loadedActivities = activitiesService.getAll();
      console.log(`Loaded ${loadedActivities.length} activities`);
      setActivities(loadedActivities);

      const loadedTransactions = transactionsService.getAll();
      console.log(`Loaded ${loadedTransactions.length} transactions`);
      setTransactions(loadedTransactions.slice(0, 5)); // Get most recent 5

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransactions = loadedTransactions.filter(
        (transaction) => new Date(transaction.timeStart) >= today
      );

      const todayTotal = todayTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      const todayCash = todayTransactions
        .filter((transaction) => transaction.paymentMethod === "cash")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const todayCard = todayTransactions
        .filter((transaction) => transaction.paymentMethod === "card")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      setTodayStats({
        totalTransactions: todayTransactions.length,
        totalRevenue: todayTotal,
        cashRevenue: todayCash,
        cardRevenue: todayCard,
      });
    };
    
    // Initial load
    loadData();
    
    // Set up refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Game Room Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor activities, revenue, and usage in real-time
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Link to="/activities">
            <Button className="bg-primary hover:bg-primary/90 shadow-md">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Manage Activities
            </Button>
          </Link>
          <Link to="/revenue">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <BarChart3 className="mr-2 h-4 w-4" />
              Revenue Details
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats overview */}
      <StatsOverview todayStats={todayStats} />

      {/* Activity Tiles in specific layout */}
      <ActivityLayout activities={activities} />

      {/* Customer Management Section */}
      <CustomerManagement activities={activities} />

      {/* Recent transactions */}
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
};

export default Dashboard;

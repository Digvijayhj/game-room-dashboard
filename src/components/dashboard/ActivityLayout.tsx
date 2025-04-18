import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, CheckCircle2, XCircle, Gamepad2, Trash2, Plus, RefreshCcw, StopCircle, DollarSign, AlertTriangle, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { transactionsService, activitiesService } from "@/services/storageService";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Activity } from "@/types";

const transactionFormSchema = z.object({
  activityId: z.string().min(1, {
    message: "Please select an activity"
  }),
  amount: z.coerce.number().min(1, {
    message: "Amount must be at least 1"
  }),
  paymentMethod: z.enum(["cash", "card"], {
    required_error: "Please select a payment method"
  }),
  durationMinutes: z.coerce.number().min(15, {
    message: "Duration must be at least 15 minutes"
  }).max(240, {
    message: "Duration cannot exceed 4 hours"
  })
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface ActivityLayoutProps {
  activities: Activity[];
}

const ActivityLayout: React.FC<ActivityLayoutProps> = ({
  activities: initialActivities
}) => {
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({});
  const [nextAvailable, setNextAvailable] = useState<Record<string, string>>({});
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [intervalIds, setIntervalIds] = useState<Record<string, NodeJS.Timeout>>({});
  const [activityList, setActivityList] = useState<Activity[]>(initialActivities);
  const [boardGameName, setBoardGameName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState<boolean>(false);
  const [pausedTimers, setPausedTimers] = useState<Record<string, boolean>>({});
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<Record<string, number>>({});

  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      activityId: "",
      amount: 0,
      paymentMethod: "cash",
      durationMinutes: 30
    }
  });

  const getActivitiesByType = (type: string) => {
    return activityList.filter(activity => activity.name.toLowerCase().includes(type.toLowerCase()) && activity.isActive);
  };

  useEffect(() => {
    setActivityList(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    const storedActivities = activitiesService.getAll();
    setActivityList(storedActivities);

    const updateActivityStatuses = () => {
      const transactions = transactionsService.getAll();
      const currentTime = new Date();
      const statusMap: Record<string, boolean> = {};
      const nextAvailableMap: Record<string, string> = {};

      storedActivities.forEach(activity => {
        const isBoardGame = activity.name.toLowerCase().includes('board game');
        const activeTransaction = transactions.find(t => {
          return t.activityName.includes(activity.name) && new Date(t.timeEnd) > currentTime;
        });

        statusMap[activity.id] = !activeTransaction;

        if (activeTransaction && !isBoardGame) {
          const endTime = new Date(activeTransaction.timeEnd);
          const hours = endTime.getHours();
          const minutes = endTime.getMinutes();
          nextAvailableMap[activity.id] = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
          startCountdown(activity.id, endTime);
        }
      });

      setActiveStatuses(statusMap);
      setNextAvailable(nextAvailableMap);
    };

    updateActivityStatuses();

    const interval = setInterval(updateActivityStatuses, 60000);

    return () => {
      clearInterval(interval);
      Object.values(intervalIds).forEach(id => clearInterval(id));
    };
  }, []);

  const startCountdown = (activityId: string, endTime: Date) => {
    if (intervalIds[activityId]) {
      clearInterval(intervalIds[activityId]);
    }

    if (pausedTimers[activityId]) {
      return; // Don't start countdown if timer is paused
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(intervalIds[activityId]);
        setActiveStatuses(prev => ({
          ...prev,
          [activityId]: true
        }));
        setCountdowns(prev => {
          const newCountdowns = {
            ...prev
          };
          delete newCountdowns[activityId];
          return newCountdowns;
        });
        setNextAvailable(prev => {
          const newNextAvailable = {
            ...prev
          };
          delete newNextAvailable[activityId];
          return newNextAvailable;
        });
        setPausedTimers(prev => {
          const newPausedTimers = {
            ...prev
          };
          delete newPausedTimers[activityId];
          return newPausedTimers;
        });
        setPausedTimeRemaining(prev => {
          const newPausedTimeRemaining = {
            ...prev
          };
          delete newPausedTimeRemaining[activityId];
          return newPausedTimeRemaining;
        });
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor(diff % 60000 / 1000);

      setCountdowns(prev => ({
        ...prev,
        [activityId]: `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
      }));
    };

    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    setIntervalIds(prev => ({
      ...prev,
      [activityId]: id
    }));
  };

  const toggleActivityStatus = (activityId: string) => {
    const isCurrentlyAvailable = activeStatuses[activityId];
    const activity = activityList.find(a => a.id === activityId);
    const isBoardGame = activity?.name.toLowerCase().includes('board game');

    setActiveStatuses(prev => ({
      ...prev,
      [activityId]: !isCurrentlyAvailable
    }));

    if (!isBoardGame && isCurrentlyAvailable) {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 30);
      const hours = endTime.getHours();
      const minutes = endTime.getMinutes();

      setNextAvailable(prev => ({
        ...prev,
        [activityId]: `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
      }));

      startCountdown(activityId, endTime);

      toast({
        title: "Activity In Use",
        description: "The activity has been marked as in use.",
        variant: "default"
      });
    } else if (!isBoardGame) {
      clearInterval(intervalIds[activityId]);
      setNextAvailable(prev => {
        const newNextAvailable = {
          ...prev
        };
        delete newNextAvailable[activityId];
        return newNextAvailable;
      });
      setCountdowns(prev => {
        const newCountdowns = {
          ...prev
        };
        delete newCountdowns[activityId];
        return newCountdowns;
      });
      setPausedTimers(prev => {
        const newPausedTimers = {
          ...prev
        };
        delete newPausedTimers[activityId];
        return newPausedTimers;
      });
      setPausedTimeRemaining(prev => {
        const newPausedTimeRemaining = {
          ...prev
        };
        delete newPausedTimeRemaining[activityId];
        return newPausedTimeRemaining;
      });

      toast({
        title: "Activity Available",
        description: "The activity has been marked as available.",
        variant: "default"
      });
    } else {
      toast({
        title: isCurrentlyAvailable ? "Board Game In Use" : "Board Game Available",
        description: `The board game has been marked as ${isCurrentlyAvailable ? "in use" : "available"}.`,
        variant: "default"
      });
    }
  };

  const toggleTimer = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!countdowns[activityId]) return;
    restartTimer(activityId, e);
  };

  const stopTimer = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent div click

    clearInterval(intervalIds[activityId]);
    setActiveStatuses(prev => ({
      ...prev,
      [activityId]: true
    }));
    setNextAvailable(prev => {
      const newNextAvailable = {
        ...prev
      };
      delete newNextAvailable[activityId];
      return newNextAvailable;
    });
    setCountdowns(prev => {
      const newCountdowns = {
        ...prev
      };
      delete newCountdowns[activityId];
      return newCountdowns;
    });
    setPausedTimers(prev => {
      const newPausedTimers = {
        ...prev
      };
      delete newPausedTimers[activityId];
      return newPausedTimers;
    });
    setPausedTimeRemaining(prev => {
      const newPausedTimeRemaining = {
        ...prev
      };
      delete newPausedTimeRemaining[activityId];
      return newPausedTimeRemaining;
    });

    toast({
      title: "Timer Stopped",
      description: "The activity is now available.",
      variant: "default"
    });
  };

  const restartTimer = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent div click

    clearInterval(intervalIds[activityId]);
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + 30);
    const hours = endTime.getHours();
    const minutes = endTime.getMinutes();

    setNextAvailable(prev => ({
      ...prev,
      [activityId]: `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
    }));
    setPausedTimers(prev => {
      const newPausedTimers = {
        ...prev
      };
      delete newPausedTimers[activityId];
      return newPausedTimers;
    });

    startCountdown(activityId, endTime);

    toast({
      title: "Timer Restarted",
      description: "The timer has been reset to 30 minutes.",
      variant: "default"
    });
  };

  const deleteActivity = (activityId: string) => {
    setActivityList(prev => prev.filter(activity => activity.id !== activityId));
    activitiesService.delete(activityId);

    toast({
      title: "Activity Removed",
      description: "The board game has been removed from the list.",
      variant: "default"
    });
  };

  const addBoardGame = () => {
    if (!boardGameName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the board game.",
        variant: "destructive"
      });
      return;
    }

    const newBoardGame = activitiesService.create({
      name: `Board Game: ${boardGameName}`,
      description: "Free board game for guests",
      imageUrl: "/assets/images/board-games.webp",
      pricePerHalfHour: 0,
      pricePerHour: 0,
      available: 1,
      isActive: true
    });

    setActivityList(prev => [...prev, newBoardGame]);
    
    setActiveStatuses(prev => ({
      ...prev,
      [newBoardGame.id]: true
    }));
    
    setBoardGameName("");
    setIsDialogOpen(false);

    toast({
      title: "Board Game Added",
      description: `${boardGameName} has been added to board games.`,
      variant: "default"
    });
  };

  const createTransaction = (data: TransactionFormValues) => {
    const selectedActivity = activityList.find(a => a.id === data.activityId);

    if (!selectedActivity) {
      toast({
        title: "Error",
        description: "Selected activity not found",
        variant: "destructive"
      });
      return;
    }

    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + data.durationMinutes);

    const newTransaction = transactionsService.create({
      userId: "guest-user", // This could be replaced with actual user ID if available
      activityName: selectedActivity.name,
      activityId: selectedActivity.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      timeStart: startTime.toISOString(),
      timeEnd: endTime.toISOString(),
      duration: data.durationMinutes,
      userName: "Guest User"
    });

    setActiveStatuses(prev => ({
      ...prev,
      [data.activityId]: false
    }));

    setNextAvailable(prev => ({
      ...prev,
      [data.activityId]: `${endTime.getHours()}:${endTime.getMinutes() < 10 ? '0' + endTime.getMinutes() : endTime.getMinutes()}`
    }));

    startCountdown(data.activityId, endTime);

    toast({
      title: "Transaction Created",
      description: `Transaction for ${selectedActivity.name} has been successfully created.`,
      variant: "default"
    });

    setIsTransactionDialogOpen(false);
    transactionForm.reset();
  };

  const renderStatusBadge = (activityId: string) => {
    const isAvailable = activeStatuses[activityId];

    return (
      <Badge
        variant={isAvailable ? "default" : "destructive"}
        className={`gap-1 text-xs font-semibold ${isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
      >
        {isAvailable ? (
          <>
            <CheckCircle2 size={12} />
            <span>Available</span>
          </>
        ) : (
          <>
            <XCircle size={12} />
            <span>In Use</span>
          </>
        )}
      </Badge>
    );
  };

  const renderTimerControls = (activityId: string) => {
    if (!countdowns[activityId]) return null;

    return (
      <div className="flex space-x-1 mt-1">
        <Button
          variant="outline"
          size="icon"
          className="h-5 w-5 bg-red-500/30 border-none hover:bg-red-500/50"
          onClick={e => stopTimer(activityId, e)}
          title="Stop"
        >
          <StopCircle size={12} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-5 w-5 bg-blue-500/30 border-none hover:bg-blue-500/50"
          onClick={e => restartTimer(activityId, e)}
          title="Restart"
        >
          <RefreshCcw size={12} />
        </Button>
      </div>
    );
  };

  const getActivityImage = (activityName: string) => {
    if (activityName.toLowerCase().includes('ps5')) {
      return "/assets/images/ps5.webp";
    } else if (activityName.toLowerCase().includes('xbox')) {
      return "/assets/images/xbox.webp";
    } else if (activityName.toLowerCase().includes('switch')) {
      return "/assets/images/switch.webp";
    } else if (activityName.toLowerCase().includes('billiard')) {
      return "/assets/images/billiards.webp";
    } else if (activityName.toLowerCase().includes('board')) {
      return "/assets/images/board-games.webp";
    }
    return "/assets/images/gamepad.webp";
  };

  const renderTimerDisplay = (activityId: string) => {
    if (activeStatuses[activityId]) return null;

    const activity = activityList.find(a => a.id === activityId);
    if (activity && activity.name.toLowerCase().includes('board game')) {
      return null;
    }

    return (
      <div
        className="flex items-center justify-between text-amber-300 text-sm mt-1 min-h-[32px] cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span className="min-w-[96px]">
            {pausedTimers[activityId] ? `Paused: ${countdowns[activityId] || "00:00"}` : `Available in: ${countdowns[activityId] || "00:00"}`}
          </span>
        </div>
        {renderTimerControls(activityId)}
      </div>
    );
  };

  const calculateSuggestedPrice = (activityId: string, durationMinutes: number) => {
    const activity = activityList.find(a => a.id === activityId);
    if (!activity) return 0;

    if (activity.name.toLowerCase().includes('board game')) {
      return 0; // Board games are free
    }

    const hourRate = activity.pricePerHour || 20; // Default hourly rate if not set
    const halfHourRate = activity.pricePerHalfHour || hourRate / 2;

    if (durationMinutes <= 30) {
      return halfHourRate;
    } else {
      const hours = durationMinutes / 60;
      return Math.round(hourRate * hours);
    }
  };

  const handleAddTransaction = () => {
    const activeActivities = activityList.filter(a => a.isActive);

    if (activeActivities.length === 0) {
      toast({
        title: "No Active Activities",
        description: "There are no active activities available for transactions.",
        variant: "destructive"
      });
      return;
    }

    setIsTransactionDialogOpen(true);
    transactionForm.reset({
      activityId: "",
      amount: 0,
      paymentMethod: "cash",
      durationMinutes: 30
    });
  };

  const handleBoardGameClick = (activityId: string) => {
    toggleActivityStatus(activityId);
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-b from-background to-secondary/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-primary">Active Games</CardTitle>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleAddTransaction} className="bg-primary hover:bg-primary/90">
            <DollarSign className="mr-1 h-4 w-4" />
            New Transaction
          </Button>
          <Link to="/activities">
            <Button variant="ghost" size="sm" className="text-primary hover:text-white hover:bg-primary/20">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Enter transaction details for a game or activity.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(createTransaction)} className="space-y-4 py-4">
                <FormField
                  control={transactionForm.control}
                  name="activityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an activity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityList
                            .filter(activity => activity.isActive)
                            .map(activity => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={transactionForm.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            const activityId = transactionForm.getValues("activityId");
                            if (activityId) {
                              const suggestedPrice = calculateSuggestedPrice(
                                activityId,
                                parseInt(e.target.value)
                              );
                              transactionForm.setValue("amount", suggestedPrice);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Common durations: 30min, 60min, 90min
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={transactionForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button variant="ghost" type="button" onClick={() => setIsTransactionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Transaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-primary/30 p-2 rounded-md mr-3">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Game Consoles</h2>
              </div>
              
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                  {getActivitiesByType("PS5").filter(a => activeStatuses[a.id]).length +
                    getActivitiesByType("Xbox").filter(a => activeStatuses[a.id]).length +
                    getActivitiesByType("Switch").filter(a => activeStatuses[a.id]).length} Available
                </Badge>
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                  {getActivitiesByType("PS5").filter(a => !activeStatuses[a.id]).length +
                    getActivitiesByType("Xbox").filter(a => !activeStatuses[a.id]).length +
                    getActivitiesByType("Switch").filter(a => !activeStatuses[a.id]).length} In Use
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getActivitiesByType("PS5").length > 0
                ? getActivitiesByType("PS5").map((activity, index) => (
                    <div
                      key={activity.id}
                      onClick={() => toggleActivityStatus(activity.id)}
                      className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer h-[200px]
                      ${!activeStatuses[activity.id]
                        ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                        : "border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                      }
                    `}
                    >
                      <div
                        className="h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${getActivityImage(activity.name)})`
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                          <div className="absolute top-3 right-3">
                            {renderStatusBadge(activity.id)}
                          </div>
                          
                          <h3 className="font-bold text-lg text-white">
                            {getActivitiesByType("PS5").length > 1
                              ? `PlayStation 5 ${index + 1}`
                              : "PlayStation 5"}
                          </h3>
                          
                          {renderTimerDisplay(activity.id)}
                        </div>
                      </div>
                    </div>
                  ))
                : null}
              
              {getActivitiesByType("Xbox").map(activity => (
                <div
                  key={activity.id}
                  onClick={() => toggleActivityStatus(activity.id)}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer h-[200px]
                    ${!activeStatuses[activity.id]
                      ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                      : "border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                    }
                  `}
                >
                  <div
                    className="h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getActivityImage(activity.name)})`
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                      <div className="absolute top-3 right-3">
                        {renderStatusBadge(activity.id)}
                      </div>
                      
                      <h3 className="font-bold text-lg text-white">Xbox Series X</h3>
                      
                      {renderTimerDisplay(activity.id)}
                    </div>
                  </div>
                </div>
              ))}
              
              {getActivitiesByType("Switch").map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => toggleActivityStatus(activity.id)}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer h-[200px]
                    ${!activeStatuses[activity.id]
                      ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                      : "border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                    }
                  `}
                >
                  <div
                    className="h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getActivityImage(activity.name)})`
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                      <div className="absolute top-3 right-3">
                        {renderStatusBadge(activity.id)}
                      </div>
                      
                      <h3 className="font-bold text-lg text-white">Nintendo Switch {index + 1}</h3>
                      
                      {renderTimerDisplay(activity.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center mb-4">
              <div className="bg-primary/30 p-2 rounded-md mr-3">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="scale(0.03) translate(100, 100)">
                    <circle cx="450" cy="350" r="150" fill="#000000" stroke="#000000" strokeWidth="10" />
                    <circle cx="450" cy="350" r="50" fill="#FFFFFF" />
                    <text x="450" y="370" textAnchor="middle" fill="#000000" fontSize="60" fontWeight="bold">8</text>
                    
                    <line x1="200" y1="200" x2="650" y2="650" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
                    
                    <circle cx="300" cy="500" r="130" fill="#FFFFFF" stroke="#000000" strokeWidth="10" />
                    <path d="M300 500 L300 370 A130 130 0 0 1 430 500 Z" fill="#FFCC00" />
                    <circle cx="300" cy="500" r="50" fill="#FFFFFF" />
                    <text x="300" y="520" textAnchor="middle" fill="#000000" fontSize="60" fontWeight="bold">9</text>
                    
                    <circle cx="520" cy="480" r="130" fill="#ea384c" stroke="#000000" strokeWidth="10" />
                    <circle cx="520" cy="480" r="50" fill="#FFFFFF" />
                    <text x="520" y="500" textAnchor="middle" fill="#000000" fontSize="60" fontWeight="bold">7</text>
                    
                    <path d="M400 290 Q420 270, 440 290" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                    <path d="M250 440 Q270 420, 290 440" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                    <path d="M470 420 Q490 400, 510 420" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                  </g>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-foreground">Billiards Tables</h2>
              
              <div className="ml-auto flex space-x-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                  {getActivitiesByType("Billiard").filter(a => activeStatuses[a.id]).length} Available
                </Badge>
                <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                  {getActivitiesByType("Billiard").filter(a => !activeStatuses[a.id]).length} In Use
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getActivitiesByType("Billiard").map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => toggleActivityStatus(activity.id)}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer h-[200px]
                    ${!activeStatuses[activity.id]
                      ? "border-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                      : "border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                    }
                  `}
                >
                  <div
                    className="h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getActivityImage(activity.name)})`
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                      <div className="absolute top-3 right-3">
                        {renderStatusBadge(activity.id)}
                      </div>
                      
                      <h3 className="font-bold text-lg text-white">Billiards Table {index + 1}</h3>
                      
                      {renderTimerDisplay(activity.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-primary/30 p-2 rounded-md mr-3">
                  <Dices className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Board Games</h2>
              </div>
              <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/80">
                <Plus className="mr-1 h-4 w-4" />
                Add Board Game
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Board Game</DialogTitle>
                  <DialogDescription>
                    Enter the name of the board game to add it to the collection.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="boardGameName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Game Name
                    </label>
                    <Input
                      id="boardGameName"
                      value={boardGameName}
                      onChange={(e) => setBoardGameName(e.target.value)}
                      placeholder="Enter board game name"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addBoardGame}>
                    Add Game
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getActivitiesByType("Board Game").map((activity) => (
                <AlertDialog key={activity.id}>
                  <div className="relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-105">
                    <div
                      className="h-[200px] bg-cover bg-center cursor-pointer"
                      style={{
                        backgroundImage: `url(${getActivityImage(activity.name)})`
                      }}
                      onClick={() => handleBoardGameClick(activity.id)}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                        <div className="absolute top-3 right-3 flex space-x-2">
                          {renderStatusBadge(activity.id)}
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-red-500/30 border-none hover:bg-red-500/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </AlertDialogTrigger>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg text-white">
                            {activity.name.replace("Board Game: ", "")}
                          </h3>
                          <Badge variant="free" className="ml-2">FREE</Badge>
                        </div>
                        <p className="text-xs text-white/70">Free for guests</p>
                      </div>
                    </div>
                  </div>
                  
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Board Game</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{activity.name.replace("Board Game: ", "")}" from the board games list?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteActivity(activity.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLayout;

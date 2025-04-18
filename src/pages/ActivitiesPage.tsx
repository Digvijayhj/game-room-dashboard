import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Activity } from "@/types";
import { activitiesService } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash, Pencil, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/utils/dateUtils";

const ActivitiesPage: React.FC = () => {
  const {
    hasPermission
  } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: "",
    description: "",
    imageUrl: "",
    pricePerHalfHour: 2,
    pricePerHour: 4,
    available: 1,
    isActive: true
  });
  const hasEditPermission = hasPermission(["admin", "developer"]);
  useEffect(() => {
    loadActivities();
  }, []);
  const loadActivities = () => {
    const data = activitiesService.getAll();
    setActivities(data);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value,
      type
    } = e.target;
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      pricePerHalfHour: 2,
      pricePerHour: 4,
      available: 1,
      isActive: true
    });
    setIsEditing(false);
  };
  const handleEditActivity = (activity: Activity) => {
    setFormData(activity);
    setIsEditing(true);
    setOpenDialog(true);
  };
  const handleToggleActive = (activity: Activity) => {
    try {
      activitiesService.update(activity.id, {
        isActive: !activity.isActive
      });
      loadActivities();
      toast.success(`${activity.name} ${activity.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      toast.error("Failed to update activity status");
    }
  };
  const handleDeleteActivity = (id: string) => {
    try {
      activitiesService.delete(id);
      loadActivities();
      toast.success("Activity deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete activity");
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let activityName = formData.name?.trim() || "";

      if (activityName.toLowerCase().includes("playstation") && !activityName.includes("PS5")) {
        activityName = activityName.replace("PlayStation", "PlayStation 5 (PS5)");
      }
      const updatedFormData = {
        ...formData,
        name: activityName
      };
      if (isEditing && formData.id) {
        activitiesService.update(formData.id, updatedFormData);
        toast.success("Activity updated successfully!");
      } else {
        activitiesService.create(updatedFormData as Omit<Activity, "id" | "createdAt">);
        toast.success("Activity created successfully!");
      }
      setOpenDialog(false);
      resetForm();
      loadActivities();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} activity`);
    }
  };
  return <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Activities</h1>
          <p className="text-muted-foreground mt-1">
            Manage game room activities and equipment
          </p>
        </div>
        {hasEditPermission && <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
            resetForm();
            setOpenDialog(true);
          }} className="also fix this button its invisible\n">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-card border-game-primary/30">
              <DialogHeader>
                <DialogTitle className="text-xl text-game-primary">
                  {isEditing ? "Edit Activity" : "Add New Activity"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update the details of this activity" : "Add a new game or activity to the game room"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" rows={2} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="imageUrl" className="text-right">
                      Image URL
                    </Label>
                    <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="col-span-3" placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pricePerHalfHour" className="text-right">
                      Price (30min)
                    </Label>
                    <Input id="pricePerHalfHour" name="pricePerHalfHour" type="number" min="0" step="0.5" value={formData.pricePerHalfHour} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pricePerHour" className="text-right">
                      Price (1 hour)
                    </Label>
                    <Input id="pricePerHour" name="pricePerHour" type="number" min="0" step="0.5" value={formData.pricePerHour} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="available" className="text-right">
                      Available
                    </Label>
                    <Input id="available" name="available" type="number" min="1" step="1" value={formData.available} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="this button is not visible \n">
                    {isEditing ? "Update Activity" : "Add Activity"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => <Card key={activity.id} className={`game-card overflow-hidden border-game-primary/30 ${activity.isActive ? "game-card-active" : "opacity-70"}`}>
            <div className="h-40 bg-cover bg-center" style={{
          backgroundImage: `url(${activity.imageUrl})`
        }} />
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{activity.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Added on {formatDisplayDate(activity.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {hasEditPermission && <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-game-primary" onClick={() => handleToggleActive(activity)}>
                        {activity.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-game-primary" onClick={() => handleEditActivity(activity)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-destructive/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">
                              Delete Activity
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{activity.name}"? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-muted-foreground border-muted">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteActivity(activity.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>}
                </div>
              </div>
              <p className="text-sm mb-3 h-12 overflow-hidden text-muted-foreground">
                {activity.description || "No description provided."}
              </p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm space-x-2">
                  <span className="bg-game-primary/20 text-game-primary px-2 py-1 rounded-full text-xs">
                    30min: ${activity.pricePerHalfHour}
                  </span>
                  <span className="bg-game-primary/20 text-game-primary px-2 py-1 rounded-full text-xs">
                    1hr: ${activity.pricePerHour}
                  </span>
                </div>
                <span className="bg-muted px-2 py-1 rounded-full text-xs">
                  Available: {activity.available}
                </span>
              </div>
            </CardContent>
          </Card>)}
        
        {activities.length === 0 && <div className="col-span-full flex justify-center items-center p-12 border border-dashed border-muted-foreground/50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no activities added to the game room yet.
              </p>
              {hasEditPermission && <Button onClick={() => setOpenDialog(true)} className="bg-game-primary hover:bg-game-secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Activity
                </Button>}
            </div>
          </div>}
      </div>
    </div>;
};

export default ActivitiesPage;

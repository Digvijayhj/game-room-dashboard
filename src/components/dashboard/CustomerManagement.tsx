
import React, { useState } from "react";
import { Activity } from "@/types";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerManagementProps {
  activities: Activity[];
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ activities }) => {
  // Customer management state
  const [customerName, setCustomerName] = useState("");
  const [customerActivity, setCustomerActivity] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<{id: string, name: string, activityId: string} | null>(null);
  const [activeCustomers, setActiveCustomers] = useState<{id: string, name: string, activityId: string, activityName: string}[]>([
    { id: "c1", name: "John Smith", activityId: "1", activityName: "Billiards" },
    { id: "c2", name: "Emma Johnson", activityId: "2", activityName: "PS5" },
    { id: "c3", name: "Michael Brown", activityId: "3", activityName: "Xbox" }
  ]);

  // Handle adding a new customer
  const handleAddCustomer = () => {
    if (customerName && customerActivity) {
      const activity = activities.find(a => a.id === customerActivity);
      const newCustomer = {
        id: `c${Date.now()}`,
        name: customerName,
        activityId: customerActivity,
        activityName: activity ? activity.name : "Unknown"
      };
      setActiveCustomers([...activeCustomers, newCustomer]);
      setCustomerName("");
      setCustomerActivity("");
    }
  };

  // Handle editing customer
  const handleEditCustomer = (customer: {id: string, name: string, activityId: string, activityName: string}) => {
    setEditingCustomer({
      id: customer.id,
      name: customer.name,
      activityId: customer.activityId
    });
    setCustomerName(customer.name);
    setCustomerActivity(customer.activityId);
  };

  // Handle saving edited customer
  const handleSaveCustomer = () => {
    if (editingCustomer && customerName && customerActivity) {
      const activity = activities.find(a => a.id === customerActivity);
      const updatedCustomers = activeCustomers.map(c => 
        c.id === editingCustomer.id 
          ? {
              ...c,
              name: customerName,
              activityId: customerActivity,
              activityName: activity ? activity.name : "Unknown"
            }
          : c
      );
      setActiveCustomers(updatedCustomers);
      setEditingCustomer(null);
      setCustomerName("");
      setCustomerActivity("");
    }
  };

  // Handle removing customer
  const handleRemoveCustomer = (customerId: string) => {
    setActiveCustomers(activeCustomers.filter(c => c.id !== customerId));
    if (editingCustomer?.id === customerId) {
      setEditingCustomer(null);
      setCustomerName("");
      setCustomerActivity("");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setCustomerName("");
    setCustomerActivity("");
  };

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
      <CardHeader>
        <CardTitle className="text-primary">Customer Activity Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Form */}
          <div className="col-span-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="bg-secondary/10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Activity</label>
                <select
                  value={customerActivity}
                  onChange={(e) => setCustomerActivity(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-secondary/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select an activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                {editingCustomer ? (
                  <>
                    <Button onClick={handleSaveCustomer} className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline">
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddCustomer} className="bg-primary hover:bg-primary/90">
                    Add Customer
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Active Customers List */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Active Customers</h3>
            
            {activeCustomers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No active customers at the moment
              </div>
            ) : (
              <div className="space-y-3">
                {activeCustomers.map((customer) => (
                  <div key={customer.id} className="p-3 border border-primary/20 rounded-md bg-secondary/10 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">Using: {customer.activityName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleRemoveCustomer(customer.id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerManagement;

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/types";
import { usersService } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash,
  Pencil,
  Search,
  Shield,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/utils/dateUtils";

const UserManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    email: string;
    role: UserRole;
  }>({
    name: "",
    email: "",
    role: "attendant",
  });

  const canManageUsers = hasPermission(["admin"]);
  const canEditUsers = hasPermission(["admin", "developer"]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const loadUsers = () => {
    const loadedUsers = usersService.getAll();
    setUsers(loadedUsers);
    setFilteredUsers(loadedUsers);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "attendant",
    });
    setIsEditing(false);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteUser = (id: string) => {
    try {
      if (id === user?.id) {
        toast.error("You cannot delete your own account");
        return;
      }
      
      usersService.delete(id);
      loadUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && formData.id) {
        if (formData.id === user?.id && user.role === "admin" && formData.role !== "admin") {
          toast.error("You cannot downgrade your own admin role");
          return;
        }
        
        usersService.update(formData.id, formData);
        toast.success("User updated successfully");
      } else {
        const existingUser = users.find(u => u.email === formData.email);
        if (existingUser) {
          toast.error("A user with this email already exists");
          return;
        }
        
        usersService.create(formData);
        toast.success("User created successfully");
      }
      
      setOpenDialog(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} user`);
    }
  };

  if (!canEditUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md border-destructive bg-card">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to view this page. Please contact an
              administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        {canManageUsers && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 mt-4 sm:mt-0"
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary">
                  {isEditing ? "Edit User" : "Add New User"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleRoleChange(value as UserRole)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="attendant">Game Room Attendant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <div className="col-span-4 mt-2">
                      <p className="text-xs text-muted-foreground">
                        Note: In a production environment, this would include setting a password or 
                        sending an invitation email. For this demo, users are pre-configured with 
                        default passwords.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isEditing ? "Update User" : "Add User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSearchQuery("")}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          Clear
        </Button>
      </div>

      <Card className="border border-primary/20 bg-gradient-to-br from-secondary to-background">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-sidebar-border hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  {canManageUsers && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userData) => (
                    <TableRow 
                      key={userData.id}
                      className="border-b border-sidebar-border hover:bg-sidebar-accent/10"
                    >
                      <TableCell>{userData.name}</TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {userData.role === "admin" ? (
                            <ShieldAlert className="h-4 w-4 mr-2 text-red-400" />
                          ) : userData.role === "developer" ? (
                            <Shield className="h-4 w-4 mr-2 text-blue-400" />
                          ) : (
                            <UserCog className="h-4 w-4 mr-2 text-green-400" />
                          )}
                          <span className="capitalize">{userData.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDisplayDate(userData.createdAt)}</TableCell>
                      {canManageUsers && (
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditUser(userData)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  disabled={userData.id === user?.id}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-destructive/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-destructive">
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {userData.name}? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-muted-foreground border-muted">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDeleteUser(userData.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={canManageUsers ? 5 : 4} 
                      className="h-32 text-center text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-muted bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">User Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border border-sidebar-border rounded-md">
              <div className="flex items-center mb-2">
                <ShieldAlert className="h-4 w-4 mr-2 text-red-400" />
                <span className="font-semibold">Admin</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Full system access</li>
                <li>• Manage all users</li>
                <li>• Manage all activities</li>
                <li>• View & modify transactions</li>
                <li>• Generate & download reports</li>
              </ul>
            </div>
            <div className="p-3 border border-sidebar-border rounded-md">
              <div className="flex items-center mb-2">
                <Shield className="h-4 w-4 mr-2 text-blue-400" />
                <span className="font-semibold">Developer</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Limited user management</li>
                <li>• Manage all activities</li>
                <li>• View & modify transactions</li>
                <li>• Generate & download reports</li>
                <li>• Technical support access</li>
              </ul>
            </div>
            <div className="p-3 border border-sidebar-border rounded-md">
              <div className="flex items-center mb-2">
                <UserCog className="h-4 w-4 mr-2 text-green-400" />
                <span className="font-semibold">Game Room Attendant</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Add transactions</li>
                <li>• View activities</li>
                <li>• Generate shift reports</li>
                <li>• View own statistics</li>
                <li>• Basic system access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;

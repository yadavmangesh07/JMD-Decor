import { useState } from "react";
import { ShieldAlert, UserPlus, Trash2, Key, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService, type User } from "@/services/authService";

// 👇 Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamTabProps {
  users: User[];
  onDeleteClick: (e: React.MouseEvent | any, id: string, username: string) => void;
  onUserAdded: () => void;
}

export function TeamTab({ users, onDeleteClick, onUserAdded }: TeamTabProps) {
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "USER" });
  
  // 👇 State to manage the delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; username: string }>({
    isOpen: false,
    id: "",
    username: "",
  });

  const handleAddUser = async () => {
    if(!newUser.username || !newUser.password) return toast.error("Please fill username and password");
    try {
      await authService.register(newUser.username, newUser.password, newUser.role);
      toast.success(`User '${newUser.username}' created successfully!`);
      setNewUser({ username: "", password: "", role: "USER" }); 
      onUserAdded(); 
    } catch (err: any) {
        const msg = err.response?.data?.message || "Failed to add user";
        toast.error(msg);
    }
  };

  // 👇 Helper to trigger actual deletion and close dialog
  const confirmDelete = (e: React.MouseEvent) => {
    onDeleteClick(e, deleteDialog.id, deleteDialog.username);
    setDeleteDialog({ isOpen: false, id: "", username: "" });
  };

  return (
    <>
      <Card className="w-full border shadow-sm bg-gray-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <CardTitle>Team Management</CardTitle>
          </div>
          <CardDescription>Manage user access and permissions for your team.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          
          {/* 1. ADD USER FORM */}
          <div className="p-5 border rounded-xl bg-white shadow-sm">
            <h3 className="font-medium text-sm text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              Add New Team Member
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="jdoe" 
                    className="pl-9 bg-gray-50/50"
                    value={newUser.username} 
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    className="pl-9 bg-gray-50/50"
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">Role</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="USER">User (Standard)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>

              <Button onClick={handleAddUser} className="w-full shadow-sm">
                Create Account
              </Button>
            </div>
          </div>

          {/* 2. ACTIVE MEMBERS GRID */}
          <div>
            <h3 className="text-sm font-semibold mb-4 ml-1 flex items-center gap-2">
              Active Team Members 
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{users.length}</span>
            </h3>
            
            {users.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                 No other users found. Add one above.
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="group relative flex flex-col items-center p-4 border rounded-xl bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
                    >
                        {/* Delete Button (Top Right) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              // 👇 Trigger dialog instead of immediate delete
                              onClick={() => setDeleteDialog({ isOpen: true, id: user.id!, username: user.username })} 
                              className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                              title="Remove User"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Header: Avatar */}
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border mb-3 ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {user.username.substring(0,2).toUpperCase()}
                        </div>

                        {/* Body: Info */}
                        <div className="flex flex-col items-center gap-1.5 w-full">
                           <h4 className="font-semibold text-sm text-gray-900 truncate max-w-full px-2" title={user.username}>
                             {user.username}
                           </h4>
                           
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {user.role}
                           </span>
                            
                            <div className="flex items-center gap-1 mt-1 p-1 bg-gray-50 rounded border border-gray-100">
                              <Key className="h-3 w-3 text-gray-400" />
                              <code className="text-[10px] text-muted-foreground font-mono">
                                 {user.id ? user.id.substring(0, 8) + "..." : "..."}
                              </code>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* 👇 3. THE CONFIRMATION DIALOG */}
      <Dialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Delete Team Member
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently remove <strong>{deleteDialog.username}</strong> from the system? 
              They will immediately lose access to the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ isOpen: false, id: "", username: "" })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
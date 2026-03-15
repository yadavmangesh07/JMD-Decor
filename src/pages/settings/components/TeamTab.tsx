import { useState } from "react";
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Key, 
  User as UserIcon, 
  Fingerprint,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { authService, type User } from "@/services/authService";
import { cn } from "@/lib/utils";

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
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; username: string }>({
    isOpen: false,
    id: "",
    username: "",
  });

  const handleAddUser = async () => {
    if(!newUser.username || !newUser.password) return toast.error("Please provide all credentials");
    try {
      await authService.register(newUser.username, newUser.password, newUser.role);
      toast.success(`Access granted to ${newUser.username}`);
      setNewUser({ username: "", password: "", role: "USER" }); 
      onUserAdded(); 
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  const confirmDelete = (e: React.MouseEvent) => {
    onDeleteClick(e, deleteDialog.id, deleteDialog.username);
    setDeleteDialog({ isOpen: false, id: "", username: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      
      {/* --- SECTION 1: ADD USER (HORIZONAL CONTROL BAR) --- */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b">
           <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Onboard New Member</CardTitle>
                <CardDescription className="text-xs font-medium">Create a new system identity for JMD Decor</CardDescription>
              </div>
           </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
                <Input 
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10 text-sm" 
                  placeholder="e.g. rahul_admin"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
                <Input 
                  type="password"
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10 text-sm" 
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Access Level</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="USER">Standard User</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddUser} className="w-full h-10 font-bold tracking-tight shadow-md hover:shadow-primary/20 transition-all">
                Grant Access
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 2: TEAM TABLE (ORGANISED LIST) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Active Team Directory
            </h3>
            <div className="px-2.5 py-1 rounded-full bg-slate-100 border text-[11px] font-black text-slate-500">
              {users.length} TOTAL
            </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b">
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">Team Member</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">Security Identifier</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400">Permissions</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border-b last:border-0 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm border shadow-sm",
                          user.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-primary/5 text-primary border-primary/10'
                        )}>
                          {user.username.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{user.username}</span>
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-3 w-3" />
                        {user.id?.slice(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        user.role === 'ADMIN' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteDialog({ isOpen: true, id: user.id!, username: user.username })}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-slate-200" />
              </div>
              <h4 className="font-bold text-slate-900">Directory Empty</h4>
              <p className="text-sm text-slate-500">No other users are currently registered in the system.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center">
             <div className="p-3 bg-red-50 rounded-full mb-2">
               <ShieldAlert className="h-6 w-6 text-red-500" />
             </div>
            <DialogTitle className="text-xl font-bold">Terminate Access?</DialogTitle>
            <DialogDescription className="text-sm">
              Removing <b>{deleteDialog.username}</b> will revoke all system privileges immediately. This action is recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-0 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDialog({ isOpen: false, id: "", username: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 font-bold" onClick={confirmDelete}>
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
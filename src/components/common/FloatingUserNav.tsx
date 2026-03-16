import { useEffect, useState } from "react";
import { LogOut, User, Settings, ChevronDown, ShieldCheck, UserCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { authService, type User as AuthUser } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FloatingUserNav() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="fixed top-4 right-5 z-[100] ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "h-12 pl-1.5 pr-4 rounded-full transition-all duration-300",
              "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
              "hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-white/60 group",
              "ring-offset-2 ring-offset-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with Ring & Status */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "absolute -inset-0.5 rounded-full blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity",
                  isAdmin ? "bg-amber-500" : "bg-indigo-500"
                )} />
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm relative">
                  <AvatarFallback className={cn(
                    "text-[11px] font-black tracking-tighter",
                    isAdmin ? "bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700" : "bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-700"
                  )}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Active Indicator with Pulse */}
                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              {/* Identity Info */}
              <div className="hidden sm:flex flex-col items-start text-left gap-0">
                <span className="text-[13px] font-bold text-slate-900 tracking-tight leading-none group-hover:text-black transition-colors">
                  {user.username}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={cn(
                     "flex items-center justify-center p-0.5 rounded-sm",
                     isAdmin ? "bg-amber-100/50" : "bg-indigo-100/50"
                   )}>
                    {isAdmin ? <ShieldCheck className="h-2.5 w-2.5 text-amber-600" /> : <UserCircle className="h-2.5 w-2.5 text-indigo-500" />}
                   </div>
                   <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] leading-none">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-64 mt-3 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-slate-100/80 bg-white/95 backdrop-blur-xl" 
          align="end"
        >
          <DropdownMenuLabel className="font-normal px-3 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                  <AvatarFallback className={isAdmin ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-slate-900">{user.username}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center justify-center gap-1.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                isAdmin ? "bg-amber-50/50 text-amber-700 border-amber-100" : "bg-indigo-50/50 text-indigo-700 border-indigo-100"
              )}>
                <Sparkles className="h-3 w-3" />
                {user.role} Access
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-slate-100 mx-2" />
          
          <DropdownMenuGroup className="p-1">
            <DropdownMenuItem 
              onClick={() => navigate('/account')}
              className="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-slate-50 transition-colors"
            >
              <User className="mr-3 h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="rounded-xl py-2.5 px-3 cursor-pointer focus:bg-slate-50 transition-colors"
            >
              <Settings className="mr-3 h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">System Preferences</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="bg-slate-100 mx-2" />
          
          <div className="p-1">
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-700 focus:bg-red-50/50 rounded-xl py-2.5 px-3 cursor-pointer font-bold transition-colors" 
              onClick={() => { authService.logout(); window.location.reload(); }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
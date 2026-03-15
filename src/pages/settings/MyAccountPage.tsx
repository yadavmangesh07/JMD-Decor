import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserCog, Save, Lock, LogOut, AlertTriangle, KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
    Dialog, DialogContent, DialogDescription, DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { authService } from "@/services/authService";

const profileUpdateSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        return false;
    }
    return true;
}, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
});

export default function MyAccountPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingValues, setPendingValues] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            username: "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
        }
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            form.setValue("username", user.username);
        }
    }, []);

    const onSubmit = (values: any) => {
        setPendingValues(values);
        setIsConfirmOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!pendingValues) return;
        setIsLoading(true);
        setIsConfirmOpen(false);

        try {
            await authService.updateCurrentUser({
                username: pendingValues.username,
                currentPassword: pendingValues.currentPassword,
                newPassword: pendingValues.newPassword || undefined
            });

            toast.success("Security updated successfully");

            setTimeout(() => {
                authService.logout();
                navigate("/login");
            }, 1500);

        } catch (err: any) {
            const errorData = err.response?.data;
            const msg = typeof errorData === 'string' ? errorData : errorData?.message || "Failed to update";
            toast.error(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 pb-20 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Account Security</h1>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Identity & Credential Management
                </p>
            </div>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <UserCog className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800">Security Profile</CardTitle>
                            <CardDescription className="text-xs font-medium">Manage your system access credentials.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Username Section */}
                            <div className="space-y-4">
                                <FormField control={form.control} name="username" render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-400">Public Identifier</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-10 bg-slate-50/50 border-slate-200 focus-visible:ring-primary font-bold text-sm" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />
                            </div>

                            <Separator className="bg-slate-100/80" />

                            {/* Password Section */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Change Secret Key</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="newPassword" render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold text-slate-500">New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} className="h-10 border-slate-200 font-mono text-xs" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-[10px] font-bold text-slate-500">Confirm Secret</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} className="h-10 border-slate-200 font-mono text-xs" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* Verification Box */}
                            {/* Verification Box - Updated for Aesthetic Matching */}
                            <div className="relative group overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 transition-all duration-300 hover:border-amber-200/50 hover:bg-amber-50/30">
                                {/* Subtly animated accent line at the top */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <FormField control={form.control} name="currentPassword" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                                                <div className="p-1 bg-amber-100 rounded-sm">
                                                    <Lock className="h-3 w-3 text-amber-600" />
                                                </div>
                                                Current Authorization
                                            </FormLabel>
                                            <span className="text-[9px] font-bold text-amber-600/70 uppercase">Identity Verification Required</span>
                                        </div>

                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm current password to authorize changes"
                                                    {...field}
                                                    className={cn(
                                                        "h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 font-medium text-sm transition-all",
                                                        "focus-visible:ring-amber-500/20 focus-visible:border-amber-500 shadow-sm"
                                                    )}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold text-destructive/80" />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-10 px-8 font-black  tracking-tight shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? "Authenticating..." : <><Save className="mr-2 h-4 w-4" /> Save  Changes</>}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Enhanced Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-sm rounded-2xl border-none shadow-2xl overflow-hidden p-0">
                    <div className="bg-amber-50 p-6 flex flex-col items-center text-center gap-4">
                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-black tracking-tight text-amber-900">Security Reset Required</DialogTitle>
                            <DialogDescription className="text-xs text-amber-700 font-medium">
                                Updating credentials will terminate your current active session.
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="p-6 pt-0 flex flex-col gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3">
                            <LogOut className="h-4 w-4 text-slate-400 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-slate-500 font-bold  tracking-tight">
                                You will be redirected to the login portal immediately after the update.
                            </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" className="flex-1 text-xs font-bold" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                            <Button variant="default" className="flex-1 text-xs font-black  tracking-tighter" onClick={handleConfirmUpdate}>
                                Update & Exit
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
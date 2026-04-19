import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Lock, User, Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { authService } from "@/services/authService";
import apiClient from "@/lib/axios";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState(false);

  /**
   * 🚀 PERFORMANCE STRATEGY
   * 1. Wake-up: Hits the public health route to warm up JVM and DB.
   * 2. Preload: Downloads the Dashboard JS chunk while the user is typing.
   */
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        // Ping the new deep-health route we created
        await apiClient.get("/api/public/health");
      } catch (e) {
        console.log("Server warm-up ping sent.");
      }
    };

    // Browser downloads the Dashboard code in the background
    const preloadDashboard = () => import("../dashboard/DashboardPage");

    wakeUpServer();
    preloadDashboard();
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await authService.login(values);
      toast.success("Welcome back!");
      // Navigation is now instant because the code was pre-fetched
      navigate("/dashboard", { replace: true }); // Prevent users from navigating "back" to login
    } catch (error: any) {
      console.error("Login Error:", error);
      // Safely extract backend error message or fallback to default
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Invalid username or password";
        
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center flex flex-col items-center space-y-2">
          {!logoError ? (
            <div className="h-16 w-full flex items-center justify-center mb-2">
              <img 
                src="/logo.png" 
                alt="JMD Decor Logo" 
                className="h-full w-auto object-contain"
                onError={() => setLogoError(true)} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
               <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
               </div>
               <CardTitle className="text-2xl font-bold tracking-tight">JMD Decor</CardTitle>
            </div>
          )}
          <CardDescription>Enter your credentials to access the portal</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          className="pl-10" 
                          placeholder="Enter Username" 
                          autoComplete="username"
                          autoFocus
                          disabled={loading}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="••••••••" 
                          autoComplete="current-password"
                          disabled={loading}
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
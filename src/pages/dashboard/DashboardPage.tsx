import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import {
  IndianRupee,
  Users,
  FileText,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import apiClient from "@/lib/axios";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

import { clientService } from "@/services/clientService"; 
import type { Invoice } from "@/types";
import { cn } from "@/lib/utils"; 

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, clientsData] = await Promise.all([
            apiClient.get("/dashboard/stats"),
            clientService.getAll()
        ]);

        setStats(statsRes.data);

        if (Array.isArray(clientsData)) setClients(clientsData);
        else if ((clientsData as any)?.content) setClients((clientsData as any).content);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getClientName = (clientId: string) => {
      if (!clientId) return "Unknown Client";
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : "Unknown Client";
  };

  // 👇 UPDATED: Covers all variations to fix the color issue
  const getStatusStyle = (status: string | undefined) => {
    // Normalize string to uppercase to avoid case-sensitivity issues
    const s = (status || "").toUpperCase();

    switch (s) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"; // Green
      
      case "PENDING":
      case "UNPAID": 
      case "OVERDUE":
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"; // Red
      
      case "DRAFT":
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200"; // Gray
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading Dashboard...</div>;
  }

  if (!stats) return <div className="p-8 text-center">No data available.</div>;

  return (
    <div className="space-y-6 p-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{(stats.pendingAmount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">All time generated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
              {(!stats.monthlyStats || stats.monthlyStats.length === 0) ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No historical data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.monthlyStats}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted)/0.4)" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => value ? value.slice(0, 3) : ''}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                      width={60}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:h-[450px] flex flex-col">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {(!stats.recentInvoices || stats.recentInvoices.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
              ) : (
                stats.recentInvoices.map((inv: Invoice) => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getClientName(inv.clientId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{inv.invoiceNo} · {inv.issuedAt ? format(new Date(inv.issuedAt), "MMM dd, yyyy") : "No Date"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-sm">
                            ₹{(inv.total || 0).toFixed(2)}
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5 px-2 capitalize border", 
                            getStatusStyle(inv.status) // 👈 Uses the fixed logic
                          )}
                        >
                            {inv.status ? inv.status.toLowerCase() : "draft"}
                        </Badge>

                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
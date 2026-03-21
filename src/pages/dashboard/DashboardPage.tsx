import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  IndianRupee,
  Users,
  FileText,
  Activity,
  Clock,
  RefreshCw 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import apiClient from "@/lib/axios";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

// ─── Skeleton: Stats Cards ────────────────────────────────────────────────────
function StatsCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

// ─── Skeleton: Revenue Chart ──────────────────────────────────────────────────
function RevenueChartSkeleton() {
  return (
    <Card className="col-span-4 shadow-sm">
      <CardHeader>
        <Skeleton className="h-5 w-36 mb-1" />
        <Skeleton className="h-3 w-44" />
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full flex flex-col justify-end gap-2 px-4">
          {/* Fake bars to simulate a chart */}
          <div className="flex items-end gap-3 h-[280px]">
            {[55, 80, 45, 90, 65, 75, 50, 85, 60, 95, 70, 40].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md opacity-60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-3 rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton: Recent Invoices ────────────────────────────────────────────────
function RecentInvoicesSkeleton() {
  return (
    <Card className="col-span-3 lg:h-[450px] flex flex-col shadow-sm">
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton: Full Dashboard ─────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Invoices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChartSkeleton />
        <RecentInvoicesSkeleton />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [statsRes, clientsData] = await Promise.all([
          apiClient.get("/dashboard/stats"),
          clientService.getAll()
      ]);

      const dashboardData = statsRes.data;
      setStats(dashboardData);

      if (dashboardData.recentInvoices && dashboardData.recentInvoices.length > 0) {
        const latestDate = dashboardData.recentInvoices[0].issuedAt;
        setLastUpdated(new Date(latestDate));
      } else {
        setLastUpdated(new Date());
      }

      if (Array.isArray(clientsData)) setClients(clientsData);
      else if ((clientsData as any)?.content) setClients((clientsData as any).content);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getClientName = (clientId: string) => {
      if (!clientId) return "Unknown Client";
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : "Unknown Client";
  };

  const getStatusStyle = (status: string | undefined) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case "PENDING":
      case "UNPAID": 
      case "OVERDUE":
        return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
    }
  };

  // ── Show skeleton on initial load ──────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  if (!stats) return <div className="p-8 text-center">No data available.</div>;

  return (
    <div className="space-y-6 p-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border text-muted-foreground shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                Data from: {format(lastUpdated, "hh:mm a")} 
                <span className="ml-1 opacity-70">({formatDistanceToNow(lastUpdated, { addSuffix: true })})</span>
              </span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-9 shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime collected</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{(stats.pendingAmount || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
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
        {/* Revenue Chart */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pl-2">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              {(!stats.monthlyStats || stats.monthlyStats.length === 0) ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No historical data available yet.
                </div>
              ) : (
                <AreaChart
                  width={568}
                  height={350}
                  data={stats.monthlyStats}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-3 lg:h-[450px] flex flex-col shadow-sm">
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
                  <div key={inv.id} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                        {getClientName(inv.clientId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{inv.invoiceNo} · {inv.issuedAt ? format(new Date(inv.issuedAt), "MMM dd, yyyy") : "No Date"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-sm">
                            ₹{(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5 px-2 capitalize border shadow-none", 
                            getStatusStyle(inv.status)
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
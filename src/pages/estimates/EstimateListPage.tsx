import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, FileText, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { estimateService } from "@/services/estimateService";
import { clientService } from "@/services/clientService";
import type { Estimate } from "@/types";

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function EstimateRowSkeleton() {
  return (
    <TableRow className="pointer-events-none">
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-20 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EstimateListPage() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estData, clientData] = await Promise.all([
        estimateService.getAll(),
        clientService.getAll(),
      ]);
      setEstimates(Array.isArray(estData) ? estData : []);
      let loadedClients: any[] = [];
      if (Array.isArray(clientData)) loadedClients = clientData;
      else if ((clientData as any)?.content) loadedClients = (clientData as any).content;
      setClients(loadedClients);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this estimate?")) return;
    try {
      await estimateService.delete(id);
      toast.success("Estimate deleted");
      loadData();
    } catch { toast.error("Failed to delete"); }
  };

  const handleDownload = async (e: React.MouseEvent, id: string, estNo: string) => {
    e.stopPropagation();
    try {
      toast.info("Downloading PDF...");
      const blob = await estimateService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Estimate_${estNo || "doc"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error("Failed to download PDF"); }
  };

  /**
   * ✅ MODIFIED: Opens PDF in a new tab instead of a modal
   */
  const handlePreview = async (id: string) => {
    try {
      toast.info("Generating preview...", { duration: 1000 });
      const blob = await estimateService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank");
      
      if (!newTab) {
        toast.error("Popup blocked! Please allow popups to view the PDF.");
      }
    } catch {
      toast.error("Failed to load preview");
    }
  };

  const getClientName = (id: string) => {
    if (!clients?.length) return "Unknown";
    return clients.find(cl => cl.id === id)?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "SENT":     return "bg-blue-100 text-blue-700 border-blue-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default:         return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDateSafe = (dateString: any) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "dd MMM yyyy") : "Invalid Date";
    } catch { return "-"; }
  };

  const resetFilters = () => {
    setFilterClient("ALL");
    setFilterStatus("ALL");
    setSortOrder("desc");
    setSearch("");
  };

  const filtered = estimates
    .filter(e => {
      const matchesSearch =
        (e.estimateNo || "").toLowerCase().includes(search.toLowerCase()) ||
        (getClientName(e.clientId) || "").toLowerCase().includes(search.toLowerCase());
      const matchesClient = filterClient === "ALL" || e.clientId === filterClient;
      const matchesStatus = filterStatus === "ALL" || (e.status || "DRAFT") === filterStatus;
      return matchesSearch && matchesClient && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.estimateDate || 0).getTime();
      const dateB = new Date(b.estimateDate || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Estimates</h1>
          <p className="text-muted-foreground">Manage quotations and project estimates.</p>
        </div>
        <Button onClick={() => navigate("/estimates/new")} className="font-bold tracking-tight">
          <Plus className="mr-2 h-4 w-4" /> Create Estimate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-md border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mr-2">
          <Filter className="h-4 w-4" /> Filters:
        </div>
        <div className="w-[200px]">
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Clients" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Clients</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[150px]">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[160px]">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Sort Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(filterClient !== "ALL" || filterStatus !== "ALL" || search !== "") && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50">
            <X className="mr-1 h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Quotation List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Client or Est No..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Est No</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Client</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Status</TableHead>
                <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400">Total</TableHead>
                <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <EstimateRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No estimates found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((est) => (
                  <TableRow
                    key={est.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    onClick={() => handlePreview(est.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <div className="p-1.5 bg-orange-50 rounded border border-orange-100 group-hover:scale-110 transition-transform">
                          <FileText className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <span>{est.estimateNo || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">{formatDateSafe(est.estimateDate)}</TableCell>
                    <TableCell className="font-medium text-slate-700">{getClientName(est.clientId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] h-5 px-2 capitalize border font-bold tracking-tight", getStatusColor(est.status || "DRAFT"))}>
                        {(est.status || "DRAFT").toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900">
                      ₹{(est.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handlePreview(est.id)}>
                            <FileText className="mr-2 h-4 w-4" /> View Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownload(e, est.id, est.estimateNo)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/estimates/${est.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(est.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Estimate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
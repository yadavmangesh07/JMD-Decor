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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { estimateService } from "@/services/estimateService";
import { clientService } from "@/services/clientService";
import type { Estimate } from "@/types";

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function EstimateRowSkeleton() {
  return (
    <TableRow className="pointer-events-none">
      {/* Est No */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </TableCell>
      {/* Date */}
      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
      {/* Client */}
      <TableCell><Skeleton className="h-3.5 w-32" /></TableCell>
      {/* Status */}
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      {/* Total */}
      <TableCell className="text-right">
        <Skeleton className="h-3.5 w-20 ml-auto" />
      </TableCell>
      {/* Actions */}
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handlePreview = async (id: string) => {
    try {
      toast.info("Loading Preview...");
      const blob = await estimateService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch { toast.error("Failed to load preview"); }
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
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Manage quotations and project estimates.</p>
        </div>
        <Button onClick={() => navigate("/estimates/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Estimate
        </Button>
      </div>

      {/* ── Filters ── */}
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

      {/* ── Table Card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Estimates</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Client or Est No..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Est No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handlePreview(est.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span>{est.estimateNo || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateSafe(est.estimateDate)}</TableCell>
                    <TableCell>{getClientName(est.clientId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize", getStatusColor(est.status || "DRAFT"))}>
                        {(est.status || "DRAFT").toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₹{(est.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleDownload(e, est.id, est.estimateNo)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/estimates/${est.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(est.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* ── Preview Dialog ── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b bg-white rounded-t-lg">
            <DialogTitle>Estimate Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-gray-100 p-0 overflow-hidden">
            {previewUrl && (
              <iframe src={previewUrl} className="w-full h-full border-0" title="Estimate Preview" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
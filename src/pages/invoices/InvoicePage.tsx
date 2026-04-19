import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Filter, 
  X, 
  MoreHorizontal, 
  Eye, 
  FileDown, 
  Truck, 
  Mail, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService";
import type { Invoice, PageResponse, Client } from "@/types";

import { EwayBillDialog } from "@/features/invoices/EwayBillDialog";
import { InvoiceEmailDialog } from "@/features/invoices/InvoiceEmailDialog";

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function InvoiceRowSkeleton() {
  return (
    <TableRow className="pointer-events-none">
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-3.5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
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

export default function InvoicePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PageResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [filterClient, setFilterClient] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const [ewayDialog, setEwayDialog] = useState<{ open: boolean; invId: string; currentNo: string }>({
    open: false, invId: "", currentNo: "",
  });

  const [emailDialogData, setEmailDialogData] = useState<{ id: string; no: string; email: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    clientService.getAll().then((res: any) => {
      if (Array.isArray(res)) setClients(res);
      else if (res?.content) setClients(res.content);
    }).catch(console.error);
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { page: 0, size: 20, sort: `issuedAt,${sortOrder}` };
      if (filterClient !== "ALL") params.clientId = filterClient;
      if (filterStatus !== "ALL") params.status = filterStatus;
      const res = await invoiceService.search(params);
      setData(res);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, [filterClient, filterStatus, sortOrder]);

  const initiateDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await invoiceService.delete(deleteId);
      toast.success("Invoice deleted");
      loadInvoices();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreate = () => navigate("/invoices/new");
  const handleEdit = (inv: Invoice) => navigate(`/invoices/${inv.id}/edit`);

  /**
   * ✅ MODIFIED: Opens PDF in a new tab instead of a modal
   */
  const handleViewPdf = async (invoice: Invoice) => {
    try {
      toast.info("Generating preview...",{ duration: 1000 });
      const blob = await invoiceService.downloadPdf(invoice.id);
      
      // Create a blob URL
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      const newTab = window.open(url, "_blank");
      
      
      // Safety check for popup blockers
      if (!newTab) {
        
        toast.error("Popup blocked! Please allow popups to view the PDF.");
      }
    } catch {
      toast.error("Failed to load PDF preview");
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      toast.info("Downloading PDF...");
      const blob = await invoiceService.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  const handleSendEmail = (inv: Invoice) => {
    const client = clients.find(c => c.id === inv.clientId);
    setEmailDialogData({ id: inv.id, no: inv.invoiceNo, email: client?.email || "" });
  };

  const handleDownloadEway = async (invoice: Invoice) => {
    try {
      toast.info("Generating E-Way JSON...");
      const blob = await invoiceService.downloadEwayJson(invoice.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ewaybill_${invoice.invoiceNo}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("JSON downloaded!");
    } catch {
      toast.error("Failed to generate JSON. Check Pincodes.");
    }
  };

  const openEwayDialog = (inv: Invoice) =>
    setEwayDialog({ open: true, invId: inv.id, currentNo: inv.ewayBillNo || "" });

  const resetFilters = () => {
    setFilterClient("ALL");
    setFilterStatus("ALL");
    setSortOrder("desc");
  };

  const getStatusStyle = (status: string | undefined) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PAID":    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case "PENDING":
      case "UNPAID":
      case "OVERDUE": return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
      default:        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your client invoices.</p>
        </div>
        <Button onClick={handleCreate} className="font-bold tracking-tight">
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
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
        {(filterClient !== "ALL" || filterStatus !== "ALL") && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50">
            <X className="mr-1 h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Invoice #</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Client</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400">Total</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <InvoiceRowSkeleton key={i} />)
            ) : !data?.content || data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((inv) => {
                const clientName = clients.find(c => c.id === inv.clientId)?.name || "Unknown Client";
                return (
                  <TableRow
                    key={inv.id}
                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => handleViewPdf(inv)}
                  >
                    <TableCell className="font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded border border-primary/10 group-hover:scale-110 transition-transform">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {inv.invoiceNo}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{clientName}</TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {inv.issuedAt ? format(new Date(inv.issuedAt), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-5 px-2 capitalize border font-bold tracking-tight",
                          getStatusStyle(inv.status)
                        )}
                      >
                        {inv.status ? inv.status.toLowerCase() : "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900">
                      ₹{inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewPdf(inv)}>
                            <Eye className="mr-2 h-4 w-4" /> View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(inv)}>
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadEway(inv)}>
                            <Truck className="mr-2 h-4 w-4" /> E-Way JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEwayDialog(inv)}>
                            <Truck className="mr-2 h-4 w-4" />
                            {inv.ewayBillNo ? "Update E-Way" : "Add E-Way"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSendEmail(inv)}>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(inv)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => initiateDelete(inv.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <EwayBillDialog
        open={ewayDialog.open}
        onOpenChange={(val) => setEwayDialog(prev => ({ ...prev, open: val }))}
        invoiceId={ewayDialog.invId}
        currentEwayNo={ewayDialog.currentNo}
        onSuccess={loadInvoices}
      />

      {emailDialogData && (
        <InvoiceEmailDialog
          open={!!emailDialogData}
          onOpenChange={(open) => !open && setEmailDialogData(null)}
          invoiceId={emailDialogData.id}
          invoiceNo={emailDialogData.no}
          clientEmail={emailDialogData.email}
        />
      )}

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-red-50 rounded-full mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold">Terminate Invoice?</DialogTitle>
            <DialogDescription>
              This action will permanently remove the invoice record. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 font-bold" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
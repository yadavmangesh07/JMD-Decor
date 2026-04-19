import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, AlertTriangle, Truck, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { challanService, type Challan } from "@/services/challanService";

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function ChallanRowSkeleton() {
  return (
    <TableRow className="pointer-events-none">
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-36" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ChallanListPage() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadChallans(); }, []);

  const loadChallans = async () => {
    setLoading(true);
    try {
      const data = await challanService.getAll();
      setChallans(data);
    } catch {
      toast.error("Failed to load challans");
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await challanService.delete(deleteId);
      toast.success("Challan deleted");
      loadChallans();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/challans/${id}/edit`);
  };

  const handleDownload = async (e: React.MouseEvent, id: string, challanNo: string) => {
    e.stopPropagation();
    try {
      toast.info("Downloading PDF...");
      const blob = await challanService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Challan_${challanNo.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  /**
   * ✅ MODIFIED: Opens PDF in a new tab
   */
  const handlePreview = async (id: string) => {
    try {
      toast.info("Generating preview...", { duration: 1000 });
      const blob = await challanService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank");
      
      if (!newTab) {
        toast.error("Popup blocked! Please allow popups to view the PDF.");
      }
    } catch {
      toast.error("Failed to load preview");
    }
  };

  const filteredChallans = challans.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.challanNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Challans</h1>
          <p className="text-muted-foreground">Manage your delivery notes and tracking.</p>
        </div>
        <Link to="/challans/new">
          <Button className="font-bold tracking-tight">
            <Plus className="mr-2 h-4 w-4" /> Create Challan
          </Button>
        </Link>
      </div>

      {/* ── Table Card ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Challans</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Client or Challan No..."
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
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Challan No</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Client</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Order No</TableHead>
                <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400 w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <ChallanRowSkeleton key={i} />)
              ) : filteredChallans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No challans found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredChallans.map((challan) => (
                  <TableRow
                    key={challan.id}
                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => handlePreview(challan.id!)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex font-bold items-center gap-2 text-slate-900">
                        <div className="p-1.5 bg-blue-50 rounded border border-blue-100 group-hover:scale-110 transition-transform">
                          <Truck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        </div>
                        {challan.challanNo}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {challan.challanDate ? format(new Date(challan.challanDate), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{challan.clientName}</TableCell>
                    <TableCell className="font-medium text-slate-500">{challan.orderNo}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handlePreview(challan.id!)}>
                            <FileText className="mr-2 h-4 w-4" /> View Challan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownload(e, challan.id!, challan.challanNo)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleEdit(e, challan.id!)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => initiateDelete(e, challan.id!)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Challan
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

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-red-50 rounded-full mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold">Terminate Challan?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this delivery note? This cannot be undone.
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
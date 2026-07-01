import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, MoreVertical, Edit, Trash2, Loader2, Download,  ReceiptIndianRupee 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { creditNoteService } from "@/services/creditNoteService";
import apiClient from "@/lib/axios";

export default function CreditNoteListPage() {
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadCreditNotes = async () => {
    setLoading(true);
    try {
      const data = await creditNoteService.getAll();
      setCreditNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch credit note records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreditNotes();
  }, []);

  const handleDownloadPdf = async (id: string, cnNo: string) => {
    setActionId(id);
    try {
      await creditNoteService.downloadPdf(id, cnNo);
      toast.success("PDF generated successfully");
    } catch (error) {
      toast.error("Failed to download PDF document");
    } finally {
      setActionId(null);
    }
  };

  const handlePreviewPdf = async (id: string) => {
    setActionId(id);
    try {
      const response = await apiClient.get(`/credit-notes/${id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to open browser preview");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Credit Note?")) return;
    try {
      await creditNoteService.delete(id);
      toast.success("Credit Note deleted successfully");
      loadCreditNotes();
    } catch (error) {
      toast.error("Failed to remove record");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground text-sm">
            Manage returns, financial corrections, and client credit balances
          </p>
        </div>
        <Button onClick={() => navigate("/finance/credit-notes/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Credit Note
        </Button>
      </div>

      {/* Ledger Records Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <ReceiptIndianRupee className="h-5 w-5 text-muted-foreground" />
            Issued Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : creditNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No historical Credit Notes found. Click "Issue Credit Note" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Credit Note No</TableHead>
                  <TableHead>Ref Invoice No</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="w-[70px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditNotes.map((cn) => (
                  <TableRow 
                    key={cn.id}
                    onClick={() => handlePreviewPdf(cn.id)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    title="Click row to preview document"
                  >
                    <TableCell className="font-semibold p-4">
                      <div className="flex items-center gap-3">
                        {/* 🟢 NEW: Swapped FileText icon to ReceiptIndianRupee badge for return workflow identification */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                          <ReceiptIndianRupee className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate max-w-[140px] text-gray-900">{cn.creditNoteNo}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground font-medium">{cn.billReferenceNo || "-"}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-gray-700 font-medium">{cn.clientName}</TableCell>
                    
                    <TableCell className="text-gray-600 font-medium">
                      {cn.creditNoteDate ? format(new Date(cn.creditNoteDate), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    
                    <TableCell className="text-gray-600 font-medium">₹{Number(cn.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-bold text-gray-900">
                      ₹{Number(cn.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    
                    <TableCell className="text-center p-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionId === cn.id}>
                            {actionId === cn.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleDownloadPdf(cn.id, cn.creditNoteNo)}>
                            <Download className="mr-2 h-4 w-4 text-emerald-500" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/finance/credit-notes/edit/${cn.id}`)}>
                            <Edit className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(cn.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, AlertTriangle, Eye, FileCheck } from "lucide-react";
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

import { wccService } from "@/services/wccService";
import { clientService } from "@/services/clientService";
import type { WCCData } from "@/types/wccTypes";
import { generateWCCPdf } from "@/services/wccPdfService";

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function WCCRowSkeleton() {
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

export default function WCCListPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<WCCData[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wccData, clientData] = await Promise.all([
        wccService.getAll(),
        clientService.getAll(),
      ]);
      setCertificates(wccData);
      if (Array.isArray(clientData)) setClients(clientData);
      else if ((clientData as any)?.content) setClients((clientData as any).content);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getFreshWCC = (wcc: WCCData): WCCData => {
    if (!wcc.clientId) return wcc;
    const client = clients.find(c => c.id === wcc.clientId);
    if (!client) return wcc;
    let fullAddress = client.address || "";
    if (client.state) fullAddress += `, ${client.state}`;
    if (client.pincode) fullAddress += ` - ${client.pincode}`;
    return {
      ...wcc,
      storeName: client.name,
      clientName: client.name,
      gstin: client.gstin || wcc.gstin,
      projectLocation: fullAddress.trim() ? fullAddress : wcc.projectLocation,
    };
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await wccService.delete(deleteId);
      toast.success("Certificate deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/wcc/${id}/edit`);
  };

  const handleDownload = (e: React.MouseEvent, doc: WCCData) => {
    e.stopPropagation();
    try {
      toast.info("Downloading PDF...");
      const freshDoc = getFreshWCC(doc);
      const blob = generateWCCPdf(freshDoc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `WCC_${(freshDoc.refNo || "WCC").replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    }
  };

  /**
   * ✅ MODIFIED: Opens WCC PDF in a new tab with 1s toast duration
   */
  const handlePreview = (doc: WCCData) => {
    try {
      toast.info("Generating preview...", { duration: 1000 });
      const freshDoc = getFreshWCC(doc);
      const blob = generateWCCPdf(freshDoc);
      const url = window.URL.createObjectURL(blob);
      
      const newTab = window.open(url, "_blank");
      if (!newTab) {
        toast.error("Popup blocked! Please allow popups to view the PDF.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load preview");
    }
  };

  const processedDocs = certificates.map(getFreshWCC);

  const filteredDocs = processedDocs.filter(doc =>
    (doc.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
    (doc.refNo || "").toLowerCase().includes(search.toLowerCase()) ||
    (doc.poNo || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Work Certificates</h1>
          <p className="text-muted-foreground">Manage work completion certificates (WCC).</p>
        </div>
        <Link to="/wcc/new">
          <Button className="font-bold tracking-tight">
            <Plus className="mr-2 h-4 w-4" /> Create Certificate
          </Button>
        </Link>
      </div>

      {/* ── Filters & Search ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Certificates</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Client, Ref No, or PO..."
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
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Ref No</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Store / Client</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400">PO No</TableHead>
                <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <WCCRowSkeleton key={i} />)
              ) : filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No certificates found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => handlePreview(doc)}
                  >
                    <TableCell className="font-medium align-middle">
                      <div className="flex font-bold items-center gap-2 text-slate-900">
                        <div className="p-1.5 bg-blue-50 rounded border border-blue-100 group-hover:scale-110 transition-transform">
                          <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        {doc.refNo}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-slate-500 font-medium">
                      {doc.certificateDate ? format(new Date(doc.certificateDate), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 align-middle">{doc.storeName}</TableCell>
                    <TableCell className="align-middle text-slate-500 font-medium">{doc.poNo}</TableCell>
                    <TableCell className="text-right align-middle" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handlePreview(doc)}>
                            <Eye className="mr-2 h-4 w-4" /> View Certificate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownload(e, doc)}>
                            <Download className="mr-2 h-4 w-4 text-blue-600" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => doc.id && handleEdit(e, doc.id)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => doc.id && initiateDelete(e, doc.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Certificate
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
            <DialogTitle className="text-xl font-bold">Terminate Certificate?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certificate record? This action cannot be undone.
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
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, AlertTriangle, Eye, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns"; 

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Services & Types
import { wccService } from "@/services/wccService"; 
import { clientService } from "@/services/clientService"; 
import type { WCCData } from "@/types/wccTypes"; 

// Import Frontend Generator
import { generateWCCPdf } from "@/services/wccPdfService"; 

export default function WCCListPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<WCCData[]>([]);
  const [clients, setClients] = useState<any[]>([]); 
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wccData, clientData] = await Promise.all([
          wccService.getAll(),
          clientService.getAll()
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
          projectLocation: fullAddress.trim() ? fullAddress : wcc.projectLocation
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
    } catch (error) {
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
      toast.info("Generating PDF...");
      const freshDoc = getFreshWCC(doc); 
      const blob = generateWCCPdf(freshDoc); 
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = (freshDoc.refNo || "WCC").replace(/[^a-zA-Z0-9-_]/g, "_");
      link.setAttribute("download", `WCC_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    }
  };

  const handlePreview = (doc: WCCData) => {
      try {
          toast.info("Loading Preview...");
          const freshDoc = getFreshWCC(doc);
          const blob = generateWCCPdf(freshDoc);
          const url = window.URL.createObjectURL(blob);
          setPreviewUrl(url);
          setPreviewOpen(true);
      } catch (error) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Certificates</h1>
          <p className="text-muted-foreground">Manage work completion certificates (WCC).</p>
        </div>
        <Link to="/wcc/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Create Certificate</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Certificates</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Client, Ref No, or PO..." 
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
                <TableHead>Ref No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Store / Client</TableHead>
                <TableHead>PO No</TableHead>
                {/* 👇 UPDATED: Added "Actions" Header */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading...</TableCell></TableRow>
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
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handlePreview(doc)}
                >
                  <TableCell className="font-medium align-middle"> {/* Added align-middle */}
                    <div className="flex font-bold items-center gap-2">
                         <FileCheck className="h-4 w-4 text-blue-600" />
                         {doc.refNo}
                    </div>
                  </TableCell>
                  
                  <TableCell className="align-middle">
                    {doc.certificateDate ? format(new Date(doc.certificateDate), "dd MMM yyyy") : "-"}
                  </TableCell>
                  
                  <TableCell className="font-medium text-gray-900 align-middle">
                      {doc.storeName}
                  </TableCell>
                  
                  <TableCell className="align-middle">{doc.poNo}</TableCell>
                  
                  <TableCell className="text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        
                        <DropdownMenuItem onClick={(_e) => handlePreview(doc)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={(e) => handleDownload(e, doc)}>
                          <Download className="mr-2 h-4 w-4 text-blue-600" /> Download PDF
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={(e) => doc.id && handleEdit(e, doc.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={(e) => doc.id && initiateDelete(e, doc.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-4">
          <DialogHeader className="mb-2">
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 rounded-md overflow-hidden border">
             {previewUrl ? (
                 <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
             ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">Loading Preview...</div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" /> Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this certificate? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete Certificate</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
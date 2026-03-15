import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Download, AlertTriangle, Truck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

import { challanService, type Challan } from "@/services/challanService";

export default function ChallanListPage() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [search, setSearch] = useState("");
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadChallans();
  }, []);

  const loadChallans = async () => {
    try {
      const data = await challanService.getAll();
      setChallans(data);
    } catch (error) {
      toast.error("Failed to load challans");
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
    } catch (error) {
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
      const blob = await challanService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = challanNo.replace(/[^a-zA-Z0-9-_]/g, "_");
      link.setAttribute("download", `Challan_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handlePreview = async (id: string) => {
      try {
          const blob = await challanService.downloadPdf(id);
          const url = window.URL.createObjectURL(blob);
          setPreviewUrl(url);
          setPreviewOpen(true);
      } catch (error) {
          toast.error("Failed to load preview");
      }
  };

  const filteredChallans = challans.filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.challanNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Challans</h1>
          <p className="text-muted-foreground">Manage your delivery notes and tracking.</p>
        </div>
        <Link to="/challans/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Create Challan</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Challans</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Client or Challan No..." 
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
                <TableHead>Challan No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No challans found.
                  </TableCell>
                </TableRow>
              )}
              {filteredChallans.map((challan) => (
                <TableRow 
                    key={challan.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handlePreview(challan.id!)}
                >
                  {/* 👇 Icon and No-Wrap styling added here */}
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex font-bold  items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                      {challan.challanNo}
                    </div>
                  </TableCell>
                  <TableCell>{challan.challanDate ? format(new Date(challan.challanDate), "dd MMM yyyy") : "-"}</TableCell>
                  <TableCell>{challan.clientName}</TableCell>
                  <TableCell>{challan.orderNo}</TableCell>
                  
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        
                        <DropdownMenuItem onClick={(e) => handleDownload(e, challan.id!, challan.challanNo)}>
                          <Download className="mr-2 h-4 w-4 text-blue-600" /> Download PDF
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={(e) => handleEdit(e, challan.id!)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={(e) => initiateDelete(e, challan.id!)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-4">
          <DialogHeader className="mb-2">
            <DialogTitle>Challan Preview</DialogTitle>
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
                    Are you sure you want to delete this challan? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete Challan</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
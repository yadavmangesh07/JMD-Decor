import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom"; 
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { clientService } from "@/services/clientService";
import { estimateService } from "@/services/estimateService";
import type { Estimate } from "@/types"; 

export default function EstimateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const { register, control, handleSubmit, setValue, watch, reset } = useForm<Estimate>({
    defaultValues: {
      estimateNo: "", // 🟢 Now used for manual input
      estimateDate: new Date().toISOString(),
      status: "DRAFT",
      items: [{ description: "", hsnCode: "", qty: 1, rate: 0, taxRate: 18, unit: "NOS" }],
      subTotal: 0,
      taxAmount: 0,
      total: 0
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: []
  });

  // 1. Load Clients & Estimate Data
  useEffect(() => {
    const init = async () => {
        setLoading(true);
        try {
            const clientRes: any = await clientService.getAll();
            let loadedClients: any[] = [];
            if (Array.isArray(clientRes)) loadedClients = clientRes;
            else if (clientRes?.content) loadedClients = clientRes.content;
            setClients(loadedClients);

            if(isEditMode) {
                const est = await estimateService.getById(id!);
                reset({
                    ...est,
                    items: est.items || [] 
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
            navigate("/estimates");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [id, isEditMode, navigate, reset]);

  // 2. Auto-Calculate Totals
  useEffect(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) return;

    let sub = 0;
    let tax = 0;
    
    watchedItems.forEach((item) => {
        const qty = Number(item.qty) || 0;
        const rate = Number(item.rate) || 0;
        const taxRate = Number(item.taxRate) || 0;
        
        const lineTotal = qty * rate;
        sub += lineTotal;
        tax += lineTotal * (taxRate / 100);
    });

    setValue("subTotal", sub);
    setValue("taxAmount", tax);
    setValue("total", sub + tax);
    
  }, [watchedItems, setValue]); 

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setValue("clientId", clientId);
      setValue("clientName", client.name);
      
      let addr = client.address || "";
      if(client.state) addr += `, ${client.state}`;
      if(client.pincode) addr += ` - ${client.pincode}`;
      setValue("billingAddress", addr);
    }
  };

  const onSubmit = async (data: Estimate) => {
    setLoading(true);
    try {
      const payload = {
          ...data,
          estimateDate: new Date(data.estimateDate).toISOString()
      };

      if (isEditMode) {
        await estimateService.update(id!, payload);
        toast.success("Estimate updated!");
      } else {
        await estimateService.create(payload);
        toast.success("Estimate created!");
      }
      navigate("/estimates");
    } catch (error: any) {
      console.error(error);
      // 🟢 Improved error feedback for manual number collisions
      const msg = error.response?.data?.message || "Failed to save estimate";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" onClick={() => navigate("/estimates")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Estimate" : "New Estimate"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update quotation details" : "Create a new quotation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
            <CardHeader><CardTitle>Estimate Details</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select onValueChange={handleClientSelect} value={watch("clientId") || ""}>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estimate Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !watch("estimateDate") && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("estimateDate") ? format(new Date(watch("estimateDate")), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={new Date(watch("estimateDate"))} onSelect={(d) => d && setValue("estimateDate", d.toISOString())} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 🟢 MODIFIED: Estimate No is now EDITABLE */}
                <div className="space-y-2">
                   <Label>Estimate No</Label>
                   <Input 
                     {...register("estimateNo", { required: true })} 
                     placeholder="e.g. JMD/25-26/001" 
                     disabled={false} // 👈 Enabled for manual entry
                   />
                   <p className="text-xs text-muted-foreground">
                     Enter a unique estimate number.
                   </p>
                </div>

                <div className="space-y-2">
                   <Label>Status</Label>
                   <Select onValueChange={(v: any) => setValue("status", v)} value={watch("status") || "DRAFT"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="DRAFT">Draft</SelectItem>
                         <SelectItem value="SENT">Sent</SelectItem>
                         <SelectItem value="APPROVED">Approved</SelectItem>
                         <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="col-span-2 space-y-2">
                    <Label>Subject / Project Name</Label>
                    <Input {...register("subject")} placeholder="e.g. Signage Work for Nykaa Luxe..." />
                </div>
                
                <div className="col-span-2 space-y-2">
                    <Label>Client Address</Label>
                    <Textarea {...register("billingAddress")} rows={2} />
                </div>
            </CardContent>
        </Card>

        {/* ITEMS SECTION */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", hsnCode: "", qty: 1, rate: 0, taxRate: 18, unit: "NOS" })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                 {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-start border-b pb-4 last:border-0">
                        <div className="col-span-4 space-y-1">
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <Input {...register(`items.${index}.description` as const, { required: true })} />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">HSN</Label>
                            <Input {...register(`items.${index}.hsnCode` as const)} />
                        </div>
                        <div className="col-span-1 space-y-1">
                             <Label className="text-xs text-muted-foreground">Unit</Label>
                             <Input {...register(`items.${index}.unit` as const)} />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Qty</Label>
                            <Input type="number" {...register(`items.${index}.qty` as const, { valueAsNumber: true })} />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Rate</Label>
                            <Input type="number" {...register(`items.${index}.rate` as const, { valueAsNumber: true })} />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">GST%</Label>
                            <Input type="number" {...register(`items.${index}.taxRate` as const, { valueAsNumber: true })} />
                        </div>
                        <div className="col-span-1 flex items-end justify-center pt-6">
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                 ))}
            </CardContent>
        </Card>

        {/* SUMMARY SECTION */}
        <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea 
                    {...register("notes")} 
                    placeholder="Enter terms..." 
                    className="min-h-[150px]"
                  />
             </div>
             
             <div className="w-full md:w-1/3 bg-muted/30 p-6 rounded-lg space-y-3 h-fit">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{(watch("subTotal") || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax Amount</span>
                      <span>₹{(watch("taxAmount") || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{(watch("total") || 0).toFixed(2)}</span>
                  </div>
             </div>
        </div>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/estimates")}>
                Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[150px]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Estimate" : "Create Estimate"}
            </Button>
        </div>

      </form>
    </div>
  );
}
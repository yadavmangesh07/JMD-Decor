import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom"; 
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Truck, ArrowLeft, Loader2, FileText, CalendarIcon } from "lucide-react"; 
import { format } from "date-fns";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { creditNoteService } from "@/services/creditNoteService";
import { clientService } from "@/services/clientService";
import type { Client } from "@/types";

// 1. Updated Zod Schema Validation Mapping
const creditNoteSchema = z.object({
  creditNoteNo: z.string().min(1, "Credit Note Number is required"),
  clientId: z.string().min(1, "Client is required"),
  clientGst: z.string().optional().or(z.literal("")),
  clientState: z.string().optional().or(z.literal("")),     // 🟢 FIXED: Added to schema validation rules
  clientStateCode: z.string().optional().or(z.literal("")), // 🟢 FIXED: Added to schema validation rules
  status: z.string(),
  creditNoteDate: z.string(),
  billReferenceNo: z.string().min(1, "Original Invoice Reference Number is required"),
  billReferenceDate: z.string().optional().or(z.literal("")),
  billingAddress: z.string().optional().or(z.literal("")),
  shippingAddress: z.string().optional().or(z.literal("")),
  transportMode: z.string().optional().or(z.literal("")),
  ewayBillNo: z.string().optional().or(z.literal("")),
  scnNo: z.string().optional().or(z.literal("")),
  poNumber: z.string().optional().or(z.literal("")),
  poDate: z.string().optional().or(z.literal("")),
  items: z.array(z.object({
    description: z.string().min(1, "Required"),
    hsn: z.string().optional().or(z.literal("")),
    uom: z.string().optional().or(z.literal("")),
    taxPercent: z.coerce.number().min(0),
    qty: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
  })).min(1, "Add at least one item"),
});

export default function CreditNoteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // 2. Initialized Fields inside the Form Engine Configuration Context
  const form = useForm({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: {
      creditNoteNo: "",
      clientId: "", 
      clientGst: "",
      clientState: "Maharashtra",     // 🟢 FIXED: Type-inferred field key baseline initialized
      clientStateCode: "27",          // 🟢 FIXED: Type-inferred field key baseline initialized
      status: "DRAFT", 
      creditNoteDate: new Date().toISOString(),
      billReferenceNo: "", billReferenceDate: new Date().toISOString(), billingAddress: "", shippingAddress: "",
      transportMode: "Road", ewayBillNo: "", scnNo: "", poNumber: "", poDate: new Date().toISOString(),
      items: [{ description: "", hsn: "", uom: "SQFT", taxPercent: 18, qty: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = useWatch({ control: form.control, name: "items" });

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        try {
            const clientRes: any = await clientService.getAll();
            setClients(Array.isArray(clientRes) ? clientRes : clientRes.content || []);

            if (isEditMode) {
                const cnData = await creditNoteService.getById(id!);
                form.reset({
                  creditNoteNo: cnData.creditNoteNo || "",
                  clientId: cnData.clientId,
                  clientGst: cnData.clientGst || "",
                  clientState: cnData.clientState || "Maharashtra",         // 🟢 Reset data on load
                  clientStateCode: cnData.clientStateCode || "27",          // 🟢 Reset data on load
                  status: cnData.status || "DRAFT",
                  creditNoteDate: cnData.creditNoteDate ? new Date(cnData.creditNoteDate).toISOString() : new Date().toISOString(),
                  billReferenceNo: cnData.billReferenceNo || "",
                  billReferenceDate: cnData.billReferenceDate ? new Date(cnData.billReferenceDate).toISOString() : new Date().toISOString(),
                  billingAddress: cnData.billingAddress || "",
                  shippingAddress: cnData.shippingAddress || "",
                  transportMode: cnData.transportMode || "Road",
                  ewayBillNo: cnData.ewayBillNo || "",
                  scnNo: cnData.scnNo || "",
                  poNumber: cnData.poNumber || "",
                  poDate: cnData.poDate ? new Date(cnData.poDate).toISOString() : new Date().toISOString(),
                  items: cnData.items.map((i: any) => ({
                    description: i.description,
                    hsn: i.hsn || "",
                    uom: i.uom || "SQFT",
                    taxPercent: i.taxPercent !== undefined ? i.taxPercent : 18,
                    qty: i.qty,
                    rate: i.rate
                  })),
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load initial layout parameters");
            navigate("/finance/credit-notes");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [id, isEditMode, navigate, form]);

  // 3. Clean mapping without type issues
  const handleClientChange = (clientId: string) => {
    form.setValue("clientId", clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      form.setValue("billingAddress", client.address || "");
      form.setValue("shippingAddress", client.shippingAddress || client.address || ""); 
      form.setValue("clientGst", client.gstin || "");
      form.setValue("clientState", client.state || "Maharashtra");          // 🟢 Type checked perfectly
      form.setValue("clientStateCode", client.stateCode || "27");          // 🟢 Type checked perfectly
    }
  };

  // --- Real-Time Totals Engine ---
  let calculatedSubtotal = 0;
  let calculatedTotalTax = 0;

  if (watchedItems) {
    watchedItems.forEach((item: any) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const taxPercent = Number(item.taxPercent) || 0;
      
      const lineAmount = qty * rate;
      const lineTax = (lineAmount * taxPercent) / 100;
      
      calculatedSubtotal += lineAmount;
      calculatedTotalTax += lineTax;
    });
  }
  const calculatedGrandTotal = calculatedSubtotal + calculatedTotalTax;

  const onSubmit = async (values: z.infer<typeof creditNoteSchema>) => {
    setLoading(true);
    
    const itemsWithAmount = values.items.map((item) => ({
      ...item,
      amount: item.qty * item.rate,
      taxPercent: item.taxPercent
    }));

    const payload = {
        ...values,
        items: itemsWithAmount,
        subtotal: calculatedSubtotal,
        cgstRate: 9,
        cgstAmount: calculatedTotalTax / 2,
        sgstRate: 9,
        sgstAmount: calculatedTotalTax / 2,
        totalAmount: calculatedGrandTotal,
        creditNoteDate: new Date(values.creditNoteDate).toISOString(),
        billReferenceDate: values.billReferenceDate ? new Date(values.billReferenceDate).toISOString() : undefined,
        poDate: values.poDate ? new Date(values.poDate).toISOString() : undefined,
    };

    try {
      if (isEditMode) {
        await creditNoteService.update(id!, payload);
        toast.success("Credit Note updated successfully");
      } else {
        await creditNoteService.create(payload);
        toast.success("Credit Note initialized successfully");
      }
      navigate("/finance/credit-notes");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save credit note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
        {/* Header Block */}
        <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => navigate("/finance/credit-notes")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {isEditMode ? "Edit Credit Note" : "New Credit Note"}
                </h1>
                <p className="text-muted-foreground">Log transaction deductions, return notes, and reversals</p>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Card 1: Basic Details */}
            <Card>
                <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField control={form.control} name="creditNoteNo" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Credit Note Number</FormLabel>
                            <FormControl><Input placeholder="e.g. JMD/25-26/CN01" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="clientId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Profile</FormLabel>
                            <Select onValueChange={handleClientChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger></FormControl>
                            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="creditNoteDate" render={({ field }) => (
                        <FormItem className="flex flex-col pt-[6px]">
                            <FormLabel className="mb-[6px]">Credit Note Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick Date</span>}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => d && field.onChange(d.toISOString())} />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="COMPLETED">Issued / Adjusted</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            {/* Card 2: Logistics & Addresses */}
            <Card>
                <CardHeader><CardTitle>Address & Logistics References</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="billingAddress" render={({ field }) => (
                            <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                            <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="clientGst" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client GSTIN (Override)</FormLabel>
                                <FormControl><Input placeholder="Client GST for this document" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <Separator />
                    <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground"><Truck className="h-4 w-4"/> Transport & Order Details</div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="transportMode" render={({ field }) => <FormItem><FormLabel>Mode of Transport</FormLabel><FormControl><Input placeholder="Road" {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="ewayBillNo" render={({ field }) => <FormItem><FormLabel>E-Way Bill No</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="poNumber" render={({ field }) => <FormItem><FormLabel>PO No</FormLabel><FormControl><Input placeholder="PO..." {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="poDate" render={({ field }) => (
                            <FormItem className="flex flex-col pt-[6px]">
                                <FormLabel className="mb-[6px]">PO Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick Date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => d && field.onChange(d.toISOString())} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <Separator />
                    <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground"><FileText className="h-4 w-4"/> Mandatory Compliance Link References</div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="billReferenceNo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Invoice Reference No *</FormLabel>
                            <FormControl><Input placeholder="e.g. JMD/24-25/013" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="billReferenceDate" render={({ field }) => (
                            <FormItem className="flex flex-col pt-[6px]">
                                <FormLabel className="mb-[6px]">Original Invoice Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick Date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => d && field.onChange(d.toISOString())} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="scnNo" render={({ field }) => <FormItem><FormLabel>SCN No (Tax Override Reference)</FormLabel><FormControl><Input placeholder="SCN tracking..." {...field} /></FormControl></FormItem>} />
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Line Items Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", hsn: "", uom: "SQFT", taxPercent: 18, qty: 1, rate: 0 })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="p-3 w-[25%]">Description</th>
                                    <th className="p-3 w-[10%]">HSN</th>
                                    <th className="p-3 w-[8%]">UOM</th>
                                    <th className="p-3 w-[8%]">Qty</th>
                                    <th className="p-3 w-[12%]">Rate</th>
                                    <th className="p-3 w-[8%]">Tax %</th>
                                    <th className="p-3 w-[12%]">Amount</th>
                                    <th className="p-3 w-[5%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                            {fields.map((field, index) => {
                                const currentItem = watchedItems?.[index] || {};
                                const qty = Number(currentItem.qty) || 0;
                                const rate = Number(currentItem.rate) || 0;
                                const amount = qty * rate;

                                return (
                                    <tr key={field.id} className="hover:bg-slate-50">
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                                                <Input {...field} value={field.value as string} placeholder="Item Name" />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.hsn`} render={({ field }) => (
                                                <Input {...field} value={field.value as string} placeholder="HSN" />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.uom`} render={({ field }) => (
                                                <Input {...field} value={field.value as string} placeholder="SQFT" />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.qty`} render={({ field }) => (
                                                <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => (
                                                <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.taxPercent`} render={({ field }) => (
                                                <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            )} />
                                        </td>
                                        <td className="p-3 align-top font-medium text-slate-900">₹{amount.toFixed(2)}</td>
                                        <td className="p-2 align-top">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-3 bg-slate-50 p-6 rounded-lg border">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">₹{calculatedSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">CGST (9%):</span>
                                <span className="font-medium">₹{(calculatedTotalTax / 2).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">SGST (9%):</span>
                                <span className="font-medium">₹{(calculatedTotalTax / 2).toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg pt-1 text-slate-900">
                                <span>Grand Total:</span>
                                <span>₹{calculatedGrandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Footer */}
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/finance/credit-notes")}>Cancel</Button>
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Credit Note" : "Create Credit Note"}
                </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
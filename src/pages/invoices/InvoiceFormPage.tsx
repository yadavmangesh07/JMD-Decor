import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom"; 
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Truck, ArrowLeft, Loader2 } from "lucide-react"; 
import { formatISO } from "date-fns";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService";
import type { Client } from "@/types";

const invoiceSchema = z.object({
  invoiceNo: z.string().min(1, "Invoice Number is required"), // 🟢 Added for manual entry
  clientId: z.string().min(1, "Client is required"),
  status: z.string(),
  issuedAt: z.string(),
  dueDate: z.string().optional().or(z.literal("")),
  billingAddress: z.string().optional().or(z.literal("")),
  shippingAddress: z.string().optional().or(z.literal("")),
  transportMode: z.string().optional().or(z.literal("")),
  ewayBillNo: z.string().optional().or(z.literal("")),
  challanNo: z.string().optional().or(z.literal("")),
  challanDate: z.string().optional().or(z.literal("")),
  poNumber: z.string().optional().or(z.literal("")),
  poDate: z.string().optional().or(z.literal("")),
  tax: z.coerce.number().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Required"),
    hsnCode: z.string().optional().or(z.literal("")),
    uom: z.string().optional().or(z.literal("")),
    taxRate: z.coerce.number().min(0),
    qty: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
  })).min(1, "Add at least one item"),
});

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNo: "", // 🟢 Added
      clientId: "", 
      status: "DRAFT", 
      issuedAt: formatISO(new Date(), { representation: 'date' }),
      dueDate: "", billingAddress: "", shippingAddress: "",
      transportMode: "", ewayBillNo: "", challanNo: "", challanDate: "", poNumber: "", poDate: "",
      tax: 0,
      items: [{ description: "", hsnCode: "", uom: "NOS", taxRate: 18, qty: 1, rate: 0 }],
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
                // @ts-ignore
                const invoice = await invoiceService.getById(id!);
                form.reset({
                  invoiceNo: invoice.invoiceNo || "", // 🟢 Resetting manual field
                  clientId: invoice.clientId,
                  status: invoice.status,
                  issuedAt: invoice.issuedAt ? invoice.issuedAt.split('T')[0] : "",
                  dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : "",
                  billingAddress: invoice.billingAddress || "",
                  shippingAddress: invoice.shippingAddress || "",
                  transportMode: invoice.transportMode || "",
                  ewayBillNo: invoice.ewayBillNo || "",
                  challanNo: invoice.challanNo || "",
                  challanDate: invoice.challanDate ? invoice.challanDate.split('T')[0] : "",
                  poNumber: invoice.poNumber || "",
                  poDate: invoice.poDate ? invoice.poDate.split('T')[0] : "",
                  items: invoice.items.map((i: any) => ({
                    description: i.description,
                    hsnCode: i.hsnCode || "",
                    uom: i.uom || "NOS",
                    taxRate: i.taxRate || 18,
                    qty: i.qty,
                    rate: i.rate
                  })),
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
            navigate("/invoices");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [id, isEditMode, navigate, form]);

  const handleClientChange = (clientId: string) => {
    form.setValue("clientId", clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      form.setValue("billingAddress", client.address || "");
      form.setValue("shippingAddress", client.shippingAddress || client.address || ""); 
    }
  };

  // --- Calculate Totals ---
  let calculatedSubtotal = 0;
  let calculatedTotalTax = 0;

  if (watchedItems) {
    watchedItems.forEach((item: any) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const taxRate = Number(item.taxRate) || 0;
      
      const lineAmount = qty * rate;
      const lineTax = (lineAmount * taxRate) / 100;
      
      calculatedSubtotal += lineAmount;
      calculatedTotalTax += lineTax;
    });
  }
  const calculatedGrandTotal = calculatedSubtotal + calculatedTotalTax;

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    setLoading(true);
    const itemsWithAmount = values.items.map((item) => ({
      ...item,
      amount: item.qty * item.rate, 
    }));

    const payload = {
        ...values,
        items: itemsWithAmount,
        issuedAt: new Date(values.issuedAt).toISOString(),
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        challanDate: values.challanDate ? new Date(values.challanDate).toISOString() : undefined,
        poDate: values.poDate ? new Date(values.poDate).toISOString() : undefined,
        tax: calculatedTotalTax,
    };

    try {
      if (isEditMode) {
        // @ts-ignore
        await invoiceService.update(id!, payload);
        toast.success("Invoice updated");
      } else {
        // @ts-ignore
        await invoiceService.create(payload);
        toast.success("Invoice created");
      }
      navigate("/invoices");
    } catch (error: any) {
      console.error(error);
      // 🟢 Catching specific backend error (e.g. duplicate invoice number)
      const errorMsg = error.response?.data?.message || "Failed to save invoice";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => navigate("/invoices")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {isEditMode ? "Edit Invoice" : "New Invoice"}
                </h1>
                <p className="text-muted-foreground">
                    {isEditMode ? "Update existing invoice details" : "Create a new invoice for client"}
                </p>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card>
                <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6"> {/* 🟢 Changed to grid-cols-4 */}
                    
                    {/* 🟢 NEW: Manual Invoice Number Field */}
                    <FormField control={form.control} name="invoiceNo" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. JMD/25-26/001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="clientId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select onValueChange={handleClientChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger></FormControl>
                            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="issuedAt" render={({ field }) => (
                        <FormItem><FormLabel>Invoice Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Address & Transport</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="billingAddress" render={({ field }) => (
                            <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                            <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                    </div>

                    <Separator />
                    
                    <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
                         <Truck className="h-4 w-4"/> Transport & Order Details
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="transportMode" render={({ field }) => <FormItem><FormLabel>Mode</FormLabel><FormControl><Input placeholder="Road" {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="ewayBillNo" render={({ field }) => <FormItem><FormLabel>E-Way Bill</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="poNumber" render={({ field }) => <FormItem><FormLabel>PO No</FormLabel><FormControl><Input placeholder="PO..." {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="poDate" render={({ field }) => <FormItem><FormLabel>PO Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="challanNo" render={({ field }) => <FormItem><FormLabel>Challan No</FormLabel><FormControl><Input placeholder="CH..." {...field} /></FormControl></FormItem>} />
                        <FormField control={form.control} name="challanDate" render={({ field }) => <FormItem><FormLabel>Challan Date</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", hsnCode: "", uom: "NOS", taxRate: 18, qty: 1, rate: 0 })}>
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
                                            <FormField control={form.control} name={`items.${index}.hsnCode`} render={({ field }) => (
                                                <Input {...field} value={field.value as string} placeholder="HSN" />
                                            )} />
                                        </td>
                                        <td className="p-2 align-top">
                                            <FormField control={form.control} name={`items.${index}.uom`} render={({ field }) => (
                                                <Input {...field} value={field.value as string} placeholder="NOS" />
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
                                            <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field }) => (
                                                <Input type="number" {...field} value={field.value as number} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            )} />
                                        </td>
                                        <td className="p-3 align-top font-medium">
                                            ₹{amount.toFixed(2)}
                                        </td>
                                        <td className="p-2 align-top">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
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
                                <span>₹{calculatedSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total GST:</span>
                                <span>₹{calculatedTotalTax.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg pt-1">
                                <span>Grand Total:</span>
                                <span>₹{calculatedGrandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/invoices")}>Cancel</Button>
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Invoice" : "Create Invoice"}
                </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
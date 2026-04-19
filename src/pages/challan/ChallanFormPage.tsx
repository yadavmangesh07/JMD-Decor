import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { challanService, type Challan } from "@/services/challanService";
import { clientService } from "@/services/clientService";
import { INDIAN_STATES } from "@/constants/constants";



export default function ChallanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const form = useForm<Challan>({
    defaultValues: {
      // 🟢 MANUAL CHANGE: Now initialized for user input
      challanNo: "", 
      challanDate: format(new Date(), "yyyy-MM-dd"),
      orderNo: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      clientName: "",
      clientAddress: "",
      clientGst: "",
      clientState: "Maharashtra",
      clientStateCode: "27",
      contactPerson: "",
      items: [{ description: "", size: "", hsn: "", qty: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    const init = async () => {
        try {
            const data: any = await clientService.getAll();
            if (Array.isArray(data)) setClients(data);
            else if (data?.content) setClients(data.content);
        } catch (e) { console.error("Failed loading clients"); }

        if (isEditMode) {
            try {
                const challan = await challanService.getById(id!);
                const formatted = {
                    ...challan,
                    challanDate: challan.challanDate ? format(new Date(challan.challanDate), "yyyy-MM-dd") : "",
                    orderDate: challan.orderDate ? format(new Date(challan.orderDate), "yyyy-MM-dd") : ""
                };
                form.reset(formatted);
            } catch (error) {
                toast.error("Failed to load challan details");
                navigate("/challans");
            }
        }
    };
    init();
  }, [id, isEditMode, navigate, form]);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const clientId = e.target.value;
      const client = clients.find(c => c.id === clientId);
      if (client) {
          form.setValue("clientName", client.name);
          form.setValue("clientAddress", client.address);
          form.setValue("clientGst", client.gstin);
          form.setValue("clientState", client.state || "Maharashtra");
          form.setValue("clientStateCode", client.stateCode || "27");
      }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedName = e.target.value;
      const found = INDIAN_STATES.find(s => s.name === selectedName);
      form.setValue("clientState", selectedName);
      if (found) {
          form.setValue("clientStateCode", found.code);
      }
  };

  const onSubmit = async (data: Challan) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        challanDate: new Date(data.challanDate).toISOString(),
        orderDate: new Date(data.orderDate).toISOString(),
      };
      
      if (isEditMode) {
          await challanService.update(id!, payload);
          toast.success("Challan updated successfully!");
      } else {
          await challanService.create(payload);
          toast.success("Challan created successfully!");
      }
      navigate("/challans");
    } catch (error: any) {
      console.error(error);
      // 🟢 MANUAL CHANGE: Display specific backend error message (e.g., duplicate number)
      const msg = error.response?.data?.message || error.response?.data || "Operation failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" type="button" onClick={() => navigate("/challans")}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Delivery Challan" : "New Delivery Challan"}
          </h1>
          <p className="text-muted-foreground">{isEditMode ? "Update existing" : "Create a new"} delivery note.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader><CardTitle>Challan Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* 🟢 MANUAL CHANGE: Field is now enabled for manual entry */}
               <FormField control={form.control} name="challanNo" render={({ field }) => (
                 <FormItem>
                    <FormLabel>Challan No</FormLabel>
                    <FormControl>
                        <Input 
                            {...field} 
                            placeholder="e.g. JMD/25-26/001"
                            disabled={false} // 👈 Enabled
                        />
                    </FormControl>
                    <FormMessage/>
                 </FormItem>
               )} />
               
               <FormField control={form.control} name="challanDate" render={({ field }) => (
                 <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
               )} />
               <FormField control={form.control} name="orderNo" render={({ field }) => (
                 <FormItem><FormLabel>Order No</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
               )} />
               <FormField control={form.control} name="orderDate" render={({ field }) => (
                 <FormItem><FormLabel>Order Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
               )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client / Consignee</CardTitle>
                <select className="h-9 w-[200px] rounded-md border px-3 text-sm" onChange={handleClientSelect} defaultValue="">
                    <option value="" disabled>Select Existing Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name || "Unnamed Client"}</option>)}
                </select>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="clientName" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="contactPerson" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Contact / Location</FormLabel><FormControl><Input placeholder="e.g. NYKAA LUXE AT BHUBANESHWAR" {...field} /></FormControl></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="clientAddress" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />

                  <FormField control={form.control} name="clientState" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                                onChange={(e) => {
                                    field.onChange(e); 
                                    handleStateChange(e);
                                }}
                            >
                                <option value="" disabled>Select State</option>
                                {INDIAN_STATES.map((state) => (
                                    <option key={state.code} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="clientStateCode" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State Code</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="clientGst" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>GSTIN</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                  )} />
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Size</div>
                        <div className="col-span-2">HSN</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-1"></div>
                    </div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                             <div className="col-span-5">
                                 <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                                     <FormItem><FormControl><Input {...field} placeholder="Item Name" /></FormControl></FormItem>
                                 )} />
                             </div>
                             <div className="col-span-2">
                                 <FormField control={form.control} name={`items.${index}.size`} render={({ field }) => (
                                     <FormItem><FormControl><Input {...field} placeholder="450MM" /></FormControl></FormItem>
                                 )} />
                             </div>
                             <div className="col-span-2">
                                 <FormField control={form.control} name={`items.${index}.hsn`} render={({ field }) => (
                                     <FormItem><FormControl><Input {...field} placeholder="9405" /></FormControl></FormItem>
                                 )} />
                             </div>
                             <div className="col-span-2">
                                 <FormField control={form.control} name={`items.${index}.qty`} render={({ field }) => (
                                     <FormItem><FormControl><Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl></FormItem>
                                 )} />
                             </div>
                             <div className="col-span-1 text-center">
                                 <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                     <Trash2 className="h-4 w-4" />
                                 </Button>
                             </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={() => append({ description: "", size: "", hsn: "", qty: 1 })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/challans")}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> {isEditMode ? "Update" : "Save"} & Generate</>}
              </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
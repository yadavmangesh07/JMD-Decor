import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ArrowLeft, Plus, Trash2, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { wccService } from "@/services/wccService";
import { clientService } from "@/services/clientService";
import type { WCCData } from "@/types/wccTypes";

export default function WCCFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  
  const [clients, setClients] = useState<any[]>([]);

  const { register, control, handleSubmit, reset, setValue, watch } = useForm<WCCData>({
    defaultValues: {
      refNo: "", // 🟢 Initialized for manual input
      certificateDate: format(new Date(), "dd-MM-yyyy"),
      items: [{ srNo: 1, activity: "", qty: "" }],
      companyName: "JMD DECOR",
      clientId: "" 
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        try {
            const clientData: any = await clientService.getAll();
            let loadedClients: any[] = [];
            
            if (Array.isArray(clientData)) loadedClients = clientData;
            else if (clientData?.content) loadedClients = clientData.content;
            
            setClients(loadedClients);

            if (isEditMode) {
                const data = await wccService.getById(id!);

                if (data.certificateDate) {
                    try {
                        data.certificateDate = format(new Date(data.certificateDate), "dd-MM-yyyy");
                    } catch (e) { console.error("Invalid Cert Date", e); }
                }
                if (data.poDate) {
                    try {
                         data.poDate = format(new Date(data.poDate), "dd-MM-yyyy");
                    } catch (e) { console.error("Invalid PO Date", e); }
                }

                if (data.clientId) {
                    const latestClient = loadedClients.find((c: any) => c.id === data.clientId);
                    if (latestClient) {
                        data.storeName = latestClient.name;
                        data.clientName = latestClient.name;
                        data.gstin = latestClient.gstin || "";

                        let fullAddress = latestClient.address || "";
                        if (latestClient.state) {
                            fullAddress += fullAddress ? `, ${latestClient.state}` : latestClient.state;
                        }
                        if (latestClient.pincode) {
                            fullAddress += fullAddress ? ` - ${latestClient.pincode}` : latestClient.pincode;
                        }

                        if (fullAddress.trim()) {
                            data.projectLocation = fullAddress;
                        }
                    }
                }

                if(!data.items || data.items.length === 0) {
                    data.items = [{ srNo: 1, activity: "", qty: "" }];
                }
                reset(data); 
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
            if (isEditMode) navigate("/wcc");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [id, isEditMode, navigate, reset]);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      const client = clients.find(c => c.id === selectedId);
      
      if (client) {
          setValue("clientId", client.id);
          setValue("storeName", client.name);
          setValue("clientName", client.name);
          
          let fullAddress = client.address || "";
          if (client.state) fullAddress += `, ${client.state}`;
          if (client.pincode) fullAddress += ` - ${client.pincode}`;
          
          setValue("projectLocation", fullAddress);
          setValue("gstin", client.gstin || "");
      }
  };

  const storeName = watch("storeName");
  useEffect(() => {
      if (!isEditMode && storeName) {
          setValue("clientName", storeName);
      }
  }, [storeName, isEditMode, setValue]);

  const onSubmit = async (data: WCCData) => {
    try {
      setLoading(true);
      
      const payload = {
          ...data,
          certificateDate: parse(data.certificateDate, "dd-MM-yyyy", new Date()).toISOString(),
          poDate: data.poDate ? parse(data.poDate, "dd-MM-yyyy", new Date()).toISOString() : undefined
      };

      if (isEditMode) {
        await wccService.update(id!, payload as any);
        toast.success("Certificate updated successfully");
      } else {
        await wccService.create(payload as any);
        toast.success("Certificate created successfully");
      }
      navigate("/wcc");
    } catch (error: any) {
      console.error(error);
      // 🟢 Improved error feedback for manual Ref No collisions
      const msg = error.response?.data?.message || "Failed to save certificate";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/wcc")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Certificate" : "New Work Certificate"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update existing certificate details" : "Create a new completion certificate"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            
            <div className="space-y-2 md:col-span-2">
                <Label>Select Client (Optional)</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={handleClientSelect}
                    value={watch("clientId") || ""} 
                >
                    <option value="" disabled>Select Existing Client to Auto-fill...</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <input type="hidden" {...register("clientId")} />

            <div className="space-y-2">
                <Label>Store Name (Client)</Label>
                <Input placeholder="e.g. DUA LIMA RETAIL..." {...register("storeName", { required: true })} />
            </div>

            {/* 🟢 MODIFIED: Ref No is now EDITABLE */}
            <div className="space-y-2">
                <Label>Ref No.</Label>
                <Input 
                    placeholder="e.g. JMD/WCC/2025-26/01" 
                    {...register("refNo", { required: true })} 
                    disabled={false} // 👈 Enabled
                />
                <p className="text-xs text-muted-foreground">
                    Enter a unique reference number.
                </p>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Project Location</Label>
                <Textarea placeholder="Shop Address..." {...register("projectLocation", { required: true })} />
            </div>

            <div className="space-y-2">
                <Label>Certificate Date</Label>
                <Controller
                  control={control}
                  name="certificateDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? field.value : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parse(field.value, "dd-MM-yyyy", new Date()) : undefined}
                          onSelect={(date) => {
                            if (date) field.onChange(format(date, "dd-MM-yyyy"));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
            </div>

            <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input placeholder="24AAICD..." {...register("gstin")} />
            </div>

            <div className="space-y-2">
                <Label>PO Number</Label>
                <Input placeholder="e.g. 22330" {...register("poNo")} />
            </div>

            <div className="space-y-2">
                <Label>PO Date</Label>
                <Controller
                  control={control}
                  name="poDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? field.value : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parse(field.value, "dd-MM-yyyy", new Date()) : undefined}
                          onSelect={(date) => {
                            if (date) field.onChange(format(date, "dd-MM-yyyy"));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
            </div>
            
            <input type="hidden" {...register("companyName")} />
            <input type="hidden" {...register("clientName")} />

          </CardContent>
        </Card>

        {/* ... (Work Items Card remains exactly the same as your code) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ srNo: fields.length + 1, activity: "", qty: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start">
                        <div className="w-[60px]">
                            <Input 
                                placeholder="Sr." 
                                {...register(`items.${index}.srNo`)} 
                                className="text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <Textarea 
                                placeholder="Activity Description..." 
                                {...register(`items.${index}.activity` as const, { required: true })} 
                                rows={2}
                            />
                        </div>
                        <div className="w-[100px]">
                            <Input 
                                placeholder="Qty" 
                                {...register(`items.${index}.qty`)} 
                            />
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/wcc")}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Certificate" : "Create Certificate"}
            </Button>
        </div>

      </form>
    </div>
  );
}
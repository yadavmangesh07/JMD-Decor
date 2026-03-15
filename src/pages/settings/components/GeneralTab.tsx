import type { UseFormReturn } from "react-hook-form";
import { 
  Save, Building2, Globe, Mail, Phone, MapPin, 
  Fingerprint, Landmark, LockKeyhole, Hash 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";

interface GeneralTabProps {
  form: UseFormReturn<any>; 
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function GeneralTab({ form, onSubmit, isAdmin, isLoading }: GeneralTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full border shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Configuration
              </CardTitle>
              <CardDescription className="font-medium text-slate-500">
                {isAdmin ? "Manage your official header details and compliance IDs." : "View company records (Read Only)."}
              </CardDescription>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                <LockKeyhole className="h-3 w-3 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-600 uppercase">Secure View</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* SECTION 1: IDENTITY & WEB */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" /> Core Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-xs font-bold text-slate-700">Company Legal Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="JMD Décor" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Official Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="www.jmddecor.com" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* SECTION 2: COMMUNICATIONS */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500" /> Contact Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Primary Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="contact@jmd.com" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="secondaryEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Secondary Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 opacity-60" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="accounts@jmd.com" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Primary Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="+91 98..." {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Secondary Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 opacity-60" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="+91 98..." {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-xs font-bold text-slate-700">Full Business Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="Unit No, Building, Street..." {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* SECTION 3: COMPLIANCE & LEGAL */}
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-6">
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-amber-500" /> Compliance Identifiers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="gstin" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">GSTIN</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-white border-slate-200 font-mono uppercase" placeholder="27ABC..." {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Pincode</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-white border-slate-200 font-mono" placeholder="400064" maxLength={6} {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="udyamRegNo" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Udyam Reg No</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input disabled={!isAdmin} className="pl-9 bg-white border-slate-200 font-mono" placeholder="MH-19-..." {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isLoading} className="min-w-[180px] shadow-lg shadow-primary/20 font-bold transition-all active:scale-95">
                    {isLoading ? "Validating..." : <><Save className="mr-2 h-4 w-4"/> Update Company Profile</>}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
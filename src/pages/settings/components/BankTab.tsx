import type { UseFormReturn } from "react-hook-form";
import {
  Save,
  Building2,
  Landmark,
  Fingerprint,
  CreditCard,
  Hash,
  LockKeyhole,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";

interface BankTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function BankTab({ form, onSubmit, isAdmin, isLoading }: BankTabProps) {
  // Watch fields for the "Live Preview" card
  const watchedValues = form.watch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- LEFT: DATA ENTRY (8 Columns) --- */}
        <Card className="lg:col-span-8 border shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  Settlement Account
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  Update the bank coordinates where you receive payments.
                </CardDescription>
              </div>
              {!isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
                  <LockKeyhole className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Read Only</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                  {/* Bank Name */}
                  <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Bank Entity</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                          <Input disabled={!isAdmin} className="pl-10 bg-slate-50/50" placeholder="e.g. HDFC Bank" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Branch */}
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Branch Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                          <Input disabled={!isAdmin} className="pl-10 bg-slate-50/50" placeholder="e.g. MG Road" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Account Name */}
                  <FormField control={form.control} name="accountName" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Beneficiary Name (Account Name)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                          <Input disabled={!isAdmin} className="pl-10 bg-slate-50/50 font-semibold" placeholder="JMD DECOR" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Account Number */}
                  <FormField control={form.control} name="accountNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Account Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                          <Input disabled={!isAdmin} className="pl-10 bg-slate-50/50 font-mono" placeholder="0000 0000 0000" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* IFSC Code */}
                  <FormField control={form.control} name="ifscCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">IFSC Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                          <Input disabled={!isAdmin} className="pl-10 bg-slate-50/50 font-mono uppercase" placeholder="HDFC0001234" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="min-w-[160px] font-bold shadow-lg shadow-primary/20">
                      {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Details</>}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* --- RIGHT: PREVIEW CARD (4 Columns) --- */}
        {/* --- RIGHT: PREVIEW CARD (Optimized for Visibility) --- */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-1">
            Payment Card Preview
          </span>

          <div className="relative group w-full">
            {/* The "Virtual Cheque" - Now with fixed aspect and better scaling */}
            <div className="w-full aspect-[1.6/1] min-h-[220px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">

              {/* Background Decor */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Landmark size={120} />
              </div>

              {/* Card Header */}
              <div className="flex justify-between items-start relative z-10">
                <div className="h-10 w-14 bg-amber-400/20 rounded-lg border border-amber-400/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="h-6 w-8 bg-gradient-to-r from-amber-400/40 to-amber-200/20 rounded-sm" />
                </div>
                <div className="flex flex-col items-end">
                  <CheckCircle2 className="text-emerald-400 h-6 w-6 mb-1" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Verified Account</span>
                </div>
              </div>

              {/* Card Body: Account Holder */}
              <div className="relative z-10">
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">Account Holder</p>
                <p className="font-bold text-lg tracking-wide truncate max-w-full">
                  {watchedValues.accountName || "JMD DECOR"}
                </p>
              </div>

              {/* Card Footer: Account & IFSC */}
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">Account Number</p>
                    <p className="font-mono text-sm sm:text-base tracking-[0.15em] font-medium">
                      {watchedValues.accountNumber ? watchedValues.accountNumber.replace(/\d(?=\d{4})/g, "•") : "•••• •••• ••••"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 pt-3 border-t border-white/10 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">IFSC Code</p>
                    <p className="font-mono text-xs font-bold tracking-widest text-slate-200">
                      {watchedValues.ifscCode || "IFSC0000000"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">Bank Name</p>
                    <p className="text-xs font-bold truncate text-slate-200">
                      {watchedValues.bankName || "BANK NAME"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Hint */}
            <div className="mt-6 p-4 bg-slate-100/50 rounded-xl border border-slate-200 flex gap-3 items-start">
              <LockKeyhole className="h-4 w-4 text-slate-400 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Data encrypted. These details will be printed on the bottom-right corner of your invoices.
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
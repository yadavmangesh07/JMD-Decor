import type { UseFormReturn } from "react-hook-form";
import { Save, Image as ImageIcon, CheckCircle2, LockKeyhole, PenTool } from "lucide-react";
import { motion } from "framer-motion"; // 👈 For that smooth entrance
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form";

interface BrandingTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export function BrandingTab({ form, onSubmit, isAdmin, isLoading }: BrandingTabProps) {
  const logoValue = form.watch("logoUrl");
  const signatureValue = form.watch("signatureUrl");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full border shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Visual Identity
              </CardTitle>
              <CardDescription className="font-medium text-slate-500">
                Configure how JMD Decor appears on official invoices and reports.
              </CardDescription>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                <LockKeyhole className="h-3 w-3 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">View Only</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              
              {/* --- LOGO SECTION --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 space-y-6 border-r border-slate-100">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Company Logo
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This logo will appear at the top-left of all generated PDFs. 
                      Use a transparent PNG for the best results.
                    </p>
                  </div>

                  <FormField control={form.control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400">Public Asset URL</FormLabel>
                      <FormControl>
                        <Input 
                          disabled={!isAdmin} 
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono text-xs"
                          placeholder="/assets/logo.png" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span className="text-[11px] text-blue-700 font-medium">Recommended: 400x120px (3:1 Aspect)</span>
                  </div>
                </div>

                <div className="bg-slate-50/30 p-8 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Header Preview</span>
                  <div className="w-full max-w-[320px] bg-white shadow-xl rounded-xl p-8 border border-slate-200 flex items-center justify-center min-h-[160px] relative overflow-hidden group">
                    <div className="absolute inset-0 border-2 border-dashed border-slate-100 m-2 rounded-lg group-hover:border-primary/20 transition-colors" />
                    {logoValue ? (
                      <motion.img 
                        key={logoValue}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={logoValue} 
                        className="h-16 w-auto object-contain relative z-10" 
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      /> 
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300 relative z-10">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Asset Detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* --- SIGNATURE SECTION --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 space-y-6 border-r border-slate-100">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Digital Signature
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Authorized signature displayed at the footer of invoices. 
                      Ensure the background is removed for a professional look.
                    </p>
                  </div>

                  <FormField control={form.control} name="signatureUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-slate-400">Signature Path</FormLabel>
                      <FormControl>
                        <Input 
                          disabled={!isAdmin} 
                          className="bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono text-xs"
                          placeholder="/assets/sig-rahul.png" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  <div className="flex items-center gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <PenTool className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] text-emerald-700 font-medium">Recommended: Dark ink on transparent bg</span>
                  </div>
                </div>

                <div className="bg-slate-50/30 p-8 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Footer Preview</span>
                  <div className="w-full max-w-[320px] bg-white shadow-xl rounded-xl p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[160px] relative group">
                    <div className="absolute inset-0 border-2 border-dashed border-slate-100 m-2 rounded-lg group-hover:border-emerald-500/20 transition-colors" />
                    {signatureValue ? (
                      <div className="text-center relative z-10">
                        <motion.img 
                          key={signatureValue}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          src={signatureValue} 
                          className="h-12 w-auto object-contain mb-2" 
                          onError={(e) => (e.currentTarget.style.display = 'none')} 
                        /> 
                        <div className="h-px w-32 bg-slate-200 mx-auto" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase mt-2 block">Authorized Signatory</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300 relative z-10">
                        <PenTool className="h-10 w-10 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Signature</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* --- ACTION BAR --- */}
              {isAdmin && (
                <div className="p-6 bg-slate-50 border-t flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="min-w-[180px] shadow-lg shadow-primary/20 font-bold"
                  >
                    {isLoading ? "Updating Identity..." : <><Save className="mr-2 h-4 w-4"/> Update Branding</>}
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
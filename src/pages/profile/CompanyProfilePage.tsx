import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Building2, Landmark, Mail, Phone, Globe, MapPin, 
  Copy
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { companyService } from "@/services/companyService";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CompanyProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Left Column ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Card 1 — Identity */}
          <Card className="overflow-hidden">
            {/* Banner */}
            <Skeleton className="h-24 w-full rounded-none" />
            <CardContent className="pt-0 -mt-12 px-6 pb-6">
              <div className="flex justify-between items-start">
                {/* Logo */}
                <Skeleton className="h-24 w-24 rounded-xl border-4 border-white" />
                {/* Badge */}
                <Skeleton className="h-6 w-28 rounded-full mt-14" />
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-7 w-56" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 — Address & Legal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-36" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {/* Address */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              {/* Legal fields */}
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center border">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center border">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Card 3 — Bank (dark) */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded bg-slate-700" />
                <Skeleton className="h-5 w-28 bg-slate-700" />
              </div>
              <Skeleton className="h-3.5 w-40 bg-slate-700 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16 bg-slate-700" />
                <Skeleton className="h-6 w-40 bg-slate-700" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 bg-slate-700" />
                <Skeleton className="h-4 w-36 bg-slate-700" />
              </div>
              <Separator className="bg-slate-700" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24 bg-slate-700" />
                    <Skeleton className="h-7 w-40 bg-slate-700" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md bg-slate-700" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16 bg-slate-700" />
                    <Skeleton className="h-6 w-28 bg-slate-700" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md bg-slate-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 — Signature */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full rounded-md" />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await companyService.getProfile();
      setProfile(data || {});
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) return <CompanyProfileSkeleton />;
  if (!profile) return <div className="p-8">No profile data found. Please configure in Settings.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">Your business details at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN: IDENTITY --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. Main ID Card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="pt-0 -mt-12 px-6 pb-6">
              <div className="flex justify-between items-start">
                <div className="h-24 w-24 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                   {profile.logoUrl ? (
                     <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                   ) : (
                     <Building2 className="h-10 w-10 text-gray-300" />
                   )}
                </div>
                <Badge variant="secondary" className="mt-14">Active Business</Badge>
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{profile.companyName || "Company Name Not Set"}</h2>
                
                <div className="flex flex-col gap-2 mt-3 text-gray-600 text-sm">
                   
                   {profile.email && (
                     <div className="flex items-center gap-2">
                       <Mail className="h-4 w-4 text-blue-600 shrink-0" /> 
                       <span>
                         {profile.email}
                         {profile.secondaryEmail && <span className="text-gray-400"> / {profile.secondaryEmail}</span>}
                       </span>
                     </div>
                   )}

                   {profile.phone && (
                     <div className="flex items-center gap-2">
                       <Phone className="h-4 w-4 text-green-600 shrink-0" /> 
                       <span>
                         {profile.phone}
                         {profile.secondaryPhone && <span className="text-gray-400"> / {profile.secondaryPhone}</span>}
                       </span>
                     </div>
                   )}

                   {profile.website && (
                     <div className="flex items-center gap-2">
                       <Globe className="h-4 w-4 text-purple-600 shrink-0" /> 
                       <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                         {profile.website}
                       </a>
                     </div>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Address & Legal */}
          <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-gray-500" /> Location & Legal
               </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
               <div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-500">Registered Address</h4>
                  <p className="text-sm leading-relaxed">{profile.address || "No address provided."}</p>
               </div>
               <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center border">
                     <div>
                        <div className="text-xs text-gray-500">GSTIN</div>
                        <div className="font-mono font-medium">{profile.gstin || "N/A"}</div>
                     </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(profile.gstin, "GSTIN")}>
                        <Copy className="h-4 w-4 text-gray-500" />
                     </Button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center border">
                     <div>
                        <div className="text-xs text-gray-500">Udyam Registration</div>
                        <div className="font-mono font-medium">{profile.udyamRegNo || "N/A"}</div>
                     </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(profile.udyamRegNo, "Udyam Reg")}>
                        <Copy className="h-4 w-4 text-gray-500" />
                     </Button>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: BANK & EXTRAS --- */}
        <div className="space-y-6">
           
           {/* 3. Bank Card */}
           <Card className="bg-slate-900 text-white border-slate-800">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-white">
                    <Landmark className="h-5 w-5" /> Bank Details
                 </CardTitle>
                 <CardDescription className="text-slate-400">For receiving payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <div className="text-xs text-slate-400">Bank Name</div>
                    <div className="font-semibold text-lg">{profile.bankName || "N/A"}</div>
                 </div>
                 
                 <div>
                    <div className="text-xs text-slate-400">Account Name</div>
                    <div className="text-sm">{profile.accountName || "N/A"}</div>
                 </div>

                 <Separator className="bg-slate-700" />

                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <div>
                          <div className="text-xs text-slate-400">Account Number</div>
                          <div className="font-mono text-xl tracking-wider">{profile.accountNumber || "N/A"}</div>
                       </div>
                       <Button variant="secondary" size="icon" className="h-8 w-8 bg-slate-700 hover:bg-slate-600 text-white border-0" onClick={() => copyToClipboard(profile.accountNumber, "Account Number")}>
                          <Copy className="h-3 w-3" />
                       </Button>
                    </div>

                    <div className="flex justify-between items-center">
                       <div>
                          <div className="text-xs text-slate-400">IFSC Code</div>
                          <div className="font-mono text-lg">{profile.ifscCode || "N/A"}</div>
                       </div>
                       <Button variant="secondary" size="icon" className="h-8 w-8 bg-slate-700 hover:bg-slate-600 text-white border-0" onClick={() => copyToClipboard(profile.ifscCode, "IFSC Code")}>
                          <Copy className="h-3 w-3" />
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* 4. Signature Preview */}
           <Card>
              <CardHeader className="pb-3">
                 <CardTitle className="text-base">Authorized Signature</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                    {profile.signatureUrl ? (
                       <img src={profile.signatureUrl} alt="Sig" className="max-h-20 object-contain" />
                    ) : (
                       <span className="text-xs text-gray-400">No Signature Uploaded</span>
                    )}
                 </div>
              </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}
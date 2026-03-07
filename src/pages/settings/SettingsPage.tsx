import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Building2, Landmark, Image as ImageIcon, Users, ArrowLeft, ChevronRight 
} from "lucide-react"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { companyService } from "@/services/companyService";
import { authService, type User } from "@/services/authService";
import { PasswordConfirmDialog } from "@/components/common/PasswordConfirmDialog";

// 👇 Import Components
import { GeneralTab } from "./components/GeneralTab";
import { BankTab } from "./components/BankTab";
import { BrandingTab } from "./components/BrandingTab";
import { TeamTab } from "./components/TeamTab";

const companySchema = z.object({
  id: z.string().optional().nullable(),
  companyName: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  pincode: z.string().min(6, "Valid 6-digit Pincode required").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().or(z.literal("")).nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  secondaryEmail: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  secondaryPhone: z.string().optional().or(z.literal("")).nullable(),
  website: z.string().optional().or(z.literal("")).nullable(),
  gstin: z.string().optional().or(z.literal("")).nullable(),
  udyamRegNo: z.string().optional().or(z.literal("")).nullable(),
  bankName: z.string().optional().or(z.literal("")).nullable(),
  accountName: z.string().optional().or(z.literal("")).nullable(),
  accountNumber: z.string().optional().or(z.literal("")).nullable(),
  ifscCode: z.string().optional().or(z.literal("")).nullable(),
  branch: z.string().optional().or(z.literal("")).nullable(),
  logoUrl: z.string().optional().or(z.literal("")).nullable(),
  signatureUrl: z.string().optional().or(z.literal("")).nullable(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

type PendingAction = 
  | { type: 'SAVE_PROFILE'; payload: CompanyFormValues }
  | { type: 'DELETE_USER'; payload: { id: string; username: string } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "", address: "", pincode: "", phone: "", email: "", 
      secondaryEmail: "", secondaryPhone: "", 
      website: "", gstin: "", udyamRegNo: "", bankName: "", accountName: "", accountNumber: "", 
      ifscCode: "", branch: "", logoUrl: "", signatureUrl: ""
    }
  });

  useEffect(() => {
    const user = authService.getCurrentUser(); 
    setCurrentUser(user);
    loadProfile();
    if (user?.role === 'ADMIN') {
        loadUsers();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const data = await companyService.getProfile();
      if (data) {
        form.reset({
           ...data,
           id: data.id || null, 
           secondaryEmail: data.secondaryEmail || "",
           secondaryPhone: data.secondaryPhone || "",
           logoUrl: data.logoUrl || "",
           signatureUrl: data.signatureUrl || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const loadUsers = async () => {
      try {
          const data = await authService.getAllUsers();
          setUsers(data);
      } catch (error) {
          console.error("Failed to load users");
      }
  };

  const onFormSubmit = (values: CompanyFormValues) => {
    setPendingAction({ type: 'SAVE_PROFILE', payload: values });
    setIsConfirmOpen(true);
  };

  // 👇 UPDATED: Removed window.confirm. 
  // It now immediately triggers the final Password Dialog since the TeamTab already confirmed intent.
  const onDeleteClick = (e: React.MouseEvent | any, id: string, username: string) => {
    if (e?.preventDefault) e.preventDefault(); 
    if (e?.stopPropagation) e.stopPropagation();
    
    // Set the action and open the final password confirmation
    setPendingAction({ type: 'DELETE_USER', payload: { id, username } });
    setIsConfirmOpen(true);
  };

  const handleSecurityCheckPassed = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    try {
      if (pendingAction.type === 'SAVE_PROFILE') {
        await companyService.saveProfile(pendingAction.payload as any); 
        toast.success("Settings saved successfully!");
      } 
      else if (pendingAction.type === 'DELETE_USER') {
        await authService.deleteUser(pendingAction.payload.id);
        toast.success(`User '${pendingAction.payload.username}' deleted.`);
        loadUsers(); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    } finally {
      setIsLoading(false);
      setPendingAction(null); 
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  const menuItems = [
    {
      id: "general",
      title: "Company Profile",
      description: "Manage business name, address, and contact details.",
      icon: <Building2 className="w-6 h-6 text-blue-600" />
    },
    {
      id: "bank",
      title: "Bank Accounts",
      description: "Setup bank details for invoices and payments.",
      icon: <Landmark className="w-6 h-6 text-emerald-600" />
    },
    {
      id: "branding",
      title: "Branding",
      description: "Upload company logo and authorized signature.",
      icon: <ImageIcon className="w-6 h-6 text-purple-600" />
    },
    ...(isAdmin ? [{
      id: "team",
      title: "Team Management",
      description: "Manage users, roles, and access permissions.",
      icon: <Users className="w-6 h-6 text-orange-600" />
    }] : [])
  ];

  if (!activeTab) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your company preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
              onClick={() => setActiveTab(item.id)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {menuItems.find(i => i.id === activeTab)?.title || "Settings"}
          </h1>
      </div>

      {activeTab === 'general' && (
        <GeneralTab form={form} onSubmit={onFormSubmit} isAdmin={isAdmin} isLoading={isLoading} />
      )}

      {activeTab === 'bank' && (
        <BankTab form={form} onSubmit={onFormSubmit} isAdmin={isAdmin} isLoading={isLoading} />
      )}

      {activeTab === 'branding' && (
        <BrandingTab form={form} onSubmit={onFormSubmit} isAdmin={isAdmin} isLoading={isLoading} />
      )}

      {activeTab === 'team' && isAdmin && (
        <TeamTab users={users} onDeleteClick={onDeleteClick} onUserAdded={loadUsers} />
      )}

      {/* FINAL STEP: The global password confirmation dialog */}
      <PasswordConfirmDialog 
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirmed={handleSecurityCheckPassed}
        title="Security Confirmation"
        description={
          pendingAction?.type === 'DELETE_USER' 
          ? `Please enter your password to confirm deleting user '${pendingAction.payload.username}'.`
          : "Please enter your password to save company profile changes."
        }
      />
    </div>
  );
}
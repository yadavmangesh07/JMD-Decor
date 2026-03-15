import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { useIdleTimeout } from "./hooks/useIdleTimeout";

// --- AUTH COMPONENTS ---
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";

// --- LAZY LOADED PAGES (Code Splitting) ---
// This prevents the "Chunk Size" warning by creating separate files for each page
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ClientPage = lazy(() => import("./pages/Clients/ClientPage"));
const ClientProfilePage = lazy(() => import("./pages/Clients/ClientProfilePage"));
const InvoicePage = lazy(() => import("./pages/invoices/InvoicePage"));
const InvoiceFormPage = lazy(() => import("./pages/invoices/InvoiceFormPage"));
const ChallanListPage = lazy(() => import("./pages/challan/ChallanListPage"));
const ChallanFormPage = lazy(() => import("./pages/challan/ChallanFormPage"));
const EstimateListPage = lazy(() => import("./pages/estimates/EstimateListPage"));
const EstimateFormPage = lazy(() => import("./pages/estimates/EstimateFormPage"));
const WCCListPage = lazy(() => import("./pages/wcc/WCCListPage"));
const WCCFormPage = lazy(() => import("./pages/wcc/WCCFormPage"));
const FilesPage = lazy(() => import("./pages/files/FilesPage"));
const ClientProjectsPage = lazy(() => import("./pages/projects/ClientProjectsPage"));
const CompanyProfilePage = lazy(() => import("@/pages/profile/CompanyProfilePage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const MyAccountPage = lazy(() => import("./pages/settings/MyAccountPage"));
const PurchasesPage = lazy(() => import("./pages/purchases/PurchasePage"));

/**
 * Loading component for Suspense
 */
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fc]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const IdleTimerLayout = () => {
  useIdleTimeout(); 
  return <Outlet />; 
};

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      {/* Suspense is required when using lazy imports */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Auth Guard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<IdleTimerLayout />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientPage />} />
                <Route path="/clients/:id/profile" element={<ClientProfilePage />} />
                
                <Route path="/invoices" element={<InvoicePage />} />
                <Route path="/invoices/new" element={<InvoiceFormPage />} />
                <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />
                
                <Route path="/challans" element={<ChallanListPage />} />
                <Route path="/challans/new" element={<ChallanFormPage />} />
                <Route path="/challans/:id/edit" element={<ChallanFormPage />} />
                
                <Route path="/estimates" element={<EstimateListPage />} /> 
                <Route path="/estimates/new" element={<EstimateFormPage />} />
                <Route path="/estimates/:id/edit" element={<EstimateFormPage />} />
                
                <Route path="/wcc" element={<WCCListPage />} />
                <Route path="/wcc/new" element={<WCCFormPage />} />
                <Route path="/wcc/:id/edit" element={<WCCFormPage />} />
                
                <Route path="/files" element={<FilesPage />} />
                <Route path="/files/:clientId" element={<ClientProjectsPage />} />
                
                <Route path="/profile" element={<CompanyProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/account" element={<MyAccountPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
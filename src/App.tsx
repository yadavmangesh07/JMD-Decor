import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import { ChunkErrorBoundary } from "./pages/auth/ChunkErrorBoundary";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

// --- AUTH COMPONENTS ---
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";

// --- LAZY LOADED PAGES ---
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
 * Custom Progress Bar Loader
 * Matches your Slate/Dark theme
 */
const ProgressBar = () => {
  useEffect(() => {
    nProgress.configure({ showSpinner: false, speed: 400 });
    nProgress.start();
    return () => {
      nProgress.done();
    };
  }, []);

  return (
    <style>{`
      #nprogress .bar {
        background: #0f172a !important; /* Slate 900 */
        height: 3px !important;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px #0f172a, 0 0 5px #0f172a !important;
      }
    `}</style>
  );
};

const IdleTimerLayout = () => {
  useIdleTimeout(); 
  return <Outlet />; 
};

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      {/* 1. Error Boundary: Catches expired JWTs and network failures during chunk loading */}
      <ChunkErrorBoundary>
        {/* 2. Suspense: Handles the visual state while lazy pages are being downloaded */}
        <Suspense fallback={<ProgressBar />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Auth Guarded Routes */}
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

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
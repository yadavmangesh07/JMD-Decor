import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";

export const ProtectedRoute = () => {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    // We clear the auth data just in case there was an expired token left over
    authService.logout();
    
    // Redirect to login, but save the current location so we can 
    // send them back after they log in (great for UX!)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and token is valid, render the child routes (Outlet)
  return <Outlet />;
};
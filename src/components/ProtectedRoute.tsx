
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "./MainLayout";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions for specific routes
  const checkRoutePermissions = () => {
    // Only admin and developers can access user management
    if (location.pathname === "/users" && !hasPermission(["admin", "developer"])) {
      return false;
    }

    // Only admin, developers and attendants can access various routes
    if (["/revenue", "/activities", "/reports"].includes(location.pathname) && 
        !hasPermission(["admin", "developer", "attendant"])) {
      return false;
    }

    // Dashboard is accessible to all authenticated users
    return true;
  };

  if (!checkRoutePermissions()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected route with the main layout
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;

import { useAuth } from "../hooks/auth";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default RequireAuth;

import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/userContext";

export function ProtectedRoute({ children, allowedUserId }) {
  const { loading, userDetails: userInfo } = useUserContext();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Wait until user info is fully loaded
  if (userInfo.id == null) {
    return <div className="loading">Verifying user...</div>;
  }

  // If not authorized, redirect
  if (userInfo.id !== allowedUserId) {
    return <Navigate to={`/u/${allowedUserId}`} replace />;
  }

  return children;
}

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";

export default function ProtectedRoute({ component: Component, role }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" />;
  if (!user.isVerified) return <Navigate to="/verify-otp" />;
  if (user.role !== role) return <Navigate to="/" />;

  return <Component />;
}

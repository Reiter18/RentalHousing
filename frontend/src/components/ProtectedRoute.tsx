import type { ReactNode } from "react";
import { Center, Loader } from "@mantine/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Center mih="100vh"><Loader /></Center>;
  return user ? children : <Navigate to="/login" replace />;
}

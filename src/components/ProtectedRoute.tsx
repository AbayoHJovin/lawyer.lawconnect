import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import API from "@/lib/axios";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [checked, setChecked] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      setFetching(true);
      try {
        // 1. Try accessing protected endpoint
        await API.get("/auth/protected", { withCredentials: true });
        setHasAccess(true);
      } catch (error) {
        try {
          // 2. If failed, try refreshing the token
          await API.post("/auth/refresh-token", {}, { withCredentials: true });

          // 3. After refresh, retry protected endpoint
          await API.get("/auth/protected", { withCredentials: true });
          setHasAccess(true);
        } catch (refreshError) {
          // 4. If refresh also fails, mark as not authenticated
          setHasAccess(false);
        }
      } finally {
        setChecked(true);
        setFetching(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line
  }, []);

  if (!checked) return null;
  if (!hasAccess && !fetching)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

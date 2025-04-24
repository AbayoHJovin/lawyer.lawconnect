import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  validateToken,
  getAccessToken,
  isTokenExpired,
} from "@/services/authService";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { checkAuth } from "@/store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isValidating, setIsValidating] = useState(false);
  const token = getAccessToken();

  // If no token at all, redirect immediately
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists but is expired, try to refresh
  if (isTokenExpired(token) && !isValidating) {
    setIsValidating(true);
    dispatch(checkAuth())
      .unwrap()
      .catch(() => {
        // If refresh fails, we'll be redirected in the next render
        setIsValidating(false);
      });
    return null; // Show nothing while validating
  }

  // If we have a valid token, render the protected content
  if (!isTokenExpired(token)) {
    return <>{children}</>;
  }

  // If we get here, token is expired and refresh failed
  return <Navigate to="/login" state={{ from: location }} replace />;
}

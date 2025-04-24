import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuthThunk } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthThunk()).unwrap();
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
};

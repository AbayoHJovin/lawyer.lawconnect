import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };

    checkAuthentication();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;

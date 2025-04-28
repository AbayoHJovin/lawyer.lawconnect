import { useNavigate } from "react-router-dom";

export const useAuthCheck = () => {
  const navigate = useNavigate();

  const checkAuth = async (callback: () => void) => {
    try {
      // Try to call a protected endpoint
      // If unauthorized, backend will return 401
      // Replace '/protected' with your actual protected endpoint
      const res = await fetch("/auth/protected", { credentials: "include" });
      if (res.status === 401) {
        navigate("/login", { state: { from: window.location.pathname } });
        return;
      }
      callback();
    } catch {
      navigate("/login", { state: { from: window.location.pathname } });
    }
  };

  return { checkAuth };
};

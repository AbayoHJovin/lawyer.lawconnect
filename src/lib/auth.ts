import { useNavigate } from "react-router-dom";

export const useAuthCheck = () => {
  const navigate = useNavigate();

  const checkAuth = (callback: () => void) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    callback();
  };

  return { checkAuth };
};

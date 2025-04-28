import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, AppDispatch, RootState } from "./store";
import { checkAuth } from "./store/slices/authSlice";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { isPublicRoute } from "@/utils/routeUtils";
import API from "@/lib/axios";

// Pages
import Index from "@/pages/Index";
import Lawyers from "@/pages/Lawyers";
import LawyerProfile from "@/pages/LawyerProfile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Consultations from "@/pages/Consultations";
import ConsultationDetails from "@/pages/ConsultationDetails";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await API.get("/auth/protected");
        if (response.status === 200) {
          dispatch({ type: "auth/setAuthenticated", payload: true });
        }
      } catch (error) {
        dispatch({ type: "auth/setAuthenticated", payload: false });
      }
    };

    // Only check auth on protected routes
    if (!isPublicRoute(location.pathname)) {
      checkAuthentication();
    }
  }, [dispatch, location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lawyers" element={<Lawyers />} />
      <Route path="/lawyers/:lawyerId" element={<LawyerProfile />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations"
        element={
          <ProtectedRoute>
            <Consultations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations/:consultationId"
        element={
          <ProtectedRoute>
            <ConsultationDetails />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </Router>
  );
}

export default App;

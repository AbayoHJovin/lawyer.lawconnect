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
import {
  checkAuth,
  fetchCurrentLawyer,
  setUser,
} from "./store/slices/authSlice";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { isPublicRoute } from "@/utils/routeUtils";
import API from "@/lib/axios";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Consultations from "@/pages/Consultations";
import ConsultationDetails from "@/pages/ConsultationDetails";
import NotFound from "@/pages/NotFound";
import Citizens from "@/pages/Citizens";
import Reviews from "@/pages/Reviews";

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
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await API.get("/auth/protected");
        if (response.status === 200) {
          dispatch({ type: "auth/setAuthenticated", payload: true });
          await fetchCurrentLawyer();
        }
      } catch (error) {
        dispatch({ type: "auth/setAuthenticated", payload: false });
        dispatch(setUser(null));
      }
    };

    if (!isPublicRoute(location.pathname)) {
      checkAuthentication();
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      fetchCurrentLawyer();
    }
  }, [isAuthenticated, user]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
        path="/citizens"
        element={
          <ProtectedRoute>
            <Citizens />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
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
    <Provider store={store}>
      <Router>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </Router>
    </Provider>
  );
}

export default App;

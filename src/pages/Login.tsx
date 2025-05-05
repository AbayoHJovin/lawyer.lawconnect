import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, useAppSelector } from "@/store";
import {
  clearError,
  loginLawyerByEmailThunk,
  fetchCurrentLawyer,
} from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LawyerDto } from "@/services/lawyerService";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const lawyer = useAppSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const error = useAppSelector((state: RootState) => state.auth.error);
  const loading = useAppSelector((state: RootState) => state.auth.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const from = location.state?.from?.pathname || "/dashboard";

  // Check if user is already authenticated in Redux state
  // If not, try to fetch current lawyer from backend
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (!isAuthenticated) {
          // Try to fetch current lawyer information from the backend
          const resultAction = await dispatch(fetchCurrentLawyer()).unwrap();
          if (resultAction) {
            // If we successfully got a lawyer, navigate to dashboard
            navigate("/dashboard", { replace: true });
            return;
          }
        } else if (lawyer) {
          // If already authenticated with lawyer info in Redux, navigate to dashboard
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        // If error or no user found, stay on login page
        console.log("No authenticated user found, showing login form");
      } finally {
        // Finished checking
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, lawyer, dispatch, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(clearError());
      return;
    }

    try {
      await dispatch(loginLawyerByEmailThunk({ email, password })).unwrap();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // error handled by slice
    }
  };
  // Show loading state while we check authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          Checking authentication status...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">LawConnect Pro</h1>
          <p className="text-muted-foreground mt-2">
            Connect with legal professionals
          </p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your account using email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In with Email"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;

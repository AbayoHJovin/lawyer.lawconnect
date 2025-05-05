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
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
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

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const from = location.state?.from?.pathname || "/";
  const previousPath = location.state?.previousPath || "/";

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotPasswordError("Please enter a valid email address");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      const response = await API.post("/password/forgot-password", {
        email: forgotEmail,
      });

      setResetEmailSent(true);
      toast({
        title: "Password Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send password reset link. Please try again.";

      setForgotPasswordError(errorMessage);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: errorMessage,
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotPasswordError("");
    setResetEmailSent(false);
  };

  const handleNavigateBack = () => {
    // Navigate back to the previous path or to home if no previous path
    navigate(
      previousPath !== "/login" && previousPath !== "/register"
        ? previousPath
        : "/"
    );
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
        <div className="text-center mb-4 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleNavigateBack}
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-primary">LawConnect Pro</h1>
          <p className="text-muted-foreground mt-2">
            Connect with legal professionals
          </p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            {showForgotPassword ? (
              <>
                <div className="flex items-center mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 mr-2"
                    onClick={handleBackToLogin}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl">Reset Password</CardTitle>
                </div>
                <CardDescription>
                  Enter your email to receive a password reset link
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  Access your account using email
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                {resetEmailSent ? (
                  <div className="py-6 flex flex-col items-center text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We've sent a password reset link to{" "}
                      <strong>{forgotEmail}</strong>. Please check your inbox
                      and follow the instructions to reset your password.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Don't see the email? Check your spam folder or request
                      another link.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    {forgotPasswordError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          {forgotPasswordError}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotPasswordLoading}
                    >
                      {forgotPasswordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button
                          variant="link"
                          type="button"
                          className="px-0 h-auto text-sm font-normal"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
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
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!showForgotPassword && (
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  state={{
                    previousPath:
                      location.pathname !== "/register"
                        ? location.state?.previousPath || location.pathname
                        : "/",
                  }}
                  className="text-primary hover:underline"
                >
                  Sign up
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;

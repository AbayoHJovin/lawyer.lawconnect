import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Info, ArrowLeft } from "lucide-react";
import API from "@/lib/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    token: token || "",
    password: "",
    confirmPassword: "",
  });

  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("Invalid or missing reset token.");
        setValidatingToken(false);
        return;
      }

      try {
        // You might want to add a token validation endpoint in your API
        // For now, just check if token exists and set token valid
        setTokenValid(true);
      } catch (error: any) {
        setTokenError(
          error.response?.data?.message || "Invalid or expired token."
        );
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      password: "",
      confirmPassword: "",
    };

    // Password length validation
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      isValid = false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/password/reset-password", formData);

      setResetSuccess(true);
      toast({
        title: "Password Reset Successful",
        description:
          "Your password has been reset. You can now login with your new password.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";

      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: errorMessage,
      });

      // If token is invalid, show specific error
      if (errorMessage.toLowerCase().includes("token")) {
        setTokenError(errorMessage);
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validatingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Validating reset token...</p>
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
              onClick={handleNavigateToLogin}
              title="Back to login"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-primary">LawConnect Pro</h1>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {resetSuccess ? "Password Reset" : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {resetSuccess
                ? "Your password has been successfully reset"
                : "Enter a new password for your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!tokenValid ? (
              <div className="py-6 flex flex-col items-center text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-medium mb-2">Invalid Token</h3>
                <p className="text-muted-foreground mb-4">
                  {tokenError ||
                    "The password reset link is invalid or has expired."}
                </p>
                <Button asChild className="mt-2">
                  <Link to="/login">Back to Login</Link>
                </Button>
              </div>
            ) : resetSuccess ? (
              <div className="py-6 flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Success!</h3>
                <p className="text-muted-foreground mb-4">
                  Your password has been reset successfully. You will be
                  redirected to the login page.
                </p>
                <Button asChild className="mt-2">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Alert variant="info" className="mb-4">
                  <Info className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Password must be at least 8 characters and include
                    uppercase, lowercase, number, and special character.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {!resetSuccess && tokenValid && (
              <p className="text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

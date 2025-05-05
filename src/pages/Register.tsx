import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import API from "@/lib/axios";

interface Specialization {
  specializationId: string;
  specializationName: string;
}

interface SpecializationRequest {
  specializationName: string;
}

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [open, setOpen] = useState(false);

  // Email verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Get previous path from location state or default to home
  const previousPath = location.state?.previousPath || "/";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    languagePreference: "en",
    licenseNumber: "",
    yearsOfExperience: 0,
    location: "",
    password: "",
    confirmPassword: "",
    lawyerBio: "",
    specialization: [] as SpecializationRequest[],
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    yearsOfExperience: "",
  });

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await API.get("/specializations/all");
        setSpecializations(response.data.data);
      } catch (error) {
        console.error("Error fetching specializations:", error);
        toast({
          title: "Error",
          description: "Failed to load specializations",
          variant: "destructive",
        });
      }
    };

    fetchSpecializations();
  }, [toast]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      licenseNumber: "",
      yearsOfExperience: "",
    };

    // Validate email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Check email verification
    if (formData.email && !isEmailVerified) {
      newErrors.email = "Email must be verified";
      isValid = false;
    }

    // Validate phone
    if (
      !formData.phoneNumber ||
      !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate password
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Validate license number
    if (!formData.licenseNumber) {
      newErrors.licenseNumber = "License number is required";
      isValid = false;
    }

    // Validate years of experience
    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience =
        "Years of experience must be a positive number";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset email verification if email changes
    if (name === "email") {
      setIsEmailVerified(false);
    }
  };

  const handleSpecializationChange = (
    selectedSpecializations: Specialization[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      specialization: selectedSpecializations.map((spec) => ({
        specializationName: spec.specializationName,
      })),
    }));
  };

  const handleNavigateBack = () => {
    // Navigate back to the previous path or to home if no previous path
    navigate(
      previousPath !== "/login" && previousPath !== "/register"
        ? previousPath
        : "/"
    );
  };

  const handleSendVerification = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError("");

      const response = await API.post("/mail/send", { email: formData.email });

      if (response.data && response.data.message) {
        // Check if the email is already verified
        if (response.data.message.includes("already verified")) {
          setIsEmailVerified(true);
          toast({
            title: "Email Already Verified",
            description: "This email has already been verified.",
          });
        } else {
          toast({
            title: "Verification Email Sent",
            description: response.data.message,
          });
          setShowOtpModal(true);
        }
      }
    } catch (err: any) {
      // Check if this is the "already verified" error
      if (err.response?.data?.message?.includes("already verified")) {
        setIsEmailVerified(true);
        toast({
          title: "Email Already Verified",
          description: "This email has already been verified.",
        });
      } else {
        setVerificationError(
          err.response?.data?.message || "Failed to send verification email"
        );
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description:
            err.response?.data?.message || "Failed to send verification email",
        });
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only one digit
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Add a new handler for pasting OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const otpDigits = pastedData.split("");
      setOtp(otpDigits);

      // Focus the last input after pasting
      const lastInput = document.getElementById("otp-5");
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setVerificationError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationError("");

      const response = await API.post("/mail/confirm", {
        email: formData.email,
        otp: otpValue,
      });

      if (response.data && response.data.message === "Email verified.") {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified.",
        });
      } else {
        setVerificationError(response.data?.message || "Invalid OTP");
      }
    } catch (err: any) {
      setVerificationError(
        err.response?.data?.message || "Verification failed"
      );
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err.response?.data?.message || "Failed to verify OTP",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await API.post("/lawyers/add", formData);
      toast({
        title: "Registration Successful",
        description:
          "Your lawyer account has been created. Please login to continue.",
      });
      navigate("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-4xl">
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
            Create your lawyer account
          </p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Lawyer Registration
            </CardTitle>
            <CardDescription className="text-center">
              Fill in your professional details
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${
                          isEmailVerified
                            ? "border-green-500 pr-10"
                            : formErrors.email
                            ? "border-red-500 pr-10"
                            : ""
                        }`}
                        required
                      />
                      {isEmailVerified && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={
                        !formData.email ||
                        verificationLoading ||
                        isEmailVerified
                      }
                      variant={isEmailVerified ? "outline" : "default"}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {isEmailVerified
                        ? "Verified ✓"
                        : verificationLoading
                        ? "Sending..."
                        : "Verify Email"}
                    </Button>
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-destructive">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.licenseNumber && (
                    <p className="text-sm text-destructive">
                      {formErrors.licenseNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    min="0"
                    placeholder="Enter years of experience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.yearsOfExperience && (
                    <p className="text-sm text-destructive">
                      {formErrors.yearsOfExperience}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter your location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specializations</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.specialization.length > 0
                        ? `${formData.specialization.length} specializations selected`
                        : "Select specializations"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search specializations..." />
                      <CommandEmpty>No specialization found.</CommandEmpty>
                      <CommandGroup>
                        {specializations.map((spec) => (
                          <CommandItem
                            key={spec.specializationId}
                            onSelect={() => {
                              const isSelected = formData.specialization.some(
                                (s) =>
                                  s.specializationName ===
                                  spec.specializationName
                              );
                              if (isSelected) {
                                handleSpecializationChange(
                                  formData.specialization
                                    .filter(
                                      (s) =>
                                        s.specializationName !==
                                        spec.specializationName
                                    )
                                    .map((s) => ({
                                      specializationId: spec.specializationId,
                                      specializationName: s.specializationName,
                                    }))
                                );
                              } else {
                                handleSpecializationChange([
                                  ...formData.specialization.map((s) => ({
                                    specializationId: spec.specializationId,
                                    specializationName: s.specializationName,
                                  })),
                                  spec,
                                ]);
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.specialization.some(
                                  (s) =>
                                    s.specializationName ===
                                    spec.specializationName
                                )
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {spec.specializationName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lawyerBio">Professional Bio</Label>
                <Textarea
                  id="lawyerBio"
                  name="lawyerBio"
                  placeholder="Tell us about your professional experience"
                  value={formData.lawyerBio}
                  onChange={handleChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{
                  previousPath:
                    location.pathname !== "/login"
                      ? location.state?.previousPath || location.pathname
                      : "/",
                }}
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Verification</DialogTitle>
            <DialogDescription>
              Please enter the 6-digit OTP sent to {formData.email}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {verificationError && (
              <Alert variant="destructive">
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowOtpModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.join("").length !== 6}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleSendVerification}
                disabled={verificationLoading}
              >
                {verificationLoading ? "Sending..." : "Resend OTP"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;

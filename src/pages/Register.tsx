import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Check, ChevronsUpDown } from "lucide-react";
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
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [open, setOpen] = useState(false);

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
        <div className="text-center mb-8">
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
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
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
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateLawyer,
  getAllSpecializations,
  LawyerDto,
  UpdateLawyerRequest,
  SpecializationDto,
} from "@/services/lawyerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";
import Layout from "@/components/Layout";
import { fetchCurrentLawyer } from "@/store/slices/authSlice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  // Form state
  const [formData, setFormData] = useState<LawyerDto | null>(null);
  const [originalData, setOriginalData] = useState<LawyerDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;

  useEffect(() => {
    if (user) {
      setFormData(user);
      setOriginalData(user);
    }
  }, [user]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLawyerRequest) => updateLawyer(data),
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setOriginalData(data);
      setFormData(data);
      dispatch(fetchCurrentLawyer());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Fetch all specializations
  const { data: allSpecializations = [] } = useQuery<SpecializationDto[]>({
    queryKey: ["allSpecializations"],
    queryFn: getAllSpecializations,
    refetchOnWindowFocus: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSpecializationChange = (spec: SpecializationDto) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const exists = prev.specializations.some(
        (s) => s.specializationId === spec.specializationId
      );
      let updatedSpecs;
      if (exists) {
        updatedSpecs = prev.specializations.filter(
          (s) => s.specializationId !== spec.specializationId
        );
      } else {
        updatedSpecs = [...prev.specializations, spec];
      }
      return { ...prev, specializations: updatedSpecs };
    });
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${fieldName} copied to clipboard`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !originalData) return;
    // Only include changed fields
    const changes: UpdateLawyerRequest = {};
    if (formData.fullName !== originalData.fullName)
      changes.fullName = formData.fullName;
    if (formData.phoneNumber !== originalData.phoneNumber)
      changes.phoneNumber = formData.phoneNumber || undefined;
    if (formData.languagePreference !== originalData.languagePreference)
      changes.languagePreference = formData.languagePreference;
    if (formData.licenseNumber !== originalData.licenseNumber)
      changes.licenseNumber = formData.licenseNumber;
    if (formData.yearsOfExperience !== originalData.yearsOfExperience)
      changes.yearsOfExperience = formData.yearsOfExperience;
    if (formData.location !== originalData.location)
      changes.location = formData.location;
    if (formData.lawyerBio !== originalData.lawyerBio)
      changes.lawyerBio = formData.lawyerBio || undefined;
    // Specializations
    const origSpecIds = new Set(
      originalData.specializations.map((s) => s.specializationId)
    );
    const formSpecIds = new Set(
      formData.specializations.map((s) => s.specializationId)
    );
    if (
      formData.specializations.length !== originalData.specializations.length ||
      formData.specializations.some(
        (s) => !origSpecIds.has(s.specializationId)
      ) ||
      originalData.specializations.some(
        (s) => !formSpecIds.has(s.specializationId)
      )
    ) {
      changes.specialization = formData.specializations.map((s) => ({
        specializationName: s.specializationName,
      }));
    }
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to update");
      setIsEditing(false);
      return;
    }
    updateMutation.mutate(changes);
  };

  if (!formData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Read-only fields */}
                <div className="space-y-2">
                  <Label htmlFor="id">ID</Label>
                  <div className="relative">
                    <Input
                      id="id"
                      value={formData.id}
                      disabled
                      className="w-full bg-muted pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => handleCopy(formData.id, "ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-muted pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => handleCopy(formData.email, "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Editable fields */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languagePreference">
                    Language Preference
                  </Label>
                  <Select
                    value={formData.languagePreference}
                    onValueChange={(value) =>
                      handleSelectChange("languagePreference", value)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="kin">Kinyarwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lawyerBio">Bio</Label>
                  <Textarea
                    id="lawyerBio"
                    name="lawyerBio"
                    value={formData.lawyerBio || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Specializations</Label>
                  {/* Responsive display of selected specializations as badges */}
                  {!isEditing && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.specializations.length > 0 ? (
                        formData.specializations.map((s) => (
                          <Badge key={s.specializationId} variant="outline">
                            {s.specializationName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          No specializations selected
                        </span>
                      )}
                    </div>
                  )}
                  {/* Popover for editing specializations */}
                  {isEditing && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.specializations.length > 0 ? (
                        formData.specializations.map((s) => (
                          <Badge key={s.specializationId} variant="outline">
                            {s.specializationName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          No specializations selected
                        </span>
                      )}
                    </div>
                  )}
                  {isEditing && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline">
                          Select Specializations
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 max-h-64 overflow-y-auto">
                        {allSpecializations.map((spec) => (
                          <div
                            key={spec.specializationId}
                            className="flex items-center gap-2 py-1"
                          >
                            <Checkbox
                              id={`spec-${spec.specializationId}`}
                              checked={formData.specializations.some(
                                (s) =>
                                  s.specializationId === spec.specializationId
                              )}
                              onCheckedChange={() =>
                                handleSpecializationChange(spec)
                              }
                              disabled={!isEditing}
                            />
                            <Label htmlFor={`spec-${spec.specializationId}`}>
                              {spec.specializationName}
                            </Label>
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(originalData);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

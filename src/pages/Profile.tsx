import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateCitizen,
  getCitizenProfile,
  CitizenProfile,
} from "@/services/citizenService";
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
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";
import Layout from "@/components/Layout";
import { fetchCurrentUser } from "@/store/slices/authSlice";

type UpdateProfileData = Pick<
  CitizenProfile,
  "fullName" | "phoneNumber" | "languagePreference" | "location"
>;

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const [formData, setFormData] = useState<CitizenProfile>({
    id: user?.id || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    languagePreference: user?.languagePreference || "",
    location: user?.location || "",
  });

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        languagePreference: user.languagePreference,
        location: user.location,
      });
    }
  }, [user]);

  const [originalData, setOriginalData] = useState<CitizenProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["citizenProfile"],
    queryFn: getCitizenProfile,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCitizen,
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setOriginalData(data);
      setFormData(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setOriginalData(profile);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${fieldName} copied to clipboard`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only include changed fields in the update request
    const changes: UpdateProfileData = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      languagePreference: formData.languagePreference,
      location: formData.location,
    };

    // Don't send request if no changes
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to update");
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(changes);
  };

  if (isLoadingProfile) {
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
                    value={formData.phoneNumber}
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
                      setFormData((prev) => ({
                        ...prev,
                        languagePreference: value,
                      }))
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
                        setFormData(originalData || formData);
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

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import API from "@/lib/axios";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Calendar,
  Star,
  Award,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import type { LawyerDto } from "@/services/lawyerService";
import { fetchCurrentLawyer } from "@/store/slices/authSlice";
import { Switch } from "@/components/ui/switch";

const fetchLawyerConsultations = async (lawyerId: string) => {
  const res = await API.get(
    `/consultations/lawy-cit/get-by-lawyer/${lawyerId}`
  );
  return res.data.data;
};

const updateAvailability = async (lawyerId: string, availability: boolean) => {
  await API.put(
    `/lawyers/lawy/changeAvailability?availability=${availability}&lawyerId=${lawyerId}`
  );
  return availability;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch current lawyer if not set
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentLawyer());
    }
  }, [user, dispatch]);

  // Type-narrow user to LawyerDto for lawyer dashboard
  const lawyer = user as LawyerDto | undefined;
  const lawyerId = lawyer?.id ?? "";
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const {
    data: consultations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lawyer-consultations", lawyerId],
    queryFn: () => fetchLawyerConsultations(lawyerId),
    enabled: !!lawyerId,
  });
  // Lawyer summary data
  const averageRating = lawyer?.averageRating ?? 0;
  const numSpecializations = lawyer?.specializations?.length ?? 0;
  const yearsOfExperience = lawyer?.yearsOfExperience ?? 0;
  const isAvailable = lawyer?.availableForWork ? "Available" : "Not Available";

  const handleToggleAvailability = async () => {
    if (!lawyerId) return;
    setAvailabilityLoading(true);
    try {
      await updateAvailability(lawyerId, !lawyer?.availableForWork);
      window.location.reload();
    } catch (e) {
      alert("Failed to update availability status.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[50px]" />
                  <Skeleton className="h-4 w-[150px] mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Error loading your data</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive">
                Failed to load dashboard data. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {lawyer ? lawyer.fullName : "Lawyer"}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageRating.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Your overall rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Specializations
              </CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numSpecializations}</div>
              <p className="text-xs text-muted-foreground">
                Areas of expertise
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Years of Experience
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{yearsOfExperience}</div>
              <p className="text-xs text-muted-foreground">
                Professional experience
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Availability
              </CardTitle>
              <div className="flex items-center gap-2">
                {lawyer?.availableForWork ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle className="h-4 w-4" /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 font-semibold">
                    <CheckCircle className="h-4 w-4" /> Not Available
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Switch
                  checked={!!lawyer?.availableForWork}
                  onCheckedChange={handleToggleAvailability}
                  disabled={availabilityLoading}
                  id="availability-switch"
                />
                <label htmlFor="availability-switch" className="text-sm">
                  {lawyer?.availableForWork
                    ? "Toggle to set unavailable"
                    : "Toggle to set available"}
                </label>
                {availabilityLoading && (
                  <Loader2 className="animate-spin h-4 w-4 ml-2 text-blue-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This controls your status for new work
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Consultations</CardTitle>
              <CardDescription>Your most recent consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.slice(0, 3).map((consultation: any) => (
                    <div
                      key={consultation.id}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          consultation.status === "COMPLETED"
                            ? "bg-green-500"
                            : consultation.status === "ACCEPTED"
                            ? "bg-blue-500"
                            : consultation.status === "PENDING"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {consultation.subject ||
                            consultation.title ||
                            "Consultation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            consultation.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent consultations
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-blue-950 text-white"
                onClick={() => navigate("/citizens")}
              >
                <User className="mr-2 h-4 w-4" />
                Discover Citizens
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/consultations")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View All Consultations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

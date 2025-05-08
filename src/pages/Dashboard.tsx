import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, useAppSelector } from "@/store";
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
  PieChart as PieChartIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import type { LawyerDto } from "@/services/lawyerService";
import {
  fetchCurrentLawyer,
  updateAvailabilityThunk,
} from "@/store/slices/authSlice";
import { Switch } from "@/components/ui/switch";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  getConsultationStats,
  ConsultationStatus,
} from "@/services/consultationService";

const fetchLawyerConsultations = async () => {
  const res = await API.get(`/consultations/lawy-cit/get-by-lawyer`);
  return res.data.data;
};

// Colors for the consultation status pie chart
const STATUS_COLORS = {
  PENDING: "#f59e0b", // Amber/Yellow
  ACCEPTED: "#3b82f6", // Blue
  REJECTED: "#ef4444", // Red
  COMPLETED: "#10b981", // Green
  ONGOING: "#8b5cf6", // Purple
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const lawyer = useAppSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;

  useEffect(() => {
    if (!lawyer) {
      dispatch(fetchCurrentLawyer());
    }
  }, [lawyer, dispatch]);

  // Type-narrow user to LawyerDto for lawyer dashboard
  // const lawyer = user as LawyerDto | undefined;
  const lawyerId = lawyer?.id ?? "";
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const {
    data: consultations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lawyer-consultations", lawyerId],
    queryFn: () => fetchLawyerConsultations(),
    enabled: !!lawyerId,
  });
  // Lawyer summary data
  const averageRating = lawyer?.averageRating ?? 0;
  const numSpecializations = lawyer?.specializations?.length ?? 0;
  const yearsOfExperience = lawyer?.yearsOfExperience ?? 0;
  const isAvailable = lawyer?.availableForWork ? "Available" : "Not Available";

  // Prepare consultation stats and chart data
  const consultationStats = consultations
    ? getConsultationStats(consultations)
    : null;

  const consultationChartData = consultationStats
    ? [
        {
          name: "Pending",
          value: consultationStats.pending,
          color: STATUS_COLORS.PENDING,
        },
        {
          name: "Accepted",
          value: consultationStats.accepted,
          color: STATUS_COLORS.ACCEPTED,
        },
        {
          name: "Rejected",
          value: consultationStats.rejected,
          color: STATUS_COLORS.REJECTED,
        },
        {
          name: "Completed",
          value: consultationStats.completed,
          color: STATUS_COLORS.COMPLETED,
        },
        {
          name: "Ongoing",
          value: consultationStats.ongoing,
          color: STATUS_COLORS.ONGOING,
        },
      ].filter((item) => item.value > 0)
    : [];

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-xs text-muted-foreground">
            {`${Math.round(
              (payload[0].value / (consultationStats?.total || 1)) * 100
            )}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleToggleAvailability = async () => {
    if (!lawyerId) return;
    setAvailabilityLoading(true);
    try {
      await dispatch(
        updateAvailabilityThunk({
          lawyerId,
          availability: !lawyer?.availableForWork,
        })
      ).unwrap();
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
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Switch
                    checked={!!lawyer?.availableForWork}
                    onCheckedChange={handleToggleAvailability}
                    disabled={availabilityLoading}
                    id="availability-switch"
                  />
                </div>
                {availabilityLoading && (
                  <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 my-3">
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
              <p className="text-xs text-muted-foreground mt-2">
                This controls your status for new work
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Consultation Summary with Pie Chart */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Consultation Summary</CardTitle>
                  <CardDescription>
                    Overview of your consultations
                  </CardDescription>
                </div>
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart */}
                  <div className="h-[220px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={consultationChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent, x, y, midAngle }) => {
                            const radius = 90;
                            const radian = Math.PI / 180;
                            const sin = Math.sin(-midAngle * radian);
                            const cos = Math.cos(-midAngle * radian);
                            const tx = x + (cos >= 0 ? 1 : -1) * 20;
                            const ty = y;

                            return (
                              <text
                                x={tx}
                                y={ty}
                                fill="#888"
                                textAnchor={cos >= 0 ? "start" : "end"}
                                dominantBaseline="middle"
                                fontSize={12}
                                fontWeight="medium"
                              >
                                {name} ({(percent * 100).toFixed(0)}%)
                              </text>
                            );
                          }}
                        >
                          {consultationChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="white"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Summary */}
                  <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span>Pending</span>
                      </div>
                      <span className="font-medium">
                        {consultationStats?.pending || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>Accepted</span>
                      </div>
                      <span className="font-medium">
                        {consultationStats?.accepted || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Completed</span>
                      </div>
                      <span className="font-medium">
                        {consultationStats?.completed || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Rejected</span>
                      </div>
                      <span className="font-medium">
                        {consultationStats?.rejected || 0}
                      </span>
                    </div>
                    {consultationStats && consultationStats.ongoing > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                          <span>Ongoing</span>
                        </div>
                        <span className="font-medium">
                          {consultationStats.ongoing}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between col-span-2 border-t pt-2 mt-1">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">
                        {consultationStats?.total || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No consultations yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    You haven't received any consultation requests. Your first
                    consultation will appear here.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/consultations")}
                    className="mt-4"
                  >
                    View Consultations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
                            : consultation.status === "ONGOING"
                            ? "bg-purple-500"
                            : "bg-red-500"
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

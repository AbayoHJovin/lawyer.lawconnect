import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios";
import { LawyerDto } from "@/services/lawyerService";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Star,
  StarHalf,
  User,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface RatingDto {
  ratingId: string;
  citizenName: string;
  ratingScore: number;
  reviewText: string;
  createdAt?: string; // This might be present in the API response
}

interface RatingsResponse {
  message: string;
  data: RatingDto[];
}

// Colors for pie chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

const Reviews = () => {
  const lawyer = useSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // Fetch ratings
  const {
    data: ratingsResponse,
    isLoading,
    isError,
    error,
  } = useQuery<RatingsResponse>({
    queryKey: ["lawyer-ratings"],
    queryFn: async () => {
      const response = await API.get("/lawyers/get-all-rating");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const ratings = ratingsResponse?.data || [];

  // Filter ratings based on search and rating filter
  const filteredRatings = ratings.filter((rating) => {
    const matchesSearch =
      searchQuery === "" ||
      rating.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.reviewText.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "5" && rating.ratingScore === 5) ||
      (ratingFilter === "4" && rating.ratingScore === 4) ||
      (ratingFilter === "3" && rating.ratingScore === 3) ||
      (ratingFilter === "2" && rating.ratingScore === 2) ||
      (ratingFilter === "1" && rating.ratingScore === 1);

    return matchesSearch && matchesRating;
  });

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.ratingScore, 0) /
        ratings.length
      : 0;

  // Prepare data for pie chart
  const prepareChartData = () => {
    const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5

    ratings.forEach((rating) => {
      const index = rating.ratingScore - 1;
      if (index >= 0 && index < 5) {
        ratingCounts[index]++;
      }
    });

    return [
      { name: "5 Star", value: ratingCounts[4] },
      { name: "4 Star", value: ratingCounts[3] },
      { name: "3 Star", value: ratingCounts[2] },
      { name: "2 Star", value: ratingCounts[1] },
      { name: "1 Star", value: ratingCounts[0] },
    ].filter((item) => item.value > 0); // Only include ratings that have at least one review
  };

  const chartData = prepareChartData();

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return <div className="flex">{stars}</div>;
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-xs text-muted-foreground">{`${Math.round(
            (payload[0].value / ratings.length) * 100
          )}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Your Reviews</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-20 mt-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-6 last:border-0">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24 mb-3" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load your reviews. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Your Reviews</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Card */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex mb-1">
                      {renderStars(averageRating)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {ratings.length}{" "}
                      {ratings.length === 1 ? "review" : "reviews"}
                    </div>
                  </div>

                  {/* Pie Chart */}
                  {ratings.length > 0 ? (
                    <div className="h-[200px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[200px] border border-dashed rounded-md">
                      <p className="text-muted-foreground text-sm">
                        No ratings to display
                      </p>
                    </div>
                  )}

                  {/* Rating Breakdown */}
                  <div className="space-y-2 mt-6">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratings.filter(
                        (r) => r.ratingScore === rating
                      ).length;
                      const percentage =
                        ratings.length > 0
                          ? Math.round((count / ratings.length) * 100)
                          : 0;

                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="flex items-center w-12">
                            <span>{rating}</span>
                            <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-10 text-xs text-right">
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle>All Reviews</CardTitle>
                    <CardDescription>
                      {filteredRatings.length}{" "}
                      {filteredRatings.length === 1 ? "review" : "reviews"} from
                      citizens
                    </CardDescription>
                  </div>
                  <Badge variant={ratings.length > 0 ? "default" : "outline"}>
                    {ratings.length > 0 ? "Active" : "No Reviews"}
                  </Badge>
                </CardHeader>

                {/* Filters */}
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select
                      value={ratingFilter}
                      onValueChange={setRatingFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Review List */}
                  {filteredRatings.length > 0 ? (
                    <div className="space-y-6">
                      {filteredRatings.map((rating) => (
                        <div
                          key={rating.ratingId}
                          className="border-b pb-6 last:border-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {rating.citizenName}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {rating.createdAt && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(
                                        new Date(rating.createdAt),
                                        "MMM d, yyyy"
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex">
                              {renderStars(rating.ratingScore)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {rating.reviewText}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="bg-muted rounded-full p-3 mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">
                        No Reviews Found
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchQuery || ratingFilter !== "all"
                          ? "Try changing your search or filter criteria to see more results"
                          : "You haven't received any reviews yet from citizens"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;

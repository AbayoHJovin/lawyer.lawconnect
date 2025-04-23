import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllLawyers, type LawyerDto } from "@/services/lawyerService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface ApiResponse {
  message: string;
  data: LawyerDto[];
}

interface FilterState {
  search: string;
  location: string;
  specialization: string;
  minExperience: number;
  minRating: number;
  availableOnly: boolean;
}

type FilterKey = keyof FilterState;
type FilterValue = string | number | boolean;

const Lawyers = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    specialization: "",
    minExperience: 0,
    minRating: 0,
    availableOnly: false,
  });

  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["lawyers"],
    queryFn: getAllLawyers,
    retry: 1,
  });

  const lawyers = response?.data || [];

  // Get unique locations and specializations for filter options
  const locations = useMemo(() => {
    const uniqueLocations = new Set(lawyers.map((lawyer) => lawyer.location));
    return Array.from(uniqueLocations);
  }, [lawyers]);

  const specializations = useMemo(() => {
    const uniqueSpecs = new Set(
      lawyers.flatMap(
        (lawyer) =>
          lawyer.specializations?.map((spec) => spec.specializationName) || []
      )
    );
    return Array.from(uniqueSpecs);
  }, [lawyers]);

  // Filter lawyers based on current filters
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const matchesSearch = filters.search
        ? lawyer.fullName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          lawyer.specializations?.some((spec) =>
            spec.specializationName
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          )
        : true;

      const matchesLocation =
        filters.location === "all" || !filters.location
          ? true
          : lawyer.location === filters.location;

      const matchesSpecialization =
        filters.specialization === "all" || !filters.specialization
          ? true
          : lawyer.specializations?.some(
              (spec) => spec.specializationName === filters.specialization
            );

      const matchesExperience =
        lawyer.yearsOfExperience >= filters.minExperience;
      const matchesRating = lawyer.averageRating >= filters.minRating;
      const matchesAvailability = filters.availableOnly
        ? lawyer.availableForWork
        : true;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSpecialization &&
        matchesExperience &&
        matchesRating &&
        matchesAvailability
      );
    });
  }, [lawyers, filters]);

  const handleFilterChange = (key: FilterKey, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLawyerClick = (lawyerId: string) => {
    navigate(`/lawyers/${lawyerId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-1">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load lawyers. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Lawyers</h1>
          <p className="text-muted-foreground">
            Find and connect with experienced legal professionals
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 p-6 bg-card rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialization..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Filter */}
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Specialization Filter */}
            <Select
              value={filters.specialization}
              onValueChange={(value) =>
                handleFilterChange("specialization", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Experience Filter */}
            <div className="space-y-2">
              <Label>Minimum Experience: {filters.minExperience} years</Label>
              <Slider
                value={[filters.minExperience]}
                onValueChange={(value) =>
                  handleFilterChange("minExperience", value[0])
                }
                max={50}
                step={1}
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating}</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) =>
                  handleFilterChange("minRating", value[0])
                }
                max={5}
                step={0.1}
              />
            </div>

            {/* Availability Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableOnly"
                checked={filters.availableOnly}
                onCheckedChange={(checked) =>
                  handleFilterChange("availableOnly", checked)
                }
              />
              <Label htmlFor="availableOnly">Available Only</Label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredLawyers.length} of {lawyers.length} lawyers
        </div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <Card
              key={lawyer.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleLawyerClick(lawyer.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{lawyer.fullName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Briefcase className="h-4 w-4" />
                      {lawyer.yearsOfExperience} years of experience
                    </CardDescription>
                  </div>
                  <Badge
                    variant={lawyer.availableForWork ? "default" : "secondary"}
                  >
                    {lawyer.availableForWork ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">
                      {lawyer.averageRating.toFixed(1)} Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{lawyer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{lawyer.email}</span>
                  </div>
                  {lawyer.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{lawyer.phoneNumber}</span>
                    </div>
                  )}
                  {lawyer.specializations &&
                    lawyer.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lawyer.specializations.map((spec) => (
                          <Badge key={spec.specializationId} variant="outline">
                            {spec.specializationName}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full hover:bg-primary/90 transition-colors duration-300">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Lawyers;

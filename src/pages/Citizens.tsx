import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Phone,
  Mail,
  MapPin,
  Search,
  AlertCircle,
  Languages,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
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
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import API from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CitizenDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  languagePreference: string;
  location: string;
}

interface ApiResponse {
  message: string;
  data: CitizenDto[];
}

interface FilterState {
  search: string;
  location: string;
  language: string;
}

type FilterKey = keyof FilterState;
type FilterValue = string;

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 9; // Adjust based on your needs

const Citizens = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL parameters
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "grid"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    language: searchParams.get("language") || "",
  });

  const getAllCitizens = async (): Promise<ApiResponse> => {
    const response = await API.get("/citizens/all");
    return response.data;
  };

  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["citizens"],
    queryFn: getAllCitizens,
    retry: 1,
  });

  const citizens = useMemo(() => response?.data || [], [response?.data]);

  // Get unique locations and languages for filter options
  const locations = useMemo(() => {
    const uniqueLocations = new Set(
      citizens.map((citizen) => citizen.location)
    );
    return Array.from(uniqueLocations);
  }, [citizens]);

  const languages = useMemo(() => {
    const uniqueLanguages = new Set(
      citizens.map((citizen) => citizen.languagePreference)
    );
    return Array.from(uniqueLanguages);
  }, [citizens]);

  // Filter citizens based on current filters
  const filteredCitizens = useMemo(() => {
    return citizens.filter((citizen) => {
      const matchesSearch = filters.search
        ? citizen.fullName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          citizen.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          citizen.id.includes(filters.search)
        : true;

      const matchesLocation =
        filters.location === "all" || !filters.location
          ? true
          : citizen.location === filters.location;

      const matchesLanguage =
        filters.language === "all" || !filters.language
          ? true
          : citizen.languagePreference === filters.language;

      return matchesSearch && matchesLocation && matchesLanguage;
    });
  }, [citizens, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCitizens.length / ITEMS_PER_PAGE);
  const paginatedCitizens = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredCitizens.slice(start, end);
  }, [filteredCitizens, currentPage]);

  // Update URL when filters or pagination changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.language) params.set("language", filters.language);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (viewMode !== "grid") params.set("view", viewMode);

    // Update URL without refreshing the page
    setSearchParams(params);
  }, [filters, currentPage, viewMode, setSearchParams]);

  const handleFilterChange = (key: FilterKey, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
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
              Failed to load citizens. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedCitizens.map((citizen) => (
        <Card
          key={citizen.id}
          className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{citizen.fullName}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Languages className="h-4 w-4" />
                  {citizen.languagePreference}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{citizen.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{citizen.email}</span>
              </div>
              {citizen.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{citizen.phoneNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCitizens.map((citizen) => (
            <TableRow
              key={citizen.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">{citizen.fullName}</TableCell>
              <TableCell>{citizen.languagePreference}</TableCell>
              <TableCell>{citizen.location}</TableCell>
              <TableCell>{citizen.email}</TableCell>
              <TableCell>{citizen.phoneNumber || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Citizens</h1>
          <p className="text-muted-foreground">
            Connect with citizens seeking legal assistance
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 p-6 bg-card rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
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

            {/* Language Filter */}
            <Select
              value={filters.language}
              onValueChange={(value) => handleFilterChange("language", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewModeChange("grid")}
                className="w-10 h-10"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewModeChange("list")}
                className="w-10 h-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count and Search Info */}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedCitizens.length} of {filteredCitizens.length}{" "}
            citizens
          </div>
          {filters.search && (
            <div className="text-sm">
              <Badge variant="outline" className="font-normal">
                Search: {filters.search}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => handleFilterChange("search", "")}
                >
                  ×
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === "grid" ? renderGridView() : renderListView()}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-10 h-10",
                  currentPage === page && "bg-primary text-primary-foreground"
                )}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Citizens;

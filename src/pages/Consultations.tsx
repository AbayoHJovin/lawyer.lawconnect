import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getConsultationsForCitizen,
  ConsultationStatus,
  type ConsultationDto,
} from "@/services/consultationService";
import { getLawyerById } from "@/services/lawyerService";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { FileText, Calendar, User, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const Consultations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | "all">("all");
  const [lawyerFilter, setLawyerFilter] = useState("");

  const {
    data: consultationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["consultations"],
    queryFn: getConsultationsForCitizen,
  });

  const consultations = consultationsData?.data || [];

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const matchesSearch =
        consultation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || consultation.status === statusFilter;

      const matchesLawyer =
        !lawyerFilter ||
        consultation.lawyerID.toLowerCase().includes(lawyerFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesLawyer;
    });
  }, [consultations, searchTerm, statusFilter, lawyerFilter]);

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.COMPLETED:
        return "bg-green-500";
      case ConsultationStatus.ONGOING:
        return "bg-blue-500";
      case ConsultationStatus.ACCEPTED:
        return "bg-yellow-500";
      case ConsultationStatus.PENDING:
        return "bg-gray-500";
      case ConsultationStatus.REJECTED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.COMPLETED:
        return "Completed";
      case ConsultationStatus.ONGOING:
        return "Ongoing";
      case ConsultationStatus.ACCEPTED:
        return "Accepted";
      case ConsultationStatus.PENDING:
        return "Pending";
      case ConsultationStatus.REJECTED:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
            <p className="text-muted-foreground">Your legal consultations</p>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
            <p className="text-muted-foreground">Your legal consultations</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load consultations. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">Your legal consultations</p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by subject or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ConsultationStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ConsultationStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ConsultationStatus.ACCEPTED}>Accepted</SelectItem>
              <SelectItem value={ConsultationStatus.ONGOING}>Ongoing</SelectItem>
              <SelectItem value={ConsultationStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={ConsultationStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by lawyer ID..."
            value={lawyerFilter}
            onChange={(e) => setLawyerFilter(e.target.value)}
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredConsultations.length} of {consultations.length} consultations
        </div>

        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No consultations found</h3>
              <p className="text-muted-foreground text-center mt-2">
                {consultations.length === 0
                  ? "You haven't started any consultations yet. Find a lawyer to get started."
                  : "No consultations match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConsultations.map((consultation) => (
              <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{consultation.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(consultation.createdAt), "PPP")}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(consultation.status)}>
                      {getStatusText(consultation.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="truncate">Lawyer ID: {consultation.lawyerID}</span>
                    </div>
                    <p className="text-sm line-clamp-3">{consultation.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/consultations/${consultation.id}`)}
                  >
                    View Consultation
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Consultations;

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getConsultationById,
  type ConsultationStatus,
} from "@/services/consultationService";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { API_BASE_URL } from "@/config";

const ConsultationDetails = () => {
  const { consultationId } = useParams<{ consultationId: string }>();

  const {
    data: consultationResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: () => getConsultationById(consultationId!),
    enabled: !!consultationId,
  });

  const consultation = consultationResponse?.data;

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "ACCEPTED":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ConsultationStatus) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "ACCEPTED":
        return "Accepted";
      case "PENDING":
        return "Pending";
      case "REJECTED":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "PPP");
    } catch (error) {
      console.error("Invalid date:", timestamp);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Consultation Details
            </h1>
            <p className="text-muted-foreground">
              Loading consultation information...
            </p>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Consultation Details
            </h1>
            <p className="text-muted-foreground">Error loading consultation</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load consultation details. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!consultation) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Consultation Details
            </h1>
            <p className="text-muted-foreground">Consultation not found</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The requested consultation could not be found.
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
          <h1 className="text-3xl font-bold tracking-tight">
            Consultation Details
          </h1>
          <p className="text-muted-foreground">
            Viewing consultation from {formatDate(consultation.createdAt)}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{consultation.subject || "No Subject"}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(consultation.createdAt)}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(consultation.status)}>
                {getStatusText(consultation.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {consultation.description || "No description available"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Lawyer Information</h3>
              <p className="text-sm text-muted-foreground">
                Lawyer ID:Lawyer:{" "}
                        <a
                          href={`${API_BASE_URL}/lawyers/${consultation.lawyerID}`}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          View lawyer profile
                        </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Status History</h3>
              <p className="text-sm text-muted-foreground">
                Current status: {getStatusText(consultation.status)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ConsultationDetails;

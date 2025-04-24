import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getConsultationsForCitizen,
  ConsultationStatus,
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
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

const ConsultationDetails = () => {
  const { consultationId } = useParams();
  const {
    data: consultationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["consultations"],
    queryFn: getConsultationsForCitizen,
  });

  const consultation = consultationsData?.data.find(
    (c) => c.id === consultationId
  );

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
            Viewing consultation from{" "}
            {format(new Date(consultation.createdAt), "PPP")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{consultation.subject}</CardTitle>
                <CardDescription>
                  Created on {format(new Date(consultation.createdAt), "PPP")}
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
                {consultation.description}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Lawyer Information</h3>
              <p className="text-sm text-muted-foreground">
                Lawyer ID: {consultation.lawyerID}
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

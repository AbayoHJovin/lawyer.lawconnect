import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationById,
  deleteConsultation,
  type ConsultationStatus,
} from "@/services/consultationService";
import { getLawyerPhoneNumber } from "@/services/lawyerService";
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
import {
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const ConsultationDetails = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: consultationResponse,
    isLoading: isLoadingConsultation,
    error: consultationError,
  } = useQuery({
    queryKey: ["consultation", consultationId],
    queryFn: () => getConsultationById(consultationId!),
    enabled: !!consultationId,
  });

  const consultation = consultationResponse?.data;

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteConsultation,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Consultation deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      navigate("/consultations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete consultation",
        variant: "destructive",
      });
    },
  });

  const onDeleteConfirm = () => {
    if (consultationId) {
      handleDelete(consultationId);
    }
    setShowDeleteDialog(false);
  };

  const canShowWhatsApp =
    consultation?.status === "COMPLETED" ||
    consultation?.status === "ACCEPTED" ||
    consultation?.status === "ONGOING";

  const {
    data: lawyerPhone,
    isLoading: isLoadingPhone,
    error: phoneError,
  } = useQuery({
    queryKey: ["lawyerPhone", consultation?.lawyerID],
    queryFn: () => getLawyerPhoneNumber(consultation!.lawyerID),
    enabled: !!consultation?.lawyerID && canShowWhatsApp,
  });

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
      case "ONGOING":
        return "bg-purple-500";
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
      case "ONGOING":
        return "Ongoing";
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

  if (isLoadingConsultation) {
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

  if (consultationError) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Consultation Details
            </h1>
            <p className="text-muted-foreground">
              Viewing consultation from {formatDate(consultation.createdAt)}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Consultation"}
          </Button>
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
              <h3 className="text-sm font-medium mb-2">
                Appointed Lawyer Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Lawyer:{" "}
                  <a
                    href={`${API_BASE_URL}/lawyers/${consultation.lawyerID}`}
                    className="text-blue-500 hover:underline"
                  >
                    View lawyer profile
                  </a>
                </p>
                {canShowWhatsApp && (
                  <div className="mt-4">
                    {isLoadingPhone ? (
                      <Skeleton className="h-10 w-40" />
                    ) : phoneError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Failed to load lawyer's contact information.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      lawyerPhone && (
                        <Button
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              `https://wa.me/${lawyerPhone.replace(
                                /[^0-9]/g,
                                ""
                              )}`,
                              "_blank"
                            )
                          }
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat on WhatsApp
                        </Button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Status History</h3>
              <p className="text-sm text-muted-foreground">
                Current status: {getStatusText(consultation.status)}
              </p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                consultation and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ConsultationDetails;

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationById,
  deleteConsultation,
  changeConsultationStatus,
  type ConsultationStatus,
  type ChangeConsultationStatusRequest,
} from "@/services/consultationService";
import { getLawyerPhoneNumber } from "@/services/lawyerService";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const statusTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["ONGOING", "REJECTED"],
  REJECTED: [],
  ONGOING: ["COMPLETED"],
  COMPLETED: [],
};

const ConsultationDetails = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ConsultationStatus | "">("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

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

  const { mutate: handleStatusChange, isPending: isChangingStatus } =
    useMutation({
      mutationFn: (request: ChangeConsultationStatusRequest) =>
        changeConsultationStatus(request),
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Consultation status changed to ${newStatus}`,
        });
        queryClient.invalidateQueries({
          queryKey: ["consultation", consultationId],
        });
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        setNewStatus("");
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "Failed to change consultation status",
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

  const onStatusChange = () => {
    if (!consultationId || !newStatus) return;

    const request: ChangeConsultationStatusRequest = {
      consultationId,
      status: newStatus as ConsultationStatus,
    };

    handleStatusChange(request);
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

  const getStatusIcon = (status: ConsultationStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case "PENDING":
        return <Clock className="h-4 w-4 mr-2" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 mr-2" />;
      case "ONGOING":
        return <RefreshCw className="h-4 w-4 mr-2" />;
      default:
        return null;
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

  const availableTransitions = statusTransitions[consultation.status] || [];
  const canChangeStatus = availableTransitions.length > 0;

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
                Appointed Citizen Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Lawyer:{" "}
                  <a
                    href={`/citizens?search=${consultation.citizenId}`}
                    className="text-blue-500 hover:underline"
                  >
                    View citizen profile
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
              <div className="flex items-center">
                {getStatusIcon(consultation.status)}
                <span className="text-sm text-muted-foreground">
                  Current status: {getStatusText(consultation.status)}
                </span>
              </div>
            </div>
          </CardContent>
          {canChangeStatus && (
            <CardFooter className="flex flex-col items-start gap-4 border-t pt-6">
              <h3 className="text-sm font-medium">Change Status</h3>
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <Select
                  value={newStatus}
                  onValueChange={(value) =>
                    setNewStatus(value as ConsultationStatus)
                  }
                  disabled={isChangingStatus}
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTransitions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={onStatusChange}
                  disabled={isChangingStatus || !newStatus}
                  className="gap-2"
                >
                  {isChangingStatus ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
              {!canChangeStatus && consultation.status !== "PENDING" && (
                <p className="text-xs text-muted-foreground mt-2">
                  This consultation is in a final state and cannot be changed.
                </p>
              )}
            </CardFooter>
          )}
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

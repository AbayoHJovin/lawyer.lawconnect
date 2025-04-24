import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthCheck } from "@/lib/auth";
import {
  getLawyerById,
  getLawyerRatings,
  type LawyerDto,
  type RatingDto,
} from "@/services/lawyerService";
import {
  Card,
  CardContent,
  CardDescription,
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
  Languages,
  FileText,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppSelector } from "@/store";
import BookConsultationModal from "@/components/BookConsultationModal";

const LawyerProfile = () => {
  const { lawyerId } = useParams<{ lawyerId: string }>();
  const navigate = useNavigate();
  const { checkAuth } = useAuthCheck();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: lawyerResponse,
    isLoading: isLoadingLawyer,
    error: lawyerError,
  } = useQuery({
    queryKey: ["lawyer", lawyerId],
    queryFn: () => getLawyerById(lawyerId!),
    enabled: !!lawyerId,
  });

  const {
    data: ratingsResponse,
    isLoading: isLoadingRatings,
    error: ratingsError,
  } = useQuery({
    queryKey: ["lawyer-ratings", lawyerId],
    queryFn: () => getLawyerRatings(lawyerId!),
    enabled: !!lawyerId,
  });

  const lawyer = lawyerResponse?.data;
  const ratings = ratingsResponse?.data || [];

  const handleBookConsultation = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    setIsModalOpen(true);
  };

  if (isLoadingLawyer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-1">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[400px]" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (lawyerError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-1">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load lawyer profile. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-8 flex-1">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The lawyer profile you are looking for does not exist.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lawyer Profile */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{lawyer.fullName}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm">
                  {lawyer.averageRating.toFixed(1)} Rating ({ratings.length}{" "}
                  reviews)
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
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">License: {lawyer.licenseNumber}</span>
              </div>
              {lawyer.specializations && lawyer.specializations.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-medium">Specializations:</h3>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.specializations.map((spec) => (
                      <Badge key={spec.specializationId} variant="outline">
                        {spec.specializationName}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No specializations listed
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-6">
              <Button
                className="w-full"
                disabled={!lawyer.availableForWork}
                onClick={handleBookConsultation}
              >
                {lawyer.availableForWork
                  ? "Book Consultation"
                  : "Not Available for Consultation"}
              </Button>
              {!lawyer.availableForWork && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  This lawyer is currently not accepting new consultations
                </p>
              )}
            </div>
          </Card>

          {/* Ratings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                What clients say about {lawyer.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRatings ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : ratingsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load reviews. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : ratings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  This lawyer hasn't been rated yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.ratingId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {rating.citizenName}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.ratingScore
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rating.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      {lawyer && (
        <BookConsultationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          lawyer={{
            id: lawyer.id,
            fullName: lawyer.fullName,
          }}
        />
      )}
    </div>
  );
};

export default LawyerProfile;

import API from "@/lib/axios";
export interface RatingDto {
  ratingId: string; // UUID
  citizenName: string;
  ratingScore: number;
  reviewText: string;
}

export interface AddRatingRequest {
  lawyerId: string; // UUID
  score: number;
  reviewText: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getLawyerRatings = async (lawyerId: string) => {
  const response = await API.get<ApiResponse<RatingDto[]>>(
    `/citizens/get-all-rating/${lawyerId}`
  );
  return response.data;
};

export const rateLawyer = async (request: AddRatingRequest) => {
const response = await API.post<ApiResponse<void>>(
    "/citizens/cit/rate-lawyer",
    request,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

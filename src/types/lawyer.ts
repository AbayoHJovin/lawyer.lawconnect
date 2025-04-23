export interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  profilePicture: string;
  rating: number;
  reviews: number;
  availability: "available" | "unavailable";
  experience: number;
}

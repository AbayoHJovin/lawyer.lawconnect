import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { rateLawyer } from "@/services/ratingService";

interface RatingFormProps {
  lawyerId: string;
  onSuccess?: () => void;
}

const RatingForm = ({ lawyerId, onSuccess }: RatingFormProps) => {
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: rateLawyer,
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: response.message || "Rating submitted successfully",
      });
      // Reset form
      setScore(0);
      setReviewText("");
      // Invalidate lawyer ratings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["lawyer-ratings", lawyerId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) {
      toast({
        title: "Error",
        description: "Please select a rating score",
        variant: "destructive",
      });
      return;
    }

    submitRating({
      lawyerId,
      score,
      reviewText: reviewText.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Your Rating</label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoveredScore(value)}
              onMouseLeave={() => setHoveredScore(0)}
              onClick={() => setScore(value)}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (hoveredScore || score)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Your Review</label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review here..."
          className="mt-2"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default RatingForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { createConsultation } from "@/services/consultationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BookConsultationModalProps {
  lawyerId: string;
  lawyerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookConsultationModal = ({
  lawyerId,
  lawyerName,
  isOpen,
  onClose,
}: BookConsultationModalProps) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      toast.error("Subject is required");
      return;
    }

    setLoading(true);
    try {
      await createConsultation({
        lawyerId,
        subject,
        description: description || undefined,
      });
      toast.success("Consultation booked successfully!");
      onClose();
      navigate("/consultations");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to book consultation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Consultation with {lawyerName}</DialogTitle>
          <DialogDescription>
            Schedule a consultation with {lawyerName}. Please provide the
            following details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter consultation subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe your legal issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Consultation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookConsultationModal;

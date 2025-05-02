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
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logoutThunk } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import API from "@/lib/axios";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutConfirmModal = ({ isOpen, onClose }: LogoutConfirmModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await API.post("/auth/logout");
      
      // Dispatch the logout action to clear Redux state
      await dispatch(logoutThunk()).unwrap();
      
      // Show success message
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Close the modal
      onClose();

      // Navigate to home page
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You will need to log in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="bg-primary">
            Confirm Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmModal; 
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logoutThunk } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";
import { LawyerDto } from "@/services/lawyerService";
import { useEffect, useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const lawyer = useSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/"); // Redirect to landing page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Current lawyer", lawyer);
  }, [lawyer]);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          LawConnect
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/citizens">
            <Button variant="outline" className="font-semibold">
              Discover Citizens
            </Button>
          </Link>

          {lawyer ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowLogoutModal(true)}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Navbar;

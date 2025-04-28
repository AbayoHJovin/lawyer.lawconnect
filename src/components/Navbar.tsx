import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { logoutThunk } from "@/store/slices/authSlice";
import { useEffect, useState } from "react";
import { getCurrentLawyer, LawyerDto } from "@/services/lawyerService";
import { useQuery } from "@tanstack/react-query";

// Fetch current lawyer and all specializations
// const {
//   data: lawyer,
//   isLoading: isLoadingLawyer,
//   refetch,
// } = useQuery({
//   queryKey: ["currentLawyerProfile"],
//   queryFn: getCurrentLawyer,
//   refetchOnWindowFocus: false,
// });
const Navbar = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [lawyer, setLawyer] = useState<LawyerDto | null>(null);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const lawyer = await getCurrentLawyer();
        setLawyer(lawyer);
        console.log("lawyer", lawyer);
      } catch {
        setLawyer(null);
      }
    };
    fetchLawyer();
  }, []);

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

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Citizen Law Connect
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/lawyers">
            <Button variant="outline" className="font-semibold">
              Discover Lawyers
            </Button>
          </Link>

          {lawyer? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
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
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logoutThunk } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";
import { LawyerDto } from "@/services/lawyerService";
import { useEffect, useState } from "react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, Home, Users, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const lawyer = useSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const mobileNavItems = lawyer
    ? [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Profile", href: "/profile", icon: User },
        { name: "Citizens", href: "/citizens", icon: Users },
        { name: "Consultations", href: "/consultations", icon: FileText },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Sign In", href: "/login", icon: User },
        { name: "Register", href: "/register", icon: User },
      ];

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
        <div className="flex items-center">
          {/* Mobile Menu - Only visible on small screens */}
          <div className="lg:hidden mr-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">LawConnect</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {lawyer && (
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{lawyer.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {lawyer.email}
                        </p>
                      </div>
                    </div>
                  )}
                  <nav className="flex flex-col gap-2">
                    {mobileNavItems.map((item) => (
                      <SheetClose asChild key={item.name}>
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    ))}
                    {lawyer && (
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-3 p-3 rounded-md hover:bg-accent transition-colors"
                        onClick={() => {
                          setShowLogoutModal(true);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </Button>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="text-xl font-bold text-primary">
            LawConnect
          </Link>
        </div>

        {/* Desktop Navigation - Only visible on large screens */}
        <div className="hidden lg:flex items-center gap-4">
          {lawyer && (
            <Link to="/citizens">
              <Button variant="outline" className="font-semibold">
                Discover Citizens
              </Button>
            </Link>
          )}

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

        {/* Mobile Action Button - E.g. Primary CTA for non-desktop */}
        <div className="lg:hidden flex">
          {lawyer ? (
            <Link to="/citizens">
              <Button variant="outline" size="sm">
                Citizens
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
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

import { Link } from "react-router-dom";
import { RootState, useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { LawyerDto } from "@/services/lawyerService";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const Index = () => {
  const lawyer = useAppSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-playfair">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold text-primary">LawConnect Pro</div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary-foreground/10 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/citizens">
              <Button variant="outline" className="font-semibold">
                Browse Network
              </Button>
            </Link>
            {lawyer ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Join as Lawyer</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden ${
            mobileMenuOpen ? "block" : "hidden"
          } border-t`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 shadow-md">
            <Link
              to="/citizens"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Network
            </Link>
            {lawyer ? (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/10 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join as Lawyer
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center py-8 md:py-12">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col space-y-4 w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
              Grow Your Legal Practice
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-[600px] mx-auto md:mx-0">
              Connect with clients, manage consultations, and expand your legal
              practice with our professional platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start">
              <Link to="/citizens" className="w-full sm:w-auto">
                <Button
                  className="font-semibold w-full sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Explore Network
                </Button>
              </Link>
              {lawyer ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Join Now
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
            <div className="w-full max-w-lg h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg bg-gradient-to-br from-primary/20 via-secondary/20 to-primary-foreground/20 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="inline-block p-3 sm:p-5 rounded-full bg-primary/10 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary md:w-12 md:h-12"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Professional Legal Platform
                </h3>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Empowering lawyers to build and manage their practice
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Why Join LawConnect Pro?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Benefits for legal professionals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">1</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                Client Acquisition
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Connect with potential clients and grow your practice through
                our verified network
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">2</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                Practice Management
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Streamline your consultations, case management, and client
                communications
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">3</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2">
                Professional Growth
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Build your reputation, receive client feedback, and showcase
                your expertise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} LawConnect Pro. All rights
                reserved.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-center sm:text-left">
              <Link
                to="/citizens"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-semibold"
              >
                Browse Network
              </Link>
              <Link
                to="/login"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
              >
                Join as Lawyer
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

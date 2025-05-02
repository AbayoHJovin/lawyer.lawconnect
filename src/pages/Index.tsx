import { Link } from "react-router-dom";
import { RootState, useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { LawyerDto } from "@/services/lawyerService";
import { useEffect } from "react";

const Index = () => {
  const lawyer = useAppSelector(
    (state: RootState) => state.auth.user
  ) as LawyerDto | null;

  return (
    <div className="min-h-screen flex flex-col font-playfair">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold text-primary">LawConnect Pro</div>
          <div className="flex items-center gap-4">
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
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center font-playfair">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col space-y-4 md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-playfair">
              Grow Your Legal Practice
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px]">
              Connect with clients, manage consultations, and expand your legal
              practice with our professional platform.
            </p>
            <div className="flex gap-4 mt-4">
              <Link to="/citizens">
                <Button className="font-semibold" size="lg" variant="outline">
                  Explore Network
                </Button>
              </Link>
              {lawyer ? (
                <Link to="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">Join Now</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-lg h-[400px] rounded-lg bg-gradient-to-br from-primary/20 via-secondary/20 to-primary-foreground/20 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="inline-block p-5 rounded-full bg-primary/10 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">
                  Professional Legal Platform
                </h3>
                <p className="text-muted-foreground mt-2">
                  Empowering lawyers to build and manage their practice
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-12 font-playfair">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Why Join LawConnect Pro?</h2>
            <p className="text-muted-foreground mt-2">
              Benefits for legal professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">1</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Client Acquisition</h3>
              <p className="text-muted-foreground">
                Connect with potential clients and grow your practice through
                our verified network
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">2</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Practice Management</h3>
              <p className="text-muted-foreground">
                Streamline your consultations, case management, and client
                communications
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">3</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Professional Growth</h3>
              <p className="text-muted-foreground">
                Build your reputation, receive client feedback, and showcase
                your expertise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background font-playfair">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} LawConnect Pro. All rights
                reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/citizens"
                className="text-sm text-muted-foreground hover:text-foreground font-semibold"
              >
                Browse Network
              </Link>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-muted-foreground hover:text-foreground"
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

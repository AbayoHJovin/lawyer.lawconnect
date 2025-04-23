import { Link } from "react-router-dom";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col font-playfair">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold text-primary">
            Citizen Law Connect
          </div>
          <div className="flex items-center gap-4">
            <Link to="/lawyers">
              <Button variant="outline" className="font-semibold">
                Discover Lawyers
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
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

      {/* Hero Section */}
      <section className="flex-1 flex items-center font-playfair">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col space-y-4 md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-playfair">
              Connect with Legal Experts
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px]">
              Get professional legal advice, manage consultations, and stay
              updated on your cases all in one place.
            </p>
            <div className="flex gap-4 mt-4">
              <Link to="/lawyers">
                <Button className="font-semibold" size="lg" variant="outline">
                  Discover Lawyers
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">Get Started</Button>
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
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Legal Services Platform</h3>
                <p className="text-muted-foreground mt-2">
                  Connecting citizens with qualified lawyers for legal support
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
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">
              Get legal help in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">1</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Create Account</h3>
              <p className="text-muted-foreground">
                Register as a citizen to access legal services and consultations
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">2</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Book Consultations</h3>
              <p className="text-muted-foreground">
                Connect with qualified lawyers for professional legal advice
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full">
                <span className="font-bold text-primary text-xl">3</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Manage Your Cases</h3>
              <p className="text-muted-foreground">
                Track progress, provide ratings, and stay updated on your legal
                matters
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
                © {new Date().getFullYear()} Citizen Law Connect. All rights
                reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/lawyers"
                className="text-sm text-muted-foreground hover:text-foreground font-semibold"
              >
                Discover Lawyers
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
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Citizen Law Connect</h3>
            <p className="text-muted-foreground">
              Connecting citizens with qualified lawyers for professional legal
              support and guidance.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/lawyers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Find Lawyers
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">
                Email: support@lawconnect.com
              </li>
              <li className="text-muted-foreground">Phone: +250 788 123 456</li>
              <li className="text-muted-foreground">
                Location: Kigali, Rwanda
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Citizen Law Connect. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

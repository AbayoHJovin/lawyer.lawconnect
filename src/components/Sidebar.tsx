import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import {
  User,
  FileText,
  Star,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Home,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutConfirmModal from "./LogoutConfirmModal";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Citizens", href: "/citizens", icon: Users },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Consultations", href: "/consultations", icon: FileText },
  ];

  // Responsive sidebar: hidden on mobile, visible on md+
  return (
    <>
      {/* Hamburger for mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="bg-background shadow-md"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-sidebar text-sidebar-foreground z-40 w-64 shadow-lg transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "flex flex-col h-screen"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
            <h2 className="text-xl font-bold">LawConnect</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            >
              <ChevronLeft size={20} />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-sm text-sidebar-foreground/70 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - This section should scroll if needed */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout - This section stays at the bottom */}
          <div className="p-4 border-t border-sidebar-border mt-auto bg-sidebar">
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(true)}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut size={20} />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Sidebar;

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // If on mobile, we always collapse the sidebar
  const sidebarWidth = isMobile ? "hidden" : isCollapsed ? "w-20" : "w-64";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Consultations", href: "/consultations", icon: FileText },
  ];

  useEffect(()=>{
    console.log("user",user);
  },[user])
  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="bg-background shadow-md"
          >
            <Menu size={20} />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground h-screen fixed transition-all duration-300 z-40 shadow-lg",
          sidebarWidth,
          isMobile && !isCollapsed ? "translate-x-0" : "",
          isMobile && isCollapsed ? "-translate-x-full" : ""
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
            {!isCollapsed && <h2 className="text-xl font-bold">LawConnect</h2>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>

          {/* User Info */}
          {!isCollapsed && (
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
          )}

          {/* Navigation */}
          <nav className="flex-1 py-4">
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
                    >
                      <item.icon size={20} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;

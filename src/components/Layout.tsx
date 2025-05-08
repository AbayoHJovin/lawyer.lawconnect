import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          isMobile ? "ml-0" : "ml-64"
        )}
      >
        <div className="container mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

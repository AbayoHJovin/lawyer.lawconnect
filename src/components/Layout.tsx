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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isMobile ? "ml-0" : "ml-0"
        )}
      >
        <div className="container mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

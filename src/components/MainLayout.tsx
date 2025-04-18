
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Home,
  FileText,
  Copyright,
} from "lucide-react";
import ThemeToggler from "./ThemeToggler";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const navigationItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
      allowed: true,
    },
    {
      name: "Activities",
      icon: <Gamepad2 className="h-5 w-5" />,
      href: "/activities",
      allowed: true,
    },
    {
      name: "Revenue",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/revenue",
      allowed: true,
    },
    {
      name: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      allowed: hasPermission(["admin", "developer"]),
    },
    {
      name: "Reports",
      icon: <FileText className="h-5 w-5" />,
      href: "/reports",
      allowed: hasPermission(["admin", "developer", "attendant"]),
    },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside
              className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
                  sidebarOpen ? "w-64" : "w-0 -translate-x-full sm:translate-x-0 sm:w-16"
              } bg-sidebar border-r border-sidebar-border`}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar header with enhanced branding */}
              <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border">
                {sidebarOpen ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-primary-foreground"/>
                      </div>
                      <h2 className="text-xl font-bold text-sidebar-primary text-glow truncate">
                        Game Room
                      </h2>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-primary-foreground"/>
                      </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                >
                  {sidebarOpen ? (
                      <X className="h-5 w-5"/>
                  ) : (
                      <Menu className="h-5 w-5"/>
                  )}
                </Button>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
                {navigationItems
                    .filter((item) => item.allowed)
                    .map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                                location.pathname === item.href
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                            } ${!sidebarOpen && "justify-center px-2"}`}
                        >
                          <span>{item.icon}</span>
                          {sidebarOpen && <span className="ml-3">{item.name}</span>}
                        </Link>
                    ))}
              </nav>

              {/* Theme toggle and user info */}
              <div className="p-4 border-t border-sidebar-border">
                {sidebarOpen && (
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-sidebar-foreground/70 truncate capitalize">
                          {user?.role}
                        </p>
                      </div>
                      <ThemeToggler/>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className={`flex items-center w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive ${
                        !sidebarOpen && "justify-center p-2"
                    }`}
                    onClick={logout}
                >
                  <LogOut className="h-5 w-5"/>
                  {sidebarOpen && <span className="ml-2">Logout</span>}
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main
              className={`flex-1 transition-all duration-300 ${
                  sidebarOpen ? "ml-64" : "ml-0 sm:ml-16"
              }`}
          >
            <div className="p-6 min-h-screen pb-16">{children}</div>
          </main>
        </div>

        {/* Updated CSUDH and Loker Student Union copyright footer */}
        <footer
            className={`border-t border-border bg-background p-4 transition-all duration-300 ${
                sidebarOpen ? "ml-64" : "ml-0 sm:ml-16"
            }`}
        >
          <div className="container flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center">
              <img
                  src="https://lsucsudh.org/wp-content/themes/lokerstudentunion/assets/img/lsu_cobrand.svg"
                  alt="CSUDH | Loker Student Union Logo"
                  className="h-6 md:h-6 object-contain opacity-90"
              />
            </div>
            <div className="flex items-center text-sm text-muted-foreground text-center md:text-left">
              <Copyright className="h-4 w-4 mr-1"/>
              <span>{currentYear} Game Room Management System. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default MainLayout;

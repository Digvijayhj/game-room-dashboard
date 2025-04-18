
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeToggler: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { value: "default", label: "Classic Burgundy" },
    { value: "dark", label: "Dark Mode" },
    { value: "light", label: "Light Mode" },
    { value: "cool", label: "Cool Blue" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-sidebar-foreground hover:text-sidebar-primary"
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value as any)}
            className={theme === t.value ? "bg-primary/10 font-medium" : undefined}
          >
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggler;

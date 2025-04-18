
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "default" | "dark" | "light" | "cool";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    return storedTheme || "default";
  });

  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove(
      "theme-dark",
      "theme-light",
      "theme-cool"
    );
    
    // Apply new theme class if not default
    if (theme !== "default") {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Store theme preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

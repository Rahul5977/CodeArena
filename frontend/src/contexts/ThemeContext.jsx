import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to dark
    const saved = localStorage.getItem("leetlab-theme");
    return saved || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the current theme class
    root.classList.add(theme);

    // Set data-theme for DaisyUI
    root.setAttribute("data-theme", theme === "dark" ? "leetlab" : "leetlabLight");

    // Save to localStorage
    localStorage.setItem("leetlab-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setDarkTheme = () => setTheme("dark");
  const setLightTheme = () => setTheme("light");

  const value = {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggleTheme,
    setDarkTheme,
    setLightTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;

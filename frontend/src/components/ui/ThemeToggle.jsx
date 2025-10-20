import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-dark-bg-secondary dark:bg-dark-bg-secondary border border-dark-border-DEFAULT dark:border-dark-border-DEFAULT hover:bg-dark-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-all duration-200 group"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for dark mode (shows when dark) */}
        <FiSun
          className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-300 ${
            theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`}
        />
        {/* Moon icon for light mode (shows when light) */}
        <FiMoon
          className={`absolute inset-0 w-5 h-5 text-slate-700 transition-all duration-300 ${
            theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

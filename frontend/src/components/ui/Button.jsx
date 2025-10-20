import PropTypes from "prop-types";
import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      loading = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant styles
    const variants = {
      primary:
        "bg-brand-primary text-white hover:bg-teal-600 active:bg-teal-700 focus:ring-brand-primary shadow-md hover:shadow-lg hover:shadow-teal-500/30",
      secondary:
        "bg-dark-bg-secondary dark:bg-dark-bg-secondary text-dark-text-primary dark:text-dark-text-primary border border-dark-border-DEFAULT dark:border-dark-border-DEFAULT hover:bg-dark-bg-tertiary dark:hover:bg-dark-bg-tertiary focus:ring-brand-secondary",
      outline:
        "bg-transparent text-brand-primary dark:text-brand-primary border-2 border-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/20 focus:ring-brand-primary",
      ghost:
        "bg-transparent text-dark-text-secondary dark:text-dark-text-secondary hover:bg-dark-bg-secondary dark:hover:bg-dark-bg-secondary focus:ring-dark-border-DEFAULT",
      danger:
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg hover:shadow-red-500/30",
      success:
        "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg hover:shadow-green-500/30",
    };

    // Size styles
    const sizes = {
      xs: "px-2.5 py-1.5 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-lg",
    };

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "";

    // Icon styles
    const iconSizeMap = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-5 h-5",
    };

    const iconSize = iconSizeMap[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className={`animate-spin ${iconSize} ${iconPosition === "left" ? "mr-2" : "ml-2"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon className={`${iconSize} mr-2`} />}
            {children}
            {Icon && iconPosition === "right" && <Icon className={`${iconSize} ml-2`} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost", "danger", "success"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  className: PropTypes.string,
};

export default Button;

import PropTypes from "prop-types";
import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // Base styles
    const baseStyles =
      "block w-full rounded-lg border bg-dark-bg-secondary dark:bg-dark-bg-secondary text-dark-text-primary dark:text-dark-text-primary placeholder-dark-text-muted dark:placeholder-dark-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent";

    // State styles
    const stateStyles = error
      ? "border-red-500 focus:ring-red-500"
      : "border-dark-border-DEFAULT dark:border-dark-border-DEFAULT hover:border-dark-border-light dark:hover:border-dark-border-light";

    // Size and spacing
    const sizeStyles = Icon
      ? iconPosition === "left"
        ? "pl-10 pr-4 py-2.5"
        : "pl-4 pr-10 py-2.5"
      : isPassword
      ? "pl-4 pr-10 py-2.5"
      : "px-4 py-2.5";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-medium text-dark-text-secondary dark:text-dark-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div
              className={`absolute inset-y-0 ${
                iconPosition === "left" ? "left-0 pl-3" : "right-0 pr-3"
              } flex items-center pointer-events-none`}
            >
              <Icon className="w-5 h-5 text-dark-text-muted dark:text-dark-text-muted" />
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`${baseStyles} ${stateStyles} ${sizeStyles} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-text-muted hover:text-dark-text-secondary dark:text-dark-text-muted dark:hover:text-dark-text-secondary transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-dark-text-muted dark:text-dark-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Input;

import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * StatsCard Component - Displays a single statistic card with icon, value, and subtitle
 * Features: Animated, gradient hover effects, responsive design
 * @param {Object} props - Component props
 * @param {Component} props.icon - React icon component
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Subtitle text
 * @param {string} props.color - Gradient color classes (e.g., "from-blue-500 to-purple-600")
 * @param {number} props.delay - Animation delay in seconds
 */
const StatsCard = ({ icon: Icon, title, value, subtitle, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className="bg-base-200 dark:bg-base-300 rounded-2xl border border-base-300 dark:border-base-content/10 p-6 hover:bg-base-300 dark:hover:bg-base-content/5 transition-all duration-300 shadow-lg hover:shadow-2xl">
        {/* Gradient Background Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${color} rounded-xl mb-4 shadow-lg`}
          >
            <Icon className="text-white text-xl" />
          </div>

          {/* Title */}
          <h3 className="text-base-content/60 text-sm font-medium mb-2">{title}</h3>

          {/* Value */}
          <p className="text-base-content text-3xl font-bold mb-1">{value}</p>

          {/* Subtitle */}
          <p className="text-base-content/50 text-sm">{subtitle}</p>
        </div>

        {/* Glow Effect on Hover */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300 -z-10`}
        />
      </div>
    </motion.div>
  );
};

StatsCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

export default StatsCard;

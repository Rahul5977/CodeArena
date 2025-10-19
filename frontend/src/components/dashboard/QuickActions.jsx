import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiCode, FiBookOpen, FiTrendingUp, FiList } from "react-icons/fi";
import PropTypes from "prop-types";

/**
 * QuickActions Component - Displays quick action buttons for common tasks
 * Features: Animated cards with icons, hover effects, links to key pages
 */
const QuickActions = ({ delay = 0 }) => {
  const actions = [
    {
      title: "Browse Problems",
      description: "Explore coding challenges",
      icon: FiCode,
      color: "from-blue-500 to-cyan-500",
      link: "/problems",
    },
    {
      title: "Study Sheets",
      description: "Curated problem sets",
      icon: FiList,
      color: "from-purple-500 to-pink-500",
      link: "/sheets",
    },
    {
      title: "Practice Playlists",
      description: "Organized learning paths",
      icon: FiBookOpen,
      color: "from-green-500 to-emerald-500",
      link: "/playlists",
    },
    {
      title: "Join Contest",
      description: "Compete with others",
      icon: FiTrendingUp,
      color: "from-orange-500 to-red-500",
      link: "/contests",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Link
            to={action.link}
            className="block bg-base-200 dark:bg-base-300 rounded-xl border border-base-300 dark:border-base-content/10 p-4 hover:bg-base-300 dark:hover:bg-base-content/5 transition-all duration-300 shadow-md hover:shadow-xl group"
          >
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="text-white text-xl" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-base-content font-semibold text-sm">{action.title}</h4>
                <p className="text-base-content/60 text-xs">{action.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

QuickActions.propTypes = {
  delay: PropTypes.number,
};

export default QuickActions;

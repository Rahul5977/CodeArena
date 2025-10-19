import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FiStar, FiCode, FiArrowRight } from "react-icons/fi";

/**
 * RecommendedProblems Component - Displays carousel/grid of recommended problems
 * @param {Object} props - Component props
 * @param {Array} props.problems - Array of recommended problem objects
 * @param {boolean} props.loading - Loading state
 */
const RecommendedProblems = ({ problems, loading = false }) => {
  const navigate = useNavigate();

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty) => {
    const diffLower = difficulty?.toLowerCase() || "";

    if (diffLower.includes("easy")) {
      return "badge-success";
    } else if (diffLower.includes("medium")) {
      return "badge-warning";
    } else if (diffLower.includes("hard")) {
      return "badge-error";
    } else {
      return "badge-ghost";
    }
  };

  /**
   * Handle problem click
   */
  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div className="bg-base-200 dark:bg-base-300 rounded-2xl border border-base-300 dark:border-base-content/10 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
          <FiStar className="text-secondary" />
          Recommended for You
        </h2>
        <button
          onClick={() => navigate("/problems")}
          className="text-sm text-primary hover:text-primary-focus transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-base-100/50 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-base-content/20 rounded w-3/4 mb-3" />
              <div className="h-4 bg-base-content/10 rounded w-1/2 mb-3" />
              <div className="h-3 bg-base-content/10 rounded w-full mb-2" />
              <div className="h-8 bg-base-content/20 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Problems Grid/Carousel */}
          {problems && problems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-base-100/50 rounded-xl p-5 border border-base-300 dark:border-base-content/10 hover:bg-base-100 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleProblemClick(problem.id)}
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Problem Title */}
                    <h3 className="text-base-content font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {problem.title || "Untitled Problem"}
                    </h3>

                    {/* Difficulty Badge */}
                    <div className="mb-3">
                      <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty || "Unknown"}
                      </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {problem.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="badge badge-sm badge-outline">
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="badge badge-sm badge-outline">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Solve Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProblemClick(problem.id);
                      }}
                      className="btn btn-primary btn-sm w-full gap-2 group-hover:scale-105 transition-transform"
                    >
                      <FiCode />
                      Solve Now
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mb-4 opacity-50">
                <FiStar className="text-white text-3xl" />
              </div>
              <h3 className="text-base-content font-semibold text-lg mb-2">
                No recommendations yet
              </h3>
              <p className="text-base-content/60 mb-4 max-w-sm">
                Solve more problems to get personalized recommendations!
              </p>
              <button onClick={() => navigate("/problems")} className="btn btn-primary">
                Browse Problems
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

RecommendedProblems.propTypes = {
  problems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      difficulty: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  loading: PropTypes.bool,
};

RecommendedProblems.defaultProps = {
  problems: [],
  loading: false,
};

export default RecommendedProblems;

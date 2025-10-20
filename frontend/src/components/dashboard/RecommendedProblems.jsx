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
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (diffLower.includes("medium")) {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    } else if (diffLower.includes("hard")) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    } else {
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  /**
   * Handle problem click
   */
  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiStar className="text-yellow-400" />
          Recommended for You
        </h2>
        <button
          onClick={() => navigate("/problems")}
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700/50 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-600 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-600 rounded w-full mb-2" />
              <div className="h-8 bg-slate-600 rounded w-full" />
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
                  className="group relative bg-slate-700/50 rounded-xl p-5 border border-slate-600/50 hover:bg-slate-700/70 hover:border-teal-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleProblemClick(problem.id)}
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Problem Title */}
                    <h3 className="text-white font-semibold text-lg mb-3 line-clamp-2 group-hover:text-teal-400 transition-colors">
                      {problem.title || "Untitled Problem"}
                    </h3>

                    {/* Difficulty Badge */}
                    <div className="mb-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty || "Unknown"}
                      </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {problem.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-md text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2 py-1 rounded-md text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30">
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
                      className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
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
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4 opacity-50">
                <FiStar className="text-white text-3xl" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No recommendations yet</h3>
              <p className="text-slate-400 mb-4 max-w-sm">
                Solve more problems to get personalized recommendations!
              </p>
              <button
                onClick={() => navigate("/problems")}
                className="py-2 px-6 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              >
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

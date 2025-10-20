import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FiCheckCircle, FiXCircle, FiClock, FiCode, FiCalendar } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

/**
 * RecentSubmissions Component - Displays list of recent code submissions
 * @param {Object} props - Component props
 * @param {Array} props.submissions - Array of submission objects
 * @param {boolean} props.loading - Loading state
 */
const RecentSubmissions = ({ submissions, loading = false }) => {
  const navigate = useNavigate();

  /**
   * Get verdict badge color and icon
   */
  const getVerdictDetails = (verdict) => {
    const verdictLower = verdict?.toLowerCase() || "";

    if (verdictLower.includes("accepted") || verdictLower.includes("correct")) {
      return {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: FiCheckCircle,
        text: "Accepted",
      };
    } else if (verdictLower.includes("wrong") || verdictLower.includes("incorrect")) {
      return {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: FiXCircle,
        text: "Wrong Answer",
      };
    } else if (verdictLower.includes("tle") || verdictLower.includes("time limit")) {
      return {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: FiClock,
        text: "Time Limit",
      };
    } else {
      return {
        color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
        icon: FiCode,
        text: verdict || "Unknown",
      };
    }
  };

  /**
   * Format relative time
   */
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  /**
   * Handle submission click
   */
  const handleSubmissionClick = (submission) => {
    if (submission.problemId) {
      navigate(`/problems/${submission.problemId}`);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiCode className="text-teal-400" />
          Recent Submissions
        </h2>
        <button
          onClick={() => navigate("/submissions")}
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700/50 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Submissions List */}
          {submissions && submissions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {submissions.map((submission, index) => {
                const verdictDetails = getVerdictDetails(submission.verdict);
                const VerdictIcon = verdictDetails.icon;

                return (
                  <motion.div
                    key={submission.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => handleSubmissionClick(submission)}
                    className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:bg-slate-700/70 hover:border-teal-500/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side - Problem Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-2 truncate hover:text-teal-400 transition-colors">
                          {submission.problem?.title ||
                            submission.problemTitle ||
                            "Untitled Problem"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {/* Verdict Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${verdictDetails.color}`}
                          >
                            <VerdictIcon className="text-xs" />
                            {verdictDetails.text}
                          </span>

                          {/* Language */}
                          {submission.language && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <FiCode className="text-xs" />
                              {submission.language}
                            </span>
                          )}

                          {/* Execution Time */}
                          {submission.time && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <FiClock className="text-xs" />
                              {submission.time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Timestamp */}
                      <div className="text-right">
                        <p className="text-slate-500 text-xs flex items-center gap-1 whitespace-nowrap">
                          <FiCalendar className="text-xs" />
                          {formatTime(submission.submittedAt || submission.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 opacity-50">
                <FiCode className="text-white text-3xl" />
              </div>
              <h3 className="text-base-content font-semibold text-lg mb-2">No submissions yet</h3>
              <p className="text-base-content/60 mb-4 max-w-sm">
                Start solving problems to see your submission history here!
              </p>
              <button onClick={() => navigate("/problems")} className="btn btn-primary">
                Solve Problem
              </button>
            </motion.div>
          )}
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 100, 100, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 100, 0.5);
        }
      `}</style>
    </div>
  );
};

RecentSubmissions.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      problemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      problem: PropTypes.shape({
        title: PropTypes.string,
      }),
      title: PropTypes.string,
      problemTitle: PropTypes.string,
      verdict: PropTypes.string,
      language: PropTypes.string,
      time: PropTypes.string,
      submittedAt: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
};

RecentSubmissions.defaultProps = {
  submissions: [],
  loading: false,
};

export default RecentSubmissions;

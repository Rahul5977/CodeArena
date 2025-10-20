import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { FiActivity } from "react-icons/fi";

/**
 * ActivityHeatmap Component - Displays coding activity calendar heatmap (like GitHub contribution graph)
 * @param {Object} props - Component props
 * @param {Array} props.activity - Array of activity objects with date and count
 * @param {boolean} props.loading - Loading state
 */
const ActivityHeatmap = ({ activity = [], loading = false }) => {
  // Helper to get color intensity
  const getIntensityColor = (count) => {
    if (count === 0) return "bg-slate-700/30";
    if (count === 1) return "bg-green-500/30";
    if (count === 2) return "bg-green-500/50";
    if (count === 3) return "bg-green-500/70";
    if (count >= 4) return "bg-green-500";
    return "bg-green-500";
  };

  // Generate last 90 days of data
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const activityData = activity?.find((a) => {
        const activityDate = new Date(a.date).toISOString().split("T")[0];
        return activityDate === dateString;
      });
      data.push({
        date: dateString,
        count: activityData?.count || 0,
        displayDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();
  // Group by weeks (7 days per row)
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Calculate stats
  const totalSolved = activity?.reduce((sum, day) => sum + (day.count || 0), 0) || 0;
  const activeDays = activity?.filter((day) => day.count > 0).length || 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <FiActivity className="text-green-400" />
          Your Coding Activity
        </h2>
        <p className="text-slate-400 text-sm">Last 90 days</p>
      </div>
      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-700/50 rounded-lg p-3 animate-pulse">
                <div className="h-3 bg-slate-600 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-600 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="h-32 bg-slate-700/50 rounded-lg animate-pulse" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
              <p className="text-slate-400 text-xs mb-1">Total Solved</p>
              <p className="text-white text-2xl font-bold">{totalSolved}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
              <p className="text-slate-400 text-xs mb-1">Active Days</p>
              <p className="text-white text-2xl font-bold">{activeDays}</p>
            </div>
          </div>
          {/* Heatmap */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {heatmapData.length > 0 ? (
              <div className="space-y-1.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1.5">
                    {week.map((day, dayIndex) => (
                      <motion.div
                        key={`${weekIndex}-${dayIndex}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: (weekIndex * 7 + dayIndex) * 0.01,
                          duration: 0.2,
                        }}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
                        className="group relative"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-sm ${getIntensityColor(
                            day.count
                          )} border border-slate-600/50 transition-all duration-200`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-slate-700">
                          {day.count} {day.count === 1 ? "problem" : "problems"} on{" "}
                          {day.displayDate}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success-focus rounded-full flex items-center justify-center mb-3 opacity-50">
                  <FiActivity className="text-white text-2xl" />
                </div>
                <h3 className="text-base-content font-semibold mb-1">No activity yet</h3>
                <p className="text-base-content/60 text-sm">
                  Start solving to track your progress!
                </p>
              </motion.div>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-content/10">
            <span className="text-base-content/60 text-xs">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-base-content/5 border border-base-content/10" />
              <div className="w-3 h-3 rounded-sm bg-success/30 border border-base-content/10" />
              <div className="w-3 h-3 rounded-sm bg-success/50 border border-base-content/10" />
              <div className="w-3 h-3 rounded-sm bg-success/70 border border-base-content/10" />
              <div className="w-3 h-3 rounded-sm bg-success border border-base-content/10" />
            </div>
            <span className="text-base-content/60 text-xs">More</span>
          </div>
        </>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

ActivityHeatmap.propTypes = {
  activity: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ),
  loading: PropTypes.bool,
};

ActivityHeatmap.defaultProps = {
  activity: [],
  loading: false,
};

export default ActivityHeatmap;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle, BookOpen, TrendingUp, Clock, Star } from "lucide-react";

const SheetCard = ({ sheet }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "HARD":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div
      onClick={() => navigate(`/sheets/${sheet.id}`)}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {sheet.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">{sheet.description}</p>
          </div>

          {/* Access Badge */}
          {sheet.hasAccess ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium ml-4">
              <CheckCircle className="w-3 h-3" />
              <span>Owned</span>
            </div>
          ) : sheet.type === "FREE" ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium ml-4">
              <Star className="w-3 h-3" />
              <span>Free</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium ml-4">
              <Lock className="w-3 h-3" />
              <span>Premium</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
              sheet.difficulty
            )}`}
          >
            {sheet.difficulty}
          </span>
          <span className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-300 text-xs font-medium">
            {sheet.topic}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>{sheet.problemCount || sheet.problemIds?.length || 0} Problems</span>
          </div>
          {sheet.estimatedHours && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{sheet.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if user has access) */}
        {sheet.hasAccess && sheet.progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-medium">
                {sheet.progress.completed}/{sheet.progress.total} ({sheet.progress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                  sheet.progress.percentage
                )}`}
                style={{ width: `${sheet.progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Price (if not owned) */}
        {!sheet.hasAccess && sheet.type === "PREMIUM" && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Price</span>
              <span className="text-2xl font-bold text-white">₹{sheet.price}</span>
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
      </div>
    </div>
  );
};

export default SheetCard;

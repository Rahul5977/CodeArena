import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiRefreshCw, FiUser } from "react-icons/fi";
import { FiCheckCircle, FiTrophy, FiZap, FiList } from "react-icons/fi";
import useAuthStore from "../stores/authStore";
import { useToastContext } from "../contexts/ToastContext";
import apiClient from "../lib/apiClient";

// Dashboard Components
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentSubmissions from "../components/dashboard/RecentSubmissions";
import RecommendedProblems from "../components/dashboard/RecommendedProblems";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";

/**
 * Dashboard Page - Main user dashboard with stats, activity, and recommendations
 * Features:
 * - User statistics cards
 * - Quick action buttons
 * - Recent submissions list
 * - Recommended problems carousel
 * - Activity heatmap (like GitHub contributions)
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { showError } = useToastContext();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    submissions: [],
    recommendedProblems: [],
    activity: [],
  });

  /**
   * Fetch all dashboard data from backend APIs
   */
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all data in parallel
      const [statsRes, submissionsRes, problemsRes] = await Promise.allSettled([
        // User stats (solved count, submissions, streak, rank)
        apiClient.get("/submissions").catch(() => ({ data: { submissions: [] } })),

        // Recent submissions
        apiClient.get("/submissions").catch(() => ({ data: { submissions: [] } })),

        // Get all problems (we'll filter recommended ones client-side for now)
        apiClient.get("/problem").catch(() => ({ data: { problems: [] } })),
      ]);

      // Process stats from submissions
      const submissions =
        submissionsRes.status === "fulfilled" ? submissionsRes.value.data.submissions || [] : [];

      // Calculate stats
      const solvedProblems = new Set(
        submissions
          .filter((s) => s.verdict?.toLowerCase().includes("accepted"))
          .map((s) => s.problemId)
      ).size;

      const totalSubmissions = submissions.length;

      // Calculate streak (simplified - counts recent consecutive days)
      const streak = calculateStreak(submissions);

      // Rank placeholder (would come from contest or leaderboard API)
      const rank = 0;

      // Generate activity data from submissions
      const activity = generateActivityData(submissions);

      // Get recent submissions (last 10)
      const recentSubmissions = submissions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      // Get recommended problems (for now, just get unsolved ones)
      const allProblems =
        problemsRes.status === "fulfilled" ? problemsRes.value.data.problems || [] : [];

      const solvedProblemIds = new Set(
        submissions
          .filter((s) => s.verdict?.toLowerCase().includes("accepted"))
          .map((s) => s.problemId)
      );

      const recommendedProblems = allProblems
        .filter((p) => !solvedProblemIds.has(p.id))
        .slice(0, 6); // Get first 6 unsolved problems

      // Update state
      setDashboardData({
        stats: {
          solvedCount: solvedProblems,
          totalSubmissions,
          streak,
          rank,
        },
        submissions: recentSubmissions,
        recommendedProblems,
        activity,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showError("Error", "Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Calculate current streak from submissions
   */
  const calculateStreak = (submissions) => {
    if (!submissions || submissions.length === 0) return 0;

    const dates = submissions
      .map((s) => new Date(s.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  /**
   * Generate activity heatmap data from submissions
   */
  const generateActivityData = (submissions) => {
    const activityMap = {};

    submissions.forEach((submission) => {
      const date = new Date(submission.createdAt).toISOString().split("T")[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    return Object.entries(activityMap).map(([date, count]) => ({
      date,
      count,
    }));
  };

  /**
   * Fetch data on component mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Generate floating particles
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 4}s`,
    });
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .floating-particle { animation: float 3s ease-in-out infinite; }
        .pulse-bg { animation: pulse 3s ease-in-out infinite; }
        .pulse-bg-delay-1 { animation: pulse 3s ease-in-out infinite; animation-delay: 1s; }
        .pulse-bg-delay-2 { animation: pulse 3s ease-in-out infinite; animation-delay: 0.5s; }
      `}</style>

      {/* Animated background elements - Fixed position to stay behind navbar */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="pulse-bg absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="pulse-bg-delay-1 absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="pulse-bg-delay-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* Floating particles - Fixed position */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-8 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Welcome Message */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-500 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.name || "Coder"}! 👋
                </h1>
                <p className="text-slate-400 text-lg">Ready to continue your coding journey?</p>
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <FiRefreshCw className={`text-xl ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions delay={0.1} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={FiCheckCircle}
              title="Problems Solved"
              value={loading ? "..." : dashboardData.stats?.solvedCount || 0}
              subtitle="Keep it up!"
              color="from-green-500 to-emerald-600"
              delay={0.2}
            />
            <StatsCard
              icon={FiZap}
              title="Current Streak"
              value={loading ? "..." : `${dashboardData.stats?.streak || 0} days`}
              subtitle="Don't break the chain"
              color="from-orange-500 to-red-600"
              delay={0.3}
            />
            <StatsCard
              icon={FiList}
              title="Total Submissions"
              value={loading ? "..." : dashboardData.stats?.totalSubmissions || 0}
              subtitle="All attempts"
              color="from-blue-500 to-cyan-600"
              delay={0.4}
            />
            <StatsCard
              icon={FiTrophy}
              title="Global Rank"
              value={loading ? "..." : dashboardData.stats?.rank || "N/A"}
              subtitle="Your ranking"
              color="from-purple-500 to-pink-600"
              delay={0.5}
            />
          </div>

          {/* Two Column Layout: Recent Submissions & Recommended Problems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Submissions */}
            <RecentSubmissions submissions={dashboardData.submissions} loading={loading} />

            {/* Activity Heatmap */}
            <ActivityHeatmap activity={dashboardData.activity} loading={loading} />
          </div>

          {/* Recommended Problems (Full Width) */}
          <div className="mb-8">
            <RecommendedProblems problems={dashboardData.recommendedProblems} loading={loading} />
          </div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-8"
          >
            <p className="text-slate-400">💡 Keep practicing every day to improve your skills!</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

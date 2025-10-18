import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCode,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiBook,
  FiPlayCircle,
  FiFileText,
  FiActivity,
} from "react-icons/fi";
import useAuthStore from "../stores/authStore";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useAuthStore();

  const stats = [
    { icon: FiCode, label: "Problems Solved", value: "0", color: "from-blue-500 to-cyan-500" },
    { icon: FiTarget, label: "Success Rate", value: "0%", color: "from-green-500 to-emerald-500" },
    { icon: FiAward, label: "Contests Joined", value: "0", color: "from-purple-500 to-pink-500" },
    {
      icon: FiTrendingUp,
      label: "Current Streak",
      value: "0 days",
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    {
      title: "Browse Problems",
      description: "Explore 1000+ coding problems",
      icon: FiCode,
      link: "/problems",
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "Join Contest",
      description: "Compete with developers worldwide",
      icon: FiAward,
      link: "/contests",
      color: "from-purple-600 to-purple-400",
    },
    {
      title: "Study Playlists",
      description: "Follow curated learning paths",
      icon: FiPlayCircle,
      link: "/playlists",
      color: "from-green-600 to-green-400",
    },
    {
      title: "Practice Sheets",
      description: "Master topics with problem sheets",
      icon: FiFileText,
      link: "/sheets",
      color: "from-orange-600 to-orange-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-3">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {user?.name}!
              </span>
            </h1>
            <p className="text-xl text-gray-400">Ready to sharpen your coding skills today?</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="text-2xl text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  >
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:shadow-lg transition-all`}
                    >
                      <action.icon className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity & Featured Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FiActivity className="text-blue-400" />
                Recent Activity
              </h3>
              <div className="text-center py-12">
                <FiActivity className="text-5xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recent activity yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start solving problems to see your activity here
                </p>
              </div>
            </motion.div>

            {/* Featured Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FiBook className="text-purple-400" />
                Featured Learning Path
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Data Structures Fundamentals
                  </h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Master arrays, linked lists, stacks, and queues
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">50 Problems • 3 weeks</span>
                    <Link
                      to="/playlists"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl border border-green-500/30">
                  <h4 className="text-lg font-semibold text-white mb-2">Algorithm Mastery</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Learn sorting, searching, and optimization
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">75 Problems • 4 weeks</span>
                    <Link
                      to="/playlists"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Start Coding?</h2>
            <p className="text-gray-100 mb-6">
              Challenge yourself with problems ranging from easy to expert level
            </p>
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FiCode />
              Browse Problems
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;

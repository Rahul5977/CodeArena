import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCheckCircle, FiClock, FiPlay, FiLock } from "react-icons/fi";
import { useToastContext } from "../../contexts/ToastContext";
import apiClient from "../../lib/apiClient";

const SheetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const [sheet, setSheet] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheetDetails = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await apiClient.get(`/sheets/${id}`);
        // setSheet(response.data.sheet);
        // setProblems(response.data.problems);

        // Mock data for now
        setSheet({
          id,
          title: "Blind 75 - Must Do Coding Questions",
          description: "A curated list of 75 must-do coding questions for interview preparation",
          totalProblems: 75,
          solvedProblems: 23,
          difficulty: "Mixed",
          estimatedTime: "3-4 weeks",
        });

        setProblems([
          { id: 1, title: "Two Sum", difficulty: "Easy", status: "solved" },
          { id: 2, title: "Add Two Numbers", difficulty: "Medium", status: "solved" },
          {
            id: 3,
            title: "Longest Substring Without Repeating Characters",
            difficulty: "Medium",
            status: "unsolved",
          },
          { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", status: "unsolved" },
          { id: 5, title: "Container With Most Water", difficulty: "Medium", status: "solved" },
        ]);
      } catch (error) {
        console.error("Failed to fetch sheet details:", error);
        showError("Error", "Failed to load sheet details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSheetDetails();
    }
  }, [id]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "hard":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "solved":
        return <FiCheckCircle className="text-green-400" />;
      case "attempted":
        return <FiClock className="text-yellow-400" />;
      default:
        return <FiLock className="text-slate-400" />;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
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

      {/* Animated background elements - Fixed position */}
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

      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/sheets")}
              className="mb-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft size={18} />
              Back to Sheets
            </button>

            {sheet && (
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {sheet.title}
                </h1>
                <p className="text-gray-400 mb-6">{sheet.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Total Problems</div>
                    <div className="text-2xl font-bold text-white">{sheet.totalProblems}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Solved</div>
                    <div className="text-2xl font-bold text-teal-400">{sheet.solvedProblems}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Progress</div>
                    <div className="text-2xl font-bold text-pink-400">
                      {Math.round((sheet.solvedProblems / sheet.totalProblems) * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Est. Time</div>
                    <div className="text-2xl font-bold text-white">{sheet.estimatedTime}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Problems List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Problems</h2>
              <div className="space-y-2">
                {problems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    className="bg-slate-800/50 hover:bg-slate-800/70 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:border-teal-500/30 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getStatusIcon(problem.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors">
                            {problem.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                        <FiPlay className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SheetDetail;

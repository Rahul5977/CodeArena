import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiList, FiCheckCircle, FiClock, FiTrendingUp, FiStar, FiArrowRight } from "react-icons/fi";
import { useToastContext } from "../../contexts/ToastContext";
import apiClient from "../../lib/apiClient";

const SheetList = () => {
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await apiClient.get("/sheets");
        // setSheets(response.data.sheets);

        // Mock data for now
        setSheets([
          {
            id: "1",
            title: "Blind 75",
            description: "A curated list of 75 must-do coding questions for interview preparation",
            totalProblems: 75,
            solvedProblems: 23,
            difficulty: "Mixed",
            icon: "🔥",
            color: "from-orange-500 to-red-500",
          },
          {
            id: "2",
            title: "NeetCode 150",
            description: "150 essential LeetCode problems for coding interviews",
            totalProblems: 150,
            solvedProblems: 45,
            difficulty: "Mixed",
            icon: "⚡",
            color: "from-teal-500 to-cyan-500",
          },
          {
            id: "3",
            title: "Top Interview Questions",
            description: "Most frequently asked coding questions in tech interviews",
            totalProblems: 100,
            solvedProblems: 12,
            difficulty: "Mixed",
            icon: "🎯",
            color: "from-purple-500 to-pink-500",
          },
          {
            id: "4",
            title: "Dynamic Programming",
            description: "Master dynamic programming with this comprehensive problem set",
            totalProblems: 60,
            solvedProblems: 8,
            difficulty: "Hard",
            icon: "🧠",
            color: "from-blue-500 to-indigo-500",
          },
          {
            id: "5",
            title: "Graphs & Trees",
            description: "Essential graph and tree algorithms for interview success",
            totalProblems: 50,
            solvedProblems: 15,
            difficulty: "Medium",
            icon: "🌳",
            color: "from-green-500 to-emerald-500",
          },
          {
            id: "6",
            title: "Arrays & Strings",
            description: "Fundamental array and string manipulation problems",
            totalProblems: 40,
            solvedProblems: 30,
            difficulty: "Easy",
            icon: "📝",
            color: "from-yellow-500 to-orange-500",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch sheets:", error);
        showError("Error", "Failed to load problem sheets");
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Problem Sheets
            </h1>
            <p className="text-gray-400">
              Curated collections of problems to help you master coding interviews
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <FiList className="text-white text-2xl" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Total Sheets</div>
                  <div className="text-white text-2xl font-bold">{sheets.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Problems Solved</div>
                  <div className="text-white text-2xl font-bold">
                    {sheets.reduce((acc, sheet) => acc + sheet.solvedProblems, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-white text-2xl" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Total Problems</div>
                  <div className="text-white text-2xl font-bold">
                    {sheets.reduce((acc, sheet) => acc + sheet.totalProblems, 0)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map((sheet, index) => {
              const progress = Math.round((sheet.solvedProblems / sheet.totalProblems) * 100);

              return (
                <motion.div
                  key={sheet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(`/sheets/${sheet.id}`)}
                  className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl cursor-pointer hover:border-teal-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{sheet.icon}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiClock />
                      <span>{sheet.difficulty}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                    {sheet.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{sheet.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${sheet.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      {sheet.solvedProblems} / {sheet.totalProblems} solved
                    </div>
                    <div className="flex items-center gap-2 text-teal-400 group-hover:gap-3 transition-all">
                      <span>Start</span>
                      <FiArrowRight />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SheetList;

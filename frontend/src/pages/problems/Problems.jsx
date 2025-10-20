import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiClock,
  FiCode,
  FiLayers,
  FiStar,
  FiBookmark,
  FiPlay,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import api from "../../utils/api";
import { useToastContext } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const { showError } = useToastContext();

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/problems/get-all-problems");

      if (response.data.success && response.data.problems) {
        // Transform backend data to match frontend structure
        const transformedProblems = response.data.problems.map((problem) => ({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase(), // EASY -> Easy
          category: problem.tags?.[0] || "General",
          acceptance: 0, // TODO: Calculate from submissions
          description: problem.description,
          likes: 0, // TODO: Get from backend
          dislikes: 0, // TODO: Get from backend
          solved: false, // TODO: Get from user's solved problems
          bookmarked: false, // TODO: Get from user's bookmarks
          companies: [], // TODO: Get from backend
          tags: Array.isArray(problem.tags) ? problem.tags : [],
        }));
        setProblems(transformedProblems);
      } else {
        showError("Error", "Failed to load problems");
        setProblems([]);
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      showError("Error", error.response?.data?.message || "Failed to load problems");
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-success";
      case "medium":
        return "text-warning";
      case "hard":
        return "text-error";
      default:
        return "text-base-content";
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "hard":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || problem.category === categoryFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "solved" && problem.solved) ||
      (statusFilter === "unsolved" && !problem.solved) ||
      (statusFilter === "bookmarked" && problem.bookmarked);
    const matchesSearch = !search || problem.title.toLowerCase().includes(search.toLowerCase());

    return matchesDifficulty && matchesCategory && matchesStatus && matchesSearch;
  });

  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
    solved: problems.filter((p) => p.solved).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading problems...</p>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="pulse-bg absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="pulse-bg-delay-1 absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="pulse-bg-delay-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
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

        <div className="relative z-10 space-y-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-500 bg-clip-text text-transparent">
                Problems
              </h1>
              <p className="text-slate-400 mt-2">Sharpen your skills with coding challenges</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl p-4 hover:bg-slate-800/70 hover:border-teal-500/30 transition-all">
              <div className="text-xs text-slate-400 mb-1">Total</div>
              <div className="text-2xl text-white font-bold">{stats.total}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl p-4 hover:bg-slate-800/70 hover:border-green-500/30 transition-all">
              <div className="text-xs text-slate-400 mb-1">Easy</div>
              <div className="text-2xl text-green-400 font-bold">{stats.easy}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl p-4 hover:bg-slate-800/70 hover:border-yellow-500/30 transition-all">
              <div className="text-xs text-slate-400 mb-1">Medium</div>
              <div className="text-2xl text-yellow-400 font-bold">{stats.medium}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl p-4 hover:bg-slate-800/70 hover:border-red-500/30 transition-all">
              <div className="text-xs text-slate-400 mb-1">Hard</div>
              <div className="text-2xl text-red-400 font-bold">{stats.hard}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl p-4 hover:bg-slate-800/70 hover:border-teal-500/30 transition-all">
              <div className="text-xs text-slate-400 mb-1">Solved</div>
              <div className="text-2xl text-teal-400 font-bold">{stats.solved}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === "search" ? "text-teal-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white text-sm outline-none transition-all placeholder-slate-400 ${
                      focusedField === "search"
                        ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                        : "border-slate-600"
                    }`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setFocusedField("search")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-300 ${
                      focusedField === "search" ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <select
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm outline-none transition-all hover:border-teal-500 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Category Filter */}
              <select
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm outline-none transition-all hover:border-teal-500 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Array">Array</option>
                <option value="String">String</option>
                <option value="Tree">Tree</option>
                <option value="Graph">Graph</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
              </select>

              {/* Status Filter */}
              <select
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm outline-none transition-all hover:border-teal-500 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
                <option value="bookmarked">Bookmarked</option>
              </select>
            </div>
          </div>

          {/* Problems List */}
          <div className="space-y-4">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-6 hover:shadow-2xl hover:border-teal-500/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  {/* Problem Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {problem.solved ? (
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <FiCheck className="text-white text-sm" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-slate-600 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <RouterLink
                            to={`/problems/${problem.id}`}
                            className="font-semibold text-lg text-white hover:text-teal-400 transition-colors"
                          >
                            {problem.title}
                          </RouterLink>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              problem.difficulty === "Easy"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : problem.difficulty === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                          {problem.bookmarked && <FiBookmark className="text-yellow-400" />}
                        </div>

                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {problem.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <FiTrendingUp className="text-teal-400" />
                            <span>{problem.acceptance}% acceptance</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <FiStar className="text-teal-400" />
                            <span>{problem.likes}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <FiLayers className="text-teal-400" />
                            <span>{problem.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <RouterLink to={`/problems/${problem.id}`}>
                      <button className="group px-4 py-2 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-lg">
                        <FiPlay className="w-4 h-4" />
                        Solve
                        <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </RouterLink>
                  </div>
                </div>
              </div>
            ))}

            {filteredProblems.length === 0 && (
              <div className="text-center py-16 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl">
                <FiCode className="mx-auto text-5xl text-slate-600 mb-4" />
                <p className="text-lg text-slate-400">
                  {search || difficultyFilter || categoryFilter || statusFilter
                    ? "No problems found matching your criteria"
                    : "No problems available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Problems;

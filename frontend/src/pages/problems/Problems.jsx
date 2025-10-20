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
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent">
            Problems
          </h1>
          <p className="text-slate-400 mt-1">Sharpen your skills with coding challenges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat bg-slate-800/50 border border-slate-700/50 shadow-lg rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
          <div className="stat-title text-xs text-slate-400">Total</div>
          <div className="stat-value text-2xl text-white">{stats.total}</div>
        </div>
        <div className="stat bg-slate-800/50 border border-slate-700/50 shadow-lg rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
          <div className="stat-title text-xs text-slate-400">Easy</div>
          <div className="stat-value text-2xl text-success">{stats.easy}</div>
        </div>
        <div className="stat bg-slate-800/50 border border-slate-700/50 shadow-lg rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
          <div className="stat-title text-xs text-slate-400">Medium</div>
          <div className="stat-value text-2xl text-warning">{stats.medium}</div>
        </div>
        <div className="stat bg-slate-800/50 border border-slate-700/50 shadow-lg rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
          <div className="stat-title text-xs text-slate-400">Hard</div>
          <div className="stat-value text-2xl text-error">{stats.hard}</div>
        </div>
        <div className="stat bg-slate-800/50 border border-slate-700/50 shadow-lg rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
          <div className="stat-title text-xs text-slate-400">Solved</div>
          <div className="stat-value text-2xl text-teal-400">{stats.solved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-slate-800/50 border border-slate-700/50 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered w-full pl-10 bg-slate-900/50 border-slate-600 focus:border-teal-500 text-white placeholder-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <select
              className="select select-bordered w-full lg:w-auto bg-slate-900/50 border-slate-600 focus:border-teal-500 text-white"
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
              className="select select-bordered w-full lg:w-auto bg-slate-900/50 border-slate-600 focus:border-teal-500 text-white"
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
              className="select select-bordered w-full lg:w-auto bg-slate-900/50 border-slate-600 focus:border-teal-500 text-white"
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
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="card bg-slate-800/50 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-teal-500/30 hover:bg-slate-800/70 transition-all"
          >
            <div className="card-body">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Problem Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {problem.solved ? (
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
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
                          className="link link-hover font-semibold text-lg text-white hover:text-teal-400 transition-colors"
                        >
                          {problem.title}
                        </RouterLink>
                        <span
                          className={`badge ${getDifficultyBadge(problem.difficulty)} badge-sm`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.bookmarked && <FiBookmark className="text-warning" />}
                      </div>

                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {problem.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <FiTrendingUp />
                          <span>{problem.acceptance}% acceptance</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <FiStar />
                          <span>{problem.likes}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <FiLayers />
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
                        className="badge badge-outline badge-sm text-teal-400 border-teal-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <RouterLink to={`/problems/${problem.id}`}>
                    <Button variant="primary" size="sm" leftIcon={<FiPlay />}>
                      Solve
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <FiCode className="mx-auto text-4xl text-slate-600 mb-4" />
            <p className="text-lg text-slate-400">
              {search || difficultyFilter || categoryFilter || statusFilter
                ? "No problems found matching your criteria"
                : "No problems available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;

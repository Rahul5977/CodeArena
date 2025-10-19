import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiCode,
  FiUser,
  FiBook,
  FiTrendingUp,
  FiFilter,
  FiSearch,
  FiPlus,
  FiHeart,
  FiBookOpen,
  FiStar,
  FiClock,
  FiTarget,
  FiAward,
  FiMoreVertical,
  FiPlayCircle,
} from "react-icons/fi";
import { BiSolidCircle, BiCircle, BiLock, BiCrown } from "react-icons/bi";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useToastContext } from "../contexts/ToastContext";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const { user } = useAuth();
  const { showError, showSuccess } = useToastContext();

  // Mock data for demonstration (replace with API calls later)
  const [dashboardStats] = useState({
    problemsSolved: 142,
    contestRank: 1524,
    streak: 12,
    sheetsCompleted: 8,
  });

  const [problems] = useState([
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      acceptance: "49.2%",
      tags: ["Array", "Hash Table"],
      solved: true,
      liked: true,
      description: "Find two numbers that add up to target",
    },
    {
      id: 2,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      acceptance: "33.8%",
      tags: ["Hash Table", "String", "Sliding Window"],
      solved: false,
      liked: false,
      description: "Find the length of the longest substring without repeating characters",
    },
    {
      id: 3,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      acceptance: "35.4%",
      tags: ["Array", "Binary Search", "Divide and Conquer"],
      solved: false,
      liked: true,
      description: "Find median of two sorted arrays in O(log(m+n)) time",
    },
    {
      id: 4,
      title: "Valid Parentheses",
      difficulty: "Easy",
      acceptance: "40.1%",
      tags: ["String", "Stack"],
      solved: true,
      liked: false,
      description: "Determine if parentheses string is valid",
    },
    {
      id: 5,
      title: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      acceptance: "54.1%",
      tags: ["Array", "Dynamic Programming"],
      solved: false,
      liked: true,
      description: "Find maximum profit from buying and selling stock",
    },
  ]);

  const [playlists] = useState([
    {
      id: 1,
      title: "Blind 75",
      description: "Must-do problems for coding interviews",
      problems: 75,
      completed: 23,
      difficulty: "Mixed",
      isPremium: false,
      author: "LeetCode",
      tags: ["Interview", "Popular"],
    },
    {
      id: 2,
      title: "Dynamic Programming Patterns",
      description: "Master DP with these curated problems",
      problems: 50,
      completed: 12,
      difficulty: "Medium-Hard",
      isPremium: true,
      author: "LeetLab",
      tags: ["DP", "Patterns"],
    },
    {
      id: 3,
      title: "Graph Algorithms",
      description: "Essential graph problems and algorithms",
      problems: 30,
      completed: 8,
      difficulty: "Medium",
      isPremium: false,
      author: "Community",
      tags: ["Graph", "Algorithms"],
    },
  ]);

  const [userPlaylists] = useState([
    {
      id: 4,
      title: "My Interview Prep",
      description: "Personal collection for FAANG prep",
      problems: 25,
      completed: 15,
      isPrivate: true,
      author: "You",
    },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
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

  const getDifficultyBadgeColor = (difficulty) => {
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
    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Solved" && problem.solved) ||
      (selectedFilter === "Unsolved" && !problem.solved) ||
      problem.difficulty === selectedFilter;

    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleAddToPlaylist = (problemId, playlistId) => {
    showSuccess("Success", "Problem added to playlist!");
    setShowAddToPlaylist(null);
  };

  const handleCreatePlaylist = (playlistData) => {
    showSuccess("Success", "Playlist created successfully!");
    setShowCreatePlaylist(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-box">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="avatar mb-4">
              <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`
                  }
                  alt={user?.name}
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {user?.name}!
            </h1>
            <p className="py-2 text-base-content/70">
              Continue your coding journey and master algorithms
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats shadow-lg bg-gradient-to-br from-success/10 to-success/5">
          <div className="stat place-items-center">
            <div className="stat-figure text-success">
              <FiTarget size={24} />
            </div>
            <div className="stat-title">Solved</div>
            <div className="stat-value text-success text-2xl">{dashboardStats.problemsSolved}</div>
          </div>
        </div>

        <div className="stats shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="stat place-items-center">
            <div className="stat-figure text-primary">
              <FiAward size={24} />
            </div>
            <div className="stat-title">Rank</div>
            <div className="stat-value text-primary text-2xl">#{dashboardStats.contestRank}</div>
          </div>
        </div>

        <div className="stats shadow-lg bg-gradient-to-br from-warning/10 to-warning/5">
          <div className="stat place-items-center">
            <div className="stat-figure text-warning">
              <FiClock size={24} />
            </div>
            <div className="stat-title">Streak</div>
            <div className="stat-value text-warning text-2xl">{dashboardStats.streak}</div>
          </div>
        </div>

        <div className="stats shadow-lg bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="stat place-items-center">
            <div className="stat-figure text-secondary">
              <FiBookOpen size={24} />
            </div>
            <div className="stat-title">Sheets</div>
            <div className="stat-value text-secondary text-2xl">
              {dashboardStats.sheetsCompleted}
            </div>
          </div>
        </div>
      </div>

      {/* DSA Sheets & Playlists Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">DSA Sheets & Playlists</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreatePlaylist(true)}>
            <FiPlus className="mr-2" />
            Create Playlist
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="card-title text-lg">{playlist.title}</h3>
                    {playlist.isPremium && <BiCrown className="text-warning" />}
                  </div>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                      <FiMoreVertical />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
                    >
                      <li>
                        <a>View Details</a>
                      </li>
                      <li>
                        <a>Add to Favorites</a>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-base-content/70 mb-4">{playlist.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {playlist.tags?.map((tag, index) => (
                    <span key={index} className="badge badge-outline badge-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progress: {playlist.completed}/{playlist.problems}
                    </span>
                    <span className="font-medium">
                      {Math.round((playlist.completed / playlist.problems) * 100)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={playlist.completed}
                    max={playlist.problems}
                  ></progress>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-base-content/50">by {playlist.author}</span>
                    <RouterLink to={`/playlists/${playlist.id}`} className="btn btn-primary btn-sm">
                      <FiPlayCircle className="mr-1" />
                      Continue
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {userPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-accent"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title text-lg">{playlist.title}</h3>
                  <div className="badge badge-accent badge-sm">Personal</div>
                </div>

                <p className="text-sm text-base-content/70 mb-4">{playlist.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progress: {playlist.completed}/{playlist.problems}
                    </span>
                    <span className="font-medium">
                      {Math.round((playlist.completed / playlist.problems) * 100)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-accent w-full"
                    value={playlist.completed}
                    max={playlist.problems}
                  ></progress>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-base-content/50">
                      {playlist.isPrivate ? "Private" : "Public"}
                    </span>
                    <RouterLink to={`/playlists/${playlist.id}`} className="btn btn-accent btn-sm">
                      <FiPlayCircle className="mr-1" />
                      Continue
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problems Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Practice Problems</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search problems..."
                className="input input-bordered pl-10 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-outline">
                <FiFilter className="mr-2" />
                {selectedFilter}
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
              >
                {["All", "Easy", "Medium", "Hard", "Solved", "Unsolved"].map((filter) => (
                  <li key={filter}>
                    <a onClick={() => setSelectedFilter(filter)}>{filter}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="card-body">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center">
                      {problem.solved ? (
                        <BiSolidCircle className="text-success text-lg" />
                      ) : (
                        <BiCircle className="text-base-content/30 text-lg" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <RouterLink
                          to={`/problems/${problem.id}`}
                          className="link link-hover font-semibold text-lg"
                        >
                          {problem.id}. {problem.title}
                        </RouterLink>
                        <button
                          className={`btn btn-ghost btn-xs ${
                            problem.liked ? "text-error" : "text-base-content/50"
                          }`}
                          onClick={() => {
                            /* Toggle like */
                          }}
                        >
                          <FiHeart className={problem.liked ? "fill-current" : ""} />
                        </button>
                      </div>

                      <p className="text-sm text-base-content/70 mb-3">{problem.description}</p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-base-content/50">
                          {problem.acceptance} acceptance
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.map((tag, index) => (
                            <span key={index} className="badge badge-outline badge-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-outline btn-sm">
                        <FiPlus className="mr-1" />
                        Add to Playlist
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48"
                      >
                        <li className="menu-title">
                          <span>Your Playlists</span>
                        </li>
                        {userPlaylists.map((playlist) => (
                          <li key={playlist.id}>
                            <a onClick={() => handleAddToPlaylist(problem.id, playlist.id)}>
                              {playlist.title}
                            </a>
                          </li>
                        ))}
                        <li>
                          <a onClick={() => setShowCreatePlaylist(true)}>
                            <FiPlus className="mr-2" />
                            Create New Playlist
                          </a>
                        </li>
                      </ul>
                    </div>

                    <RouterLink to={`/problems/${problem.id}`} className="btn btn-primary btn-sm">
                      Solve
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <FiCode className="mx-auto text-4xl text-base-content/30 mb-4" />
            <p className="text-lg text-base-content/50">No problems found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <CreatePlaylistModal
          onClose={() => setShowCreatePlaylist(false)}
          onSave={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

// Create Playlist Modal Component
const CreatePlaylistModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPrivate: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Playlist</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Playlist Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Private Playlist</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
            </label>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

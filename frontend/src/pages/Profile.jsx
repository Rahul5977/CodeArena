import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToastContext } from "../contexts/ToastContext";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiEdit2,
  FiSave,
  FiX,
  FiCamera,
  FiTrendingUp,
  FiCode,
  FiTarget,
  FiAward,
  FiClock,
} from "react-icons/fi";
import api from "../utils/api";

const Profile = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
  });

  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    ranking: 0,
    contestsParticipated: 0,
    badges: [],
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/users/stats");
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        // Mock data for demonstration
        setStats({
          totalSolved: 147,
          easySolved: 65,
          mediumSolved: 72,
          hardSolved: 10,
          totalSubmissions: 234,
          acceptanceRate: 62.8,
          currentStreak: 7,
          maxStreak: 23,
          ranking: 1247,
          contestsParticipated: 12,
          badges: ["Problem Solver", "Contest Participant", "Daily Coder"],
        });
      }
    } catch (error) {
      // Mock data for demonstration
      setStats({
        totalSolved: 147,
        easySolved: 65,
        mediumSolved: 72,
        hardSolved: 10,
        totalSubmissions: 234,
        acceptanceRate: 62.8,
        currentStreak: 7,
        maxStreak: 23,
        ranking: 1247,
        contestsParticipated: 12,
        badges: ["Problem Solver", "Contest Participant", "Daily Coder"],
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put("/users/profile", profileData);
      if (response.data.success) {
        showSuccess("Success", "Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      showError("Update Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original user data
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
      });
    }
  };

  if (!user) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-base-content/70 mt-1">Manage your account and track your progress</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
              <FiEdit2 className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`btn btn-success btn-sm ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                <FiSave className="mr-2" />
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-outline btn-sm">
                <FiX className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Basic Information</h2>

              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="avatar">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 btn btn-circle btn-xs btn-primary">
                      <FiCamera size={12} />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-base-content/70">{user.email}</p>
                  <p className="text-sm text-base-content/50">
                    Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiUser />
                      Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiMail />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>

                {/* Location */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiMapPin />
                      Location
                    </span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>

                {/* Website */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiUser />
                      Website
                    </span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="textarea textarea-bordered h-24 resize-none"
                  disabled={!isEditing}
                />
              </div>

              {/* Social Links */}
              <div className="divider">Social Links</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiGithub />
                      GitHub
                    </span>
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={profileData.github}
                    onChange={handleInputChange}
                    placeholder="github.com/username"
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiLinkedin />
                      LinkedIn
                    </span>
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/username"
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FiTwitter />
                      Twitter
                    </span>
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={profileData.twitter}
                    onChange={handleInputChange}
                    placeholder="twitter.com/username"
                    className="input input-bordered"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Problem Solving Stats */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4 flex items-center gap-2">
                <FiCode />
                Problem Solving
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Solved</span>
                  <span className="font-bold text-lg">{stats.totalSolved}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-success">Easy</span>
                    <span>{stats.easySolved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warning">Medium</span>
                    <span>{stats.mediumSolved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-error">Hard</span>
                    <span>{stats.hardSolved}</span>
                  </div>
                </div>

                <div className="divider my-3"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Acceptance Rate</span>
                  <span className="font-bold">{stats.acceptanceRate}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Ranking</span>
                  <span className="font-bold">#{stats.ranking}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4 flex items-center gap-2">
                <FiTrendingUp />
                Activity
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <FiTarget />
                    Current Streak
                  </span>
                  <span className="font-bold text-primary">{stats.currentStreak} days</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Streak</span>
                  <span className="font-bold">{stats.maxStreak} days</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <FiAward />
                    Contests
                  </span>
                  <span className="font-bold">{stats.contestsParticipated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge, index) => (
                  <span key={index} className="badge badge-primary badge-outline">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

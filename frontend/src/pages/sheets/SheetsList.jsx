import React, { useEffect, useState } from "react";
import { Filter, Search, X, Loader2 } from "lucide-react";
import useSheetStore from "../../stores/sheetStore";
import SheetCard from "../../components/sheets/SheetCard";

const SheetsList = () => {
  const { sheets, loading, error, fetchSheets, setFilters, filters } = useSheetStore();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    fetchSheets(filters);
  }, []);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    fetchSheets(localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = { topic: "", difficulty: "", type: "" };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    fetchSheets(emptyFilters);
  };

  const filteredSheets = sheets.filter(
    (sheet) =>
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            DSA{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Sheets
            </span>
          </h1>
          <p className="text-gray-400">
            Curated problem sheets to master Data Structures and Algorithms
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeFilterCount > 0
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-purple-500"
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-purple-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={localFilters.difficulty}
                  onChange={(e) => setLocalFilters({ ...localFilters, difficulty: e.target.value })}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                <select
                  value={localFilters.topic}
                  onChange={(e) => setLocalFilters({ ...localFilters, topic: e.target.value })}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Topics</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Hash Table">Hash Table</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="Graph">Graph</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Access</label>
                <select
                  value={localFilters.type}
                  onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {/* Sheets Grid */}
        {!loading && filteredSheets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSheets.map((sheet) => (
              <SheetCard key={sheet.id} sheet={sheet} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSheets.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No sheets found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || activeFilterCount > 0
                ? "Try adjusting your search or filters"
                : "No sheets available at the moment"}
            </p>
            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  handleClearFilters();
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetsList;

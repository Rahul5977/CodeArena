import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiCheckCircle,
  FiUpload,
  FiTerminal,
  FiAlertCircle,
  FiXCircle,
  FiClock,
  FiCpu,
  FiLoader,
} from "react-icons/fi";

/**
 * CustomInputOutput Component - Input/Output section with Run and Submit buttons
 * @param {Object} props - Component props
 * @param {string} props.customInput - Custom test input
 * @param {Function} props.onInputChange - Input change handler
 * @param {Object} props.output - Execution output object
 * @param {Function} props.onRunCode - Run code handler
 * @param {Function} props.onSubmitCode - Submit code handler
 * @param {boolean} props.isRunning - Running state
 * @param {boolean} props.isSubmitting - Submitting state
 */
const CustomInputOutput = ({
  customInput,
  onInputChange,
  output,
  onRunCode,
  onSubmitCode,
  isRunning = false,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState("testcases"); // 'testcases' or 'input'

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      Accepted: {
        color: "text-green-400 bg-green-500/10 border-green-500/30",
        icon: FiCheckCircle,
      },
      "Wrong Answer": {
        color: "text-red-400 bg-red-500/10 border-red-500/30",
        icon: FiXCircle,
      },
      "Time Limit Exceeded": {
        color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        icon: FiClock,
      },
      "Runtime Error": {
        color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        icon: FiAlertCircle,
      },
      "Compilation Error": {
        color: "text-red-400 bg-red-500/10 border-red-500/30",
        icon: FiAlertCircle,
      },
    };

    return (
      statusConfig[status] || {
        color: "text-gray-400 bg-gray-500/10 border-gray-500/30",
        icon: FiTerminal,
      }
    );
  };

  /**
   * Render test case results from backend submission
   */
  const renderOutput = () => {
    // Show loading animation when executing
    if (isRunning || isSubmitting) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-teal-400/30 border-t-teal-400"
          />
          <div className="text-center">
            <h3 className="text-white font-semibold text-lg mb-1">
              {isSubmitting ? "Submitting your code..." : "Executing your code..."}
            </h3>
            <p className="text-gray-400 text-sm">Running test cases and analyzing results</p>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 text-teal-400"
          >
            <FiLoader className="text-xl" />
            <span className="text-sm">Please wait...</span>
          </motion.div>
        </motion.div>
      );
    }

    if (!output) {
      return (
        <div className="text-center text-gray-400 py-12">
          <FiTerminal className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="text-sm">Run your code to see test case results</p>
          <p className="text-xs text-gray-500 mt-1">Click "Run Code" to execute</p>
        </div>
      );
    }

    if (output.error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-red-400">
            <FiAlertCircle className="text-xl" />
            <span className="font-semibold">Execution Error</span>
          </div>
          <pre className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap text-red-400 max-h-64 overflow-y-auto custom-scrollbar">
            {output.error}
          </pre>
        </motion.div>
      );
    }

    if (output.submission) {
      const { submission } = output;
      const testCases = submission.testCases || [];
      const allPassed = submission.status === "Accepted";

      return (
        <div className="space-y-3">
          {/* Overall Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border backdrop-blur-xl ${
              allPassed ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {allPassed ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FiCheckCircle className="text-green-400 text-xl" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FiXCircle className="text-red-400 text-xl" />
                  </div>
                )}
                <div>
                  <h3 className={`font-semibold ${allPassed ? "text-green-400" : "text-red-400"}`}>
                    {allPassed ? "✨ All Test Cases Passed!" : "❌ Some Test Cases Failed"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {testCases.filter((tc) => tc.passed).length} / {testCases.length} test cases
                    passed
                  </p>
                </div>
              </div>

              {/* Execution Metrics */}
              <div className="flex flex-col items-end gap-1 text-sm">
                {submission.time && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <FiClock className="text-xs" />
                    <span>{JSON.parse(submission.time)[0]}</span>
                  </div>
                )}
                {submission.memory && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <FiCpu className="text-xs" />
                    <span>{JSON.parse(submission.memory)[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Individual Test Cases */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {testCases.map((testCase, index) => {
              const statusBadge = getStatusBadge(testCase.status);
              const StatusIcon = statusBadge.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-lg p-3 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        Test Case {testCase.testCase}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color} flex items-center gap-1`}
                      >
                        <StatusIcon className="text-xs" />
                        {testCase.status}
                      </span>
                    </div>

                    {testCase.time && testCase.memory && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiClock className="text-xs" /> {testCase.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCpu className="text-xs" /> {testCase.memory}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Output Display */}
                  {testCase.passed ? (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Output</label>
                      <pre className="bg-slate-900/50 border border-green-500/20 rounded-lg p-2 text-xs font-mono text-green-400 whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                        {testCase.stdout || "No output"}
                      </pre>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Expected</label>
                        <pre className="bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-20 overflow-y-auto custom-scrollbar">
                          {testCase.expected || "No expected output"}
                        </pre>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Your Output</label>
                        <pre className="bg-slate-900/50 border border-red-500/20 rounded-lg p-2 text-xs font-mono text-red-400 whitespace-pre-wrap max-h-20 overflow-y-auto custom-scrollbar">
                          {testCase.stdout || "No output"}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {testCase.stderr && (
                    <div className="mt-2">
                      <label className="text-xs text-red-400 mb-1 flex items-center gap-1">
                        <FiAlertCircle className="text-xs" /> Runtime Error
                      </label>
                      <pre className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs font-mono text-red-400 whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                        {testCase.stderr}
                      </pre>
                    </div>
                  )}

                  {testCase.compileOutput && (
                    <div className="mt-2">
                      <label className="text-xs text-red-400 mb-1 flex items-center gap-1">
                        <FiAlertCircle className="text-xs" /> Compilation Error
                      </label>
                      <pre className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs font-mono text-red-400 whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                        {testCase.compileOutput}
                      </pre>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Tabs and Action Buttons - Glassmorphism */}
      <div className="flex items-center justify-between p-3 bg-slate-800/30 backdrop-blur-xl border-b border-white/10">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "testcases"
                ? "bg-gradient-to-r from-teal-500 to-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiTerminal className="inline mr-1 text-sm" />
            Test Cases
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "input"
                ? "bg-gradient-to-r from-teal-500 to-pink-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Custom Input
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isRunning ? (
              <>
                <FiLoader className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <FiPlay />
                Run Code
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiUpload />
                Submit
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content Area with Glassmorphism */}
      <div className="flex-1 overflow-hidden p-4 bg-slate-900/20">
        <AnimatePresence mode="wait">
          {activeTab === "testcases" ? (
            <motion.div
              key="testcases"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              {renderOutput()}
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <label className="text-sm font-semibold text-gray-300 mb-2 block">
                Custom Test Input
              </label>
              <textarea
                value={customInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={"Enter your test input here\n\nExample:\n5\n1 2 3 4 5"}
                className="w-full h-[calc(100%-2rem)] bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-teal-400 transition-all placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Tip: Use custom input to test your code with specific test cases
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(20, 184, 166, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 184, 166, 0.5);
        }
      `}</style>
    </div>
  );
};

CustomInputOutput.propTypes = {
  customInput: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
  output: PropTypes.object,
  onRunCode: PropTypes.func.isRequired,
  onSubmitCode: PropTypes.func.isRequired,
  isRunning: PropTypes.bool,
  isSubmitting: PropTypes.bool,
};

export default CustomInputOutput;

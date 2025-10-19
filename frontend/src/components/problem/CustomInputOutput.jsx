import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiCheckCircle, FiUpload, FiTerminal, FiAlertCircle } from "react-icons/fi";

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
  const [activeTab, setActiveTab] = useState("input"); // 'input' or 'output'

  /**
   * Get output display based on result
   */
  const renderOutput = () => {
    if (!output) {
      return (
        <div className="text-center text-base-content/50 py-8">
          <FiTerminal className="text-4xl mx-auto mb-2 opacity-50" />
          <p className="text-sm">Run your code to see output here</p>
        </div>
      );
    }

    if (output.error) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-error">
            <FiAlertCircle className="text-xl" />
            <span className="font-semibold">Error</span>
          </div>
          <pre className="bg-error/10 border border-error/30 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap text-error">
            {output.error}
          </pre>
        </div>
      );
    }

    if (output.results && Array.isArray(output.results)) {
      const allPassed = output.results.every((r) => r.passed);
      const passedCount = output.results.filter((r) => r.passed).length;

      return (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`flex items-center gap-2 ${allPassed ? "text-success" : "text-warning"}`}>
            <FiCheckCircle className="text-xl" />
            <span className="font-semibold">
              {allPassed
                ? "All Test Cases Passed! 🎉"
                : `${passedCount}/${output.results.length} Test Cases Passed`}
            </span>
          </div>

          {/* Test Case Results */}
          <div className="space-y-3">
            {output.results.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`border rounded-lg p-4 ${
                  result.passed ? "bg-success/10 border-success/30" : "bg-error/10 border-error/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Test Case {result.testCase}</span>
                  <span className={`badge ${result.passed ? "badge-success" : "badge-error"}`}>
                    {result.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {result.stdout !== undefined && (
                    <div>
                      <span className="text-base-content/60 font-semibold">Output:</span>
                      <pre className="bg-base-300 dark:bg-base-100 rounded p-2 mt-1 font-mono overflow-x-auto">
                        {result.stdout || "(empty)"}
                      </pre>
                    </div>
                  )}

                  {result.expected !== undefined && !result.passed && (
                    <div>
                      <span className="text-base-content/60 font-semibold">Expected:</span>
                      <pre className="bg-base-300 dark:bg-base-100 rounded p-2 mt-1 font-mono overflow-x-auto">
                        {result.expected}
                      </pre>
                    </div>
                  )}

                  {result.stderr && (
                    <div>
                      <span className="text-error font-semibold">Error:</span>
                      <pre className="bg-error/10 rounded p-2 mt-1 font-mono overflow-x-auto text-error text-xs">
                        {result.stderr}
                      </pre>
                    </div>
                  )}

                  {(result.time || result.memory) && (
                    <div className="flex gap-4 text-xs text-base-content/60">
                      {result.time && <span>⏱️ Time: {result.time}</span>}
                      {result.memory && <span>💾 Memory: {result.memory}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <pre className="bg-base-300 dark:bg-base-100 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  };

  return (
    <div className="flex flex-col h-full bg-base-200 dark:bg-base-300 rounded-lg overflow-hidden">
      {/* Tabs and Action Buttons */}
      <div className="flex items-center justify-between p-3 border-b border-base-content/10 bg-base-100 dark:bg-base-200">
        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 dark:bg-base-300">
          <button
            className={`tab ${activeTab === "input" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("input")}
          >
            Input
          </button>
          <button
            className={`tab ${activeTab === "output" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="btn btn-sm btn-primary gap-2"
          >
            {isRunning ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
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
            className="btn btn-sm btn-success gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <AnimatePresence mode="wait">
          {activeTab === "input" ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <label className="text-sm font-semibold text-base-content/70 mb-2 block">
                Custom Input (Optional):
              </label>
              <textarea
                value={customInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter your test input here&#10;Example:&#10;5&#10;1 2 3 4 5"
                className="textarea textarea-bordered w-full h-[calc(100%-2rem)] bg-base-100 dark:bg-base-200 font-mono text-sm resize-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key="output"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderOutput()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 100, 100, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 100, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 100, 0.5);
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

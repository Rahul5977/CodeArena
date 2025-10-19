import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { FiCode, FiCheckCircle } from "react-icons/fi";

/**
 * ProblemDescription Component - Displays problem statement, examples, constraints, and tags
 * @param {Object} props - Component props
 * @param {Object} props.problem - Problem object with title, description, examples, constraints, tags, difficulty
 * @param {boolean} props.loading - Loading state
 */
const ProblemDescription = ({ problem, loading = false }) => {
  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === "easy") return "badge-success";
    if (diff === "medium") return "badge-warning";
    if (diff === "hard") return "badge-error";
    return "badge-ghost";
  };

  if (loading) {
    return (
      <div className="h-full bg-base-200 dark:bg-base-300 rounded-lg p-6 overflow-y-auto">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-base-content/20 rounded w-3/4 mb-4" />
          <div className="h-4 bg-base-content/10 rounded w-1/4 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-base-content/10 rounded w-full" />
            <div className="h-4 bg-base-content/10 rounded w-full" />
            <div className="h-4 bg-base-content/10 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-full bg-base-200 dark:bg-base-300 rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <FiCode className="text-5xl text-base-content/30 mx-auto mb-4" />
          <p className="text-base-content/60">Problem not found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-base-200 dark:bg-base-300 rounded-lg overflow-hidden"
    >
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="p-6">
          {/* Problem Title */}
          <h1 className="text-3xl font-bold text-base-content mb-4">{problem.title}</h1>

          {/* Difficulty and Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            {problem.tags && problem.tags.length > 0 && (
              <>
                {problem.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-outline badge-sm">
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-base-content mb-3 flex items-center gap-2">
              <FiCode className="text-primary" />
              Problem Description
            </h2>
            <div className="prose prose-sm max-w-none text-base-content/80">
              <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
            </div>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-base-content mb-3">Examples</h2>
              <div className="space-y-4">
                {problem.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="bg-base-100 dark:bg-base-200 rounded-lg p-4 border border-base-300"
                  >
                    <p className="text-sm font-semibold text-base-content/70 mb-2">
                      Example {idx + 1}:
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-base-content/60">Input:</span>
                        <pre className="bg-base-300 dark:bg-base-100 rounded p-2 mt-1 text-sm font-mono overflow-x-auto">
                          {example.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-base-content/60">Output:</span>
                        <pre className="bg-base-300 dark:bg-base-100 rounded p-2 mt-1 text-sm font-mono overflow-x-auto">
                          {example.output}
                        </pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-xs font-semibold text-base-content/60">
                            Explanation:
                          </span>
                          <p className="text-sm text-base-content/70 mt-1">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-base-content mb-3">Constraints</h2>
              <ul className="space-y-2">
                {(() => {
                  // Handle different constraint formats
                  let constraintList = [];

                  if (Array.isArray(problem.constraints)) {
                    constraintList = problem.constraints;
                  } else if (typeof problem.constraints === "string") {
                    try {
                      // Try to parse as JSON first
                      const parsed = JSON.parse(problem.constraints);
                      constraintList = Array.isArray(parsed) ? parsed : [problem.constraints];
                    } catch {
                      // If not JSON, split by newlines
                      constraintList = problem.constraints.split("\n").filter((c) => c.trim());
                    }
                  }

                  return constraintList.map((constraint, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-base-content/70">
                      <FiCheckCircle className="text-success mt-1 flex-shrink-0" />
                      <span className="text-sm font-mono">{constraint}</span>
                    </li>
                  ));
                })()}
              </ul>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-base-content/10">
            <p className="text-xs text-base-content/50">
              💡 Tip: Read the problem carefully and consider edge cases
            </p>
          </div>
        </div>
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
    </motion.div>
  );
};

ProblemDescription.propTypes = {
  problem: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    examples: PropTypes.arrayOf(
      PropTypes.shape({
        input: PropTypes.string,
        output: PropTypes.string,
        explanation: PropTypes.string,
      })
    ),
    constraints: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool,
};

export default ProblemDescription;

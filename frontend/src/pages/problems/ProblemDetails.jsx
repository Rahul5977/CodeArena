import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Split from "react-split";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import apiClient from "../../lib/apiClient";
import { useToastContext } from "../../contexts/ToastContext";
import ProblemDescription from "../../components/problem/ProblemDescription";
import CodeEditor from "../../components/problem/CodeEditor";
import CustomInputOutput from "../../components/problem/CustomInputOutput";

/**
 * ProblemDetails Page - Complete problem solving interface
 * Features:
 * - Split layout (description + editor)
 * - Monaco code editor with multiple languages
 * - Custom input/output section
 * - Run and Submit functionality
 * - Responsive design
 */
const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();

  // Problem data
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [language, setLanguage] = useState("Python");
  const [languageId, setLanguageId] = useState(71); // Python default
  const [code, setCode] = useState("");

  // Input/Output state
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  /**
   * Language configurations for Judge0
   */
  const languages = [
    { id: 71, name: "Python", monacoLang: "python" },
    { id: 54, name: "C++", monacoLang: "cpp" },
    { id: 62, name: "Java", monacoLang: "java" },
    { id: 63, name: "JavaScript", monacoLang: "javascript" },
    { id: 50, name: "C", monacoLang: "c" },
  ];

  /**
   * Get default code template
   */
  const getDefaultCode = (langName) => {
    if (problem && problem.codeSnippets && problem.codeSnippets[langName]) {
      return problem.codeSnippets[langName];
    }

    const templates = {
      Python: `def solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solution()`,
      "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
      Java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
      JavaScript: `function solution() {\n    // Write your code here\n}\n\nsolution();`,
      C: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    };

    return templates[langName] || templates.Python;
  };

  /**
   * Load saved code and language from localStorage
   */
  useEffect(() => {
    if (id) {
      const savedLanguage = localStorage.getItem(`problem_${id}_language`);
      const savedCode = localStorage.getItem(`problem_${id}_code`);

      if (savedLanguage) {
        const lang = languages.find((l) => l.name === savedLanguage);
        if (lang) {
          setLanguage(savedLanguage);
          setLanguageId(lang.id);
        }
      }

      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, [id]);

  /**
   * Save code to localStorage when it changes
   */
  useEffect(() => {
    if (id && code) {
      localStorage.setItem(`problem_${id}_code`, code);
      localStorage.setItem(`problem_${id}_language`, language);
    }
  }, [id, code, language]);

  /**
   * Fetch problem details
   */
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/problems/get-all-problems/${id}`);

        if (response.data.success && response.data.problem) {
          setProblem(response.data.problem);
          // Set initial code from code snippets only if no saved code
          const savedCode = localStorage.getItem(`problem_${id}_code`);
          if (!savedCode) {
            const initialCode = getDefaultCode(language);
            setCode(initialCode);
          }
        } else {
          showError("Error", "Problem not found");
          navigate("/problems");
        }
      } catch (error) {
        console.error("Failed to fetch problem:", error);
        showError("Error", error.response?.data?.message || "Failed to load problem");
        navigate("/problems");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Handle language change
   */
  const handleLanguageChange = (newLang, newLangId) => {
    setLanguage(newLang);
    setLanguageId(newLangId);

    // Update code if it's still default template
    const currentTemplate = getDefaultCode(language);
    if (!code || code === currentTemplate) {
      setCode(getDefaultCode(newLang));
    }
  };

  /**
   * Handle run code
   */
  const handleRunCode = async () => {
    if (!code.trim()) {
      showError("Error", "Please write some code first");
      return;
    }

    try {
      setIsRunning(true);
      setOutput(null);

      // Prepare test cases from problem
      const stdin = problem.testcases?.map((tc) => tc.input) || [];
      const expected_outputs = problem.testcases?.map((tc) => tc.output) || [];

      // If custom input is provided, use it instead
      const finalStdin = customInput.trim() ? [customInput.trim()] : stdin;
      const finalExpected = customInput.trim() ? [""] : expected_outputs;

      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: finalStdin,
        expected_outputs: finalExpected,
        problemId: parseInt(id),
      };

      const response = await apiClient.post("/execute-code", payload);

      if (response.data.success) {
        setOutput({
          submission: response.data.submission,
        });

        // Show success/failure toast based on overall status
        const allPassed = response.data.submission.status === "Accepted";
        if (allPassed) {
          showSuccess("Success", "All test cases passed! 🎉");
        } else {
          showError("Failed", "Some test cases failed. Check the results below.");
        }
      } else {
        setOutput({
          error: response.data.message || "Execution failed",
        });
        showError("Error", response.data.message || "Execution failed");
      }
    } catch (error) {
      console.error("Failed to run code:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to execute code. Please try again.";
      setOutput({
        error: errorMessage,
      });
      showError("Error", errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Handle submit code - Uses same backend endpoint as run
   */
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      showError("Error", "Please write some code first");
      return;
    }

    try {
      setIsSubmitting(true);
      setOutput(null);

      // Get all test cases from problem (not custom input for submit)
      const stdin = problem.testcases?.map((tc) => tc.input) || [];
      const expected_outputs = problem.testcases?.map((tc) => tc.output) || [];

      if (stdin.length === 0) {
        showError("Error", "No test cases available for this problem");
        return;
      }

      const payload = {
        source_code: code,
        language_id: languageId,
        stdin,
        expected_outputs,
        problemId: parseInt(id),
      };

      const response = await apiClient.post("/execute-code", payload);

      if (response.data.success) {
        setOutput({
          submission: response.data.submission,
        });

        // Show success/failure based on overall status
        const allPassed = response.data.submission.status === "Accepted";
        if (allPassed) {
          showSuccess("Accepted", "🎉 Congratulations! All test cases passed!");
        } else {
          showError("Not Accepted", "Your solution didn't pass all test cases. Keep trying!");
        }
      } else {
        setOutput({
          error: response.data.message || "Submission failed",
        });
        showError("Error", response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Failed to submit code:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit code. Please try again.";
      setOutput({
        error: errorMessage,
      });
      showError("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex items-center justify-center">
        <div className="text-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Problem not found</h2>
          <button
            onClick={() => navigate("/problems")}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/problems")}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center gap-2"
            title="Back to Problems"
          >
            <FiArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent truncate max-w-md">
            {problem.title}
          </h1>
        </div>
        <button
          onClick={toggleFullscreen}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile Layout: Stacked
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <ProblemDescription problem={problem} loading={false} />
            </div>
            <div className="h-96 border-t-4 border-base-300">
              <CodeEditor
                language={language}
                code={code}
                onChange={setCode}
                onLanguageChange={handleLanguageChange}
                codeSnippets={problem.codeSnippets}
                problemId={id}
              />
            </div>
            <div className="h-64 border-t-4 border-base-300">
              <CustomInputOutput
                customInput={customInput}
                onInputChange={setCustomInput}
                output={output}
                onRunCode={handleRunCode}
                onSubmitCode={handleSubmitCode}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        ) : (
          // Desktop Layout: Split View
          <Split
            className="split flex h-full"
            sizes={[40, 60]}
            minSize={[300, 400]}
            gutterSize={8}
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
          >
            {/* Left Panel: Problem Description */}
            <div className="overflow-hidden p-4">
              <ProblemDescription problem={problem} loading={false} />
            </div>

            {/* Right Panel: Code Editor + Input/Output */}
            <div className="flex flex-col overflow-hidden">
              {/* Code Editor (60% height) */}
              <div className="flex-[6] min-h-0">
                <CodeEditor
                  language={language}
                  code={code}
                  onChange={setCode}
                  onLanguageChange={handleLanguageChange}
                  codeSnippets={problem.codeSnippets}
                  problemId={id}
                />
              </div>

              {/* Input/Output (40% height) */}
              <div className="flex-[4] min-h-0 border-t-2 border-base-300">
                <CustomInputOutput
                  customInput={customInput}
                  onInputChange={setCustomInput}
                  output={output}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </Split>
        )}
      </div>

      {/* Split.js Custom Styles */}
      <style jsx global>{`
        .split {
          display: flex;
        }

        .gutter {
          background-color: rgba(148, 163, 184, 0.1);
          background-repeat: no-repeat;
          background-position: 50%;
          transition: background-color 0.2s;
        }

        .gutter:hover {
          background-color: rgba(20, 184, 166, 0.2);
        }

        .gutter.gutter-horizontal {
          cursor: col-resize;
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==");
        }
      `}</style>
    </div>
  );
};

export default ProblemDetails;

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
   * Fetch problem details
   */
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/problem/${id}`);

        if (response.data.success && response.data.problem) {
          setProblem(response.data.problem);
          // Set initial code from code snippets
          const initialCode = getDefaultCode(language);
          setCode(initialCode);
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
        problemId: id,
      };

      const response = await apiClient.post("/execute", payload);

      if (response.data.success) {
        setOutput({
          results: response.data.results,
        });

        const allPassed = response.data.allPassed;
        if (allPassed) {
          showSuccess("Success", "All test cases passed! 🎉");
        }
      } else {
        setOutput({
          error: response.data.message || "Execution failed",
        });
      }
    } catch (error) {
      console.error("Failed to run code:", error);
      setOutput({
        error: error.response?.data?.message || "Failed to execute code. Please try again.",
      });
      showError("Error", "Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Handle submit code
   */
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      showError("Error", "Please write some code first");
      return;
    }

    try {
      setIsSubmitting(true);

      // For now, submit is same as run (backend logic pending)
      showError(
        "Info",
        'Submit functionality is coming soon. Use "Run Code" to test your solution.'
      );

      // TODO: Implement proper submit endpoint when backend is ready
      /*
      const payload = {
        source_code: code,
        language_id: languageId,
        problemId: id,
      };

      const response = await apiClient.post('/execute/submit', payload);
      
      if (response.data.success) {
        showSuccess('Success', 'Code submitted successfully!');
        // Navigate to submissions or show result
      }
      */
    } catch (error) {
      console.error("Failed to submit code:", error);
      showError("Error", error.response?.data?.message || "Failed to submit code");
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
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-4">Problem not found</h2>
          <button onClick={() => navigate("/problems")} className="btn btn-primary">
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-200 border-b border-base-300 px-4 py-3 flex items-center justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/problems")}
            className="btn btn-ghost btn-sm gap-2"
            title="Back to Problems"
          >
            <FiArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-base-content truncate max-w-md">{problem.title}</h1>
        </div>
        <button
          onClick={toggleFullscreen}
          className="btn btn-ghost btn-sm"
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
          background-color: oklch(var(--b3));
          background-repeat: no-repeat;
          background-position: 50%;
          transition: background-color 0.2s;
        }

        .gutter:hover {
          background-color: oklch(var(--p) / 0.3);
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

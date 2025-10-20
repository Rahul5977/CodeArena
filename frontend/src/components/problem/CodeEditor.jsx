import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";

/**
 * CodeEditor Component - Monaco Editor with language selection and code templates
 * @param {Object} props - Component props
 * @param {string} props.code - Current code value
 * @param {Function} props.onChange - Code change handler
 * @param {string} props.language - Current selected language
 * @param {Function} props.onLanguageChange - Language change handler
 * @param {Object} props.codeSnippets - Code templates from backend
 * @param {string} props.problemId - Problem ID for localStorage
 */
const CodeEditor = ({
  code,
  onChange,
  language,
  onLanguageChange,
  codeSnippets = {},
  problemId,
}) => {
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  /**
   * Language configurations for Monaco Editor and Judge0
   */
  const languages = [
    { id: 71, name: "Python", monacoLang: "python", ext: "py" },
    { id: 54, name: "C++", monacoLang: "cpp", ext: "cpp" },
    { id: 62, name: "Java", monacoLang: "java", ext: "java" },
    { id: 63, name: "JavaScript", monacoLang: "javascript", ext: "js" },
    { id: 50, name: "C", monacoLang: "c", ext: "c" },
  ];

  /**
   * Get Judge0 language ID from language name
   */
  const getLanguageId = (langName) => {
    const lang = languages.find((l) => l.name === langName);
    return lang ? lang.id : 71; // Default to Python
  };

  /**
   * Get Monaco language from language name
   */
  const getMonacoLanguage = (langName) => {
    const lang = languages.find((l) => l.name === langName);
    return lang ? lang.monacoLang : "python";
  };

  /**
   * Default code templates if not provided from backend
   */
  const defaultTemplates = {
    Python: `def solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solution()`,
    "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    Java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
    JavaScript: `function solution() {\n    // Write your code here\n}\n\nsolution();`,
    C: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  };

  /**
   * Get code template for current language
   */
  const getCodeTemplate = (langName) => {
    // Try to get from backend code snippets
    if (codeSnippets && codeSnippets[langName]) {
      return codeSnippets[langName];
    }
    // Fallback to default templates
    return defaultTemplates[langName] || defaultTemplates.Python;
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    onLanguageChange(newLang, getLanguageId(newLang));

    // If code is empty or still has default template, load new template
    const currentTemplate = getCodeTemplate(language);
    if (!code || code === currentTemplate) {
      onChange(getCodeTemplate(newLang));
    }
  };

  /**
   * Reset code to default template
   */
  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the default template?")) {
      onChange(getCodeTemplate(language));
      // Clear localStorage for this problem
      if (problemId) {
        localStorage.removeItem(`problem_${problemId}_code`);
      }
    }
  };

  /**
   * Monaco Editor options
   */
  const editorOptions = {
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
    fontLigatures: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    wordWrap: "on",
    lineNumbers: "on",
    renderWhitespace: "selection",
    bracketPairColorization: { enabled: true },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
  };

  /**
   * Detect system theme
   */
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setEditorTheme(darkModeQuery.matches ? "vs-dark" : "vs-light");

    const handleThemeChange = (e) => {
      setEditorTheme(e.matches ? "vs-dark" : "vs-light");
    };

    darkModeQuery.addEventListener("change", handleThemeChange);
    return () => darkModeQuery.removeEventListener("change", handleThemeChange);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900/20 rounded-lg overflow-hidden backdrop-blur-sm">
      {/* Language Selector - Glassmorphism */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-slate-800/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-300">Language:</label>
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-3 py-1.5 pr-8 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm cursor-pointer hover:border-teal-400/50 focus:outline-none focus:border-teal-400 transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>

          {/* Reset Code Button */}
          <button
            onClick={handleResetCode}
            className="px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg text-gray-300 text-sm hover:border-orange-400/50 hover:text-orange-400 transition-all flex items-center gap-1.5"
            title="Reset to default template"
          >
            <FiRefreshCw className="text-xs" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Editor Theme Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
          <span>Monaco Editor</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden border border-white/5 rounded-b-lg">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme={editorTheme}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full bg-slate-900/50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  codeSnippets: PropTypes.object,
  problemId: PropTypes.string,
};

export default CodeEditor;

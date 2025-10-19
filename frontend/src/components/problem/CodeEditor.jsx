import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";
import { FiChevronDown } from "react-icons/fi";

/**
 * CodeEditor Component - Monaco Editor with language selection and code templates
 * @param {Object} props - Component props
 * @param {string} props.code - Current code value
 * @param {Function} props.onChange - Code change handler
 * @param {string} props.language - Current selected language
 * @param {Function} props.onLanguageChange - Language change handler
 * @param {Object} props.codeSnippets - Code templates from backend
 */
const CodeEditor = ({ code, onChange, language, onLanguageChange, codeSnippets = {} }) => {
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
    <div className="flex flex-col h-full bg-base-200 dark:bg-base-300 rounded-lg overflow-hidden">
      {/* Language Selector */}
      <div className="flex items-center justify-between p-3 border-b border-base-content/10 bg-base-100 dark:bg-base-200">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-base-content/70">Language:</label>
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="select select-sm select-bordered bg-base-200 dark:bg-base-300 pr-8 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-content/50" />
          </div>
        </div>

        {/* Editor Theme Toggle (optional) */}
        <div className="text-xs text-base-content/50">Monaco Editor</div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme={editorTheme}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="loading loading-spinner loading-lg text-primary"></div>
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
};

export default CodeEditor;

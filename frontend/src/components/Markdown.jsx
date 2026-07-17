import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders markdown (problem statements, constraints, solutions, …) styled to the
// Organic theme via the `.md` scope in styles/markdown.css. Raw HTML in the
// source is intentionally NOT rendered (react-markdown default), so user/author
// content can't inject markup. GFM adds tables, task lists, strikethrough, etc.
export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ""}</ReactMarkdown>
    </div>
  );
}

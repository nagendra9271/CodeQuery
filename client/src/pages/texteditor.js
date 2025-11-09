import React, { useState, useEffect, useCallback, useRef } from "react";
import "./texteditor.css";
import {
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Type,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

// Simple MDEditor-like component since we can't import external libraries
const MarkdownEditor = ({ value, onChange, theme, preview, placeholder }) => {
  const textareaRef = useRef(null);

  const insertMarkdown = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbarButtons = [
    {
      label: "Bold",
      action: () => insertMarkdown("**", "**"),
      icon: "B",
      shortcut: "Ctrl+B",
    },
    {
      label: "Italic",
      action: () => insertMarkdown("*", "*"),
      icon: "I",
      shortcut: "Ctrl+I",
    },
    {
      label: "Code",
      action: () => insertMarkdown("`", "`"),
      icon: "</>",
      shortcut: "Ctrl+`",
    },
    {
      label: "Link",
      action: () => insertMarkdown("[", "](url)"),
      icon: "🔗",
      shortcut: "Ctrl+K",
    },
    {
      label: "Heading",
      action: () => insertMarkdown("## ", ""),
      icon: "H",
      shortcut: "Ctrl+H",
    },
    {
      label: "List",
      action: () => insertMarkdown("- ", ""),
      icon: "•",
      shortcut: "Ctrl+L",
    },
  ];

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertMarkdown("**", "**");
          break;
        case "i":
          e.preventDefault();
          insertMarkdown("*", "*");
          break;
        case "`":
          e.preventDefault();
          insertMarkdown("`", "`");
          break;
        case "k":
          e.preventDefault();
          insertMarkdown("[", "](url)");
          break;
        case "h":
          e.preventDefault();
          insertMarkdown("## ", "");
          break;
        case "l":
          e.preventDefault();
          insertMarkdown("- ", "");
          break;
        default:
          break;
      }
    }
  };

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      )
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gim, "<ul>$1</ul>")
      .replace(/\n/gim, "<br>");
  };

  return (
    <div className={`markdown-editor ${theme}`}>
      <div className="toolbar">
        {toolbarButtons.map((button, index) => (
          <button
            type="button"
            key={index}
            onClick={button.action}
            className="toolbar-btn"
            title={`${button.label} (${button.shortcut})`}
          >
            {button.icon}
          </button>
        ))}
      </div>

      <div className="editor-content">
        {preview === "edit" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="editor-textarea"
          />
        )}

        {preview === "preview" && (
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        )}

        {preview === "split" && (
          <>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="editor-textarea split"
            />
            <div
              className="preview-content split"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default function TextEditor({
  id = "enhanced-editor",
  value = "",
  setValue,
}) {
  const [theme, setTheme] = useState("light");
  const [preview, setPreview] = useState("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  // const [isSaved, setIsSaved] = useState(true);
  // const [lastSaved, setLastSaved] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Import the external CSS fil

  // Auto-save functionality
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (setValue) {
  //       setValue(value);
  //     }
  //     setIsSaved(true);
  //     setLastSaved(new Date().toLocaleTimeString());
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [value, setValue]);

  // Update counts and history
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;
    setWordCount(words);
    setCharCount(chars);

    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(value);
      if (newHistory.length > 50) {
        // Limit history to 50 entries
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }
      setHistory(newHistory);
    }
  }, [value]);

  const handleValueChange = useCallback((newValue) => {
    setValue(newValue);
    // setIsSaved(false);
  }, []);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
    }
  };

  const handleSave = () => {
    const blob = new Blob([value], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const togglePreview = () => {
    const modes = ["edit", "split", "preview"];
    const currentIndex = modes.indexOf(preview);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPreview(modes[nextIndex]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`enhanced-editor-container ${theme} ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      <div className="editor-header">
        <div className="editor-controls">
          <button
            type="button"
            onClick={handleUndo}
            className="control-btn"
            disabled={historyIndex === 0}
          >
            <RotateCcw size={16} />
            Undo
          </button>

          <button type="button" onClick={togglePreview} className="control-btn">
            {preview === "edit" ? (
              <Eye size={16} />
            ) : preview === "split" ? (
              <Type size={16} />
            ) : (
              <EyeOff size={16} />
            )}
            {preview === "edit"
              ? "Edit"
              : preview === "split"
              ? "Split"
              : "Preview"}
          </button>

          <button type="button" onClick={toggleTheme} className="control-btn">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="control-btn"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? "Exit" : "Full"}
          </button>

          <button type="button" onClick={handleSave} className="control-btn">
            <Download size={16} />
            Export
          </button>

          <label className="control-btn">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".md,.txt"
              onChange={handleLoad}
              className="file-input"
            />
          </label>

          <button type="button" onClick={handleCopy} className="control-btn">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="editor-stats">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {/* <div className={`save-status ${isSaved ? "saved" : "unsaved"}`}>
            <Save size={12} />
            {isSaved ? `Saved ${lastSaved || ""}` : "Saving..."}
          </div> */}
        </div>
      </div>

      <MarkdownEditor
        value={value}
        onChange={handleValueChange}
        theme={theme}
        preview={preview}
        placeholder="Start writing your markdown content here... 

Try these shortcuts:
• Ctrl+B for **bold**
• Ctrl+I for *italic*
• Ctrl+K for [links](url)
• Ctrl+H for ## headings"
      />
    </div>
  );
}

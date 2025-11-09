import React from "react";
import "./texteditor.css";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

export default function TextEditor({ id, value, setValue }) {
  const removedElements = [
    // "list",
    "quote",
    "live",
    "fullscreen",
    "strikethrough",
    "hr",
    // "code",
    "table",
    "divider",
  ];
  return (
    <div id="editor">
      <MDEditor
        value={value}
        theme="light"
        onChange={setValue}
        commandsFilter={(command, isExtra) => {
          if (removedElements.includes(command.keyCommand)) return false;
          return command;
        }}
        preview="edit"
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        textareaProps={{
          placeholder: "Please enter Markdown text",
        }}
        visibleDragbar={true}
      />
    </div>
  );
}

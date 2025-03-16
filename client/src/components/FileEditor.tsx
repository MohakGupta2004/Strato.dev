import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

interface FileEditorProps {
  selectedFile: string;
  fileTree: any;
  code: string;
  onContentChange: (fileName: string, content: string) => void;
}

const FileEditor = ({
  selectedFile,
  fileTree,
  code,
  onContentChange
}: FileEditorProps) => {
  const [content, setContent] = useState("");

  // 🛠 Update the content when selectedFile changes
  useEffect(() => {
    if (selectedFile && fileTree[selectedFile]) {
      setContent(fileTree[selectedFile].file.content);
    }
  }, [selectedFile, fileTree]);

  // Add this handler to your FileEditor component
  const handleContentChange = (newContent: string) => {
    onContentChange(selectedFile, newContent);
  };

  return (
    <div className="flex-1 flex flex-col bg-white p-4 min-w-0">
      {selectedFile ? (
        <>
          <h2 className="text-lg font-semibold mb-2">{selectedFile}</h2>
          <div className="flex-1 border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={code}
              value={content}
              onChange={handleContentChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Select a file to view its content</p>
        </div>
      )}
    </div>
  );
};

export default FileEditor;

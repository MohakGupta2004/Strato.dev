import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

// Define the file history type for our component
type FileHistory = {
  content: string;
  createdBy: 'ai' | 'user';
  lastModifiedBy: 'ai' | 'user';
  createdAt: number;
  lastModifiedAt: number;
  version: number;
};

interface FileEditorProps {
  selectedFile: string;
  fileTree: any;
  code: string;
  onContentChange: (fileName: string, content: string) => void;
  getFileMetadata: (fileName: string) => FileHistory | null;
  isAIGeneratedFile: (fileName: string) => boolean;
}

const FileEditor = ({
  selectedFile,
  fileTree,
  code,
  onContentChange,
  getFileMetadata,
  isAIGeneratedFile
}: FileEditorProps) => {
  const [content, setContent] = useState("");
  
  // 🛠 Update the content when selectedFile changes
  useEffect(() => {
    if (selectedFile && fileTree[selectedFile]) {
      setContent(fileTree[selectedFile].file.content);
    }
  }, [selectedFile, fileTree]);

  // Handler for content changes
  const handleContentChange = (newContent: string | undefined) => {
    if (newContent !== undefined) {
      onContentChange(selectedFile, newContent);
    }
  };

  // Get the file metadata
  const fileMetadata = selectedFile ? getFileMetadata(selectedFile) : null;
  const isAIGenerated = selectedFile ? isAIGeneratedFile(selectedFile) : false;

  return (
    <div className="flex-1 flex flex-col bg-white p-4 min-w-0">
      {selectedFile ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{selectedFile}</h2>
            {isAIGenerated && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                AI Generated
              </span>
            )}
          </div>
          
          {fileMetadata && (
            <div className="text-xs text-gray-500 mb-2">
              Created: {new Date(fileMetadata.createdAt).toLocaleString()} by {fileMetadata.createdBy}
              {' • '}
              Last modified: {new Date(fileMetadata.lastModifiedAt).toLocaleString()} by {fileMetadata.lastModifiedBy}
              {' • '}
              Version: {fileMetadata.version}
            </div>
          )}
          
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

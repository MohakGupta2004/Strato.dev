import React, { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
import { Plus } from "lucide-react";
import { api } from "../utils/api";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../utils/socket";
import { UserAddModal } from "./UserModal";
import FileEditor from "./FileEditor";

type FileTree = {
  [fileName: string]: {
    file:{
      content: string;
    }
  };
};

// Add file history types for tracking AI/user contributions
type FileHistory = {
  content: string;
  createdBy: 'ai' | 'user';
  lastModifiedBy: 'ai' | 'user';
  createdAt: number;
  lastModifiedAt: number;
  version: number;
};

const Chat = ({ projectId }: { projectId: string }) => {
  const authResult = new URLSearchParams(window.location.search);
  const projectName = authResult.get("name");

  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; name: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAddModal, setUserAddModal] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileTree>({
    "": {file:{ content: "" }},
  });
  const [codeType, setCodeType] = useState("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({});
  const [openFileTabs, setOpenFileTabs] = useState<string[]>([]);
  
  // Add state for file history tracking (AI vs user code)
  const [fileHistory, setFileHistory] = useState<Record<string, FileHistory>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load file history from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`ai_code_memory_${projectId}`);
      if (savedData) {
        setFileHistory(JSON.parse(savedData));
      }
    } catch (err) {
      console.error('Failed to load AI code history:', err);
    }
  }, [projectId]);

  // Save file history to localStorage when it changes
  useEffect(() => {
    if (Object.keys(fileHistory).length > 0) {
      localStorage.setItem(`ai_code_memory_${projectId}`, JSON.stringify(fileHistory));
    }
  }, [fileHistory, projectId]);

  // Functions to record file changes
  const recordAIChange = (fileName: string, content: string) => {
    setFileHistory(prev => {
      const now = Date.now();
      const existing = prev[fileName];
      
      return {
        ...prev,
        [fileName]: {
          content,
          createdBy: existing ? existing.createdBy : 'ai',
          lastModifiedBy: 'ai',
          createdAt: existing ? existing.createdAt : now,
          lastModifiedAt: now,
          version: existing ? existing.version + 1 : 1
        }
      };
    });
  };

  const recordUserChange = (fileName: string, content: string) => {
    setFileHistory(prev => {
      const now = Date.now();
      const existing = prev[fileName];
      
      // If this file doesn't exist in history, or was created by AI but modified by user
      return {
        ...prev,
        [fileName]: {
          content,
          createdBy: existing ? existing.createdBy : 'user',
          lastModifiedBy: 'user',
          createdAt: existing ? existing.createdAt : now,
          lastModifiedAt: now,
          version: existing ? existing.version + 1 : 1
        }
      };
    });
  };

  // Helper functions for file metadata
  const getFileMetadata = (fileName: string): FileHistory | null => {
    return fileHistory[fileName] || null;
  };

  const isAIGeneratedFile = (fileName: string): boolean => {
    return fileHistory[fileName]?.createdBy === 'ai';
  };

  /** ✅ Fetch user on mount */
  useEffect(() => {
    api
      .get("/auth/profile")
      .then((result) => {
        setUser(result.data.message.email);
      })
      .catch((err) => console.log("Error fetching user:", err));
  }, []);

  /** ✅ Socket Connection with Cleanup */
  useEffect(() => {
    if (!user) return;

    initializeSocket(projectId);

    receiveMessage("project-message", async (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.message,
          sender: data.sender,
          name: data.sender === user ? "me" : "others",
        },
      ]);

      if (data.message.startsWith("@ai ")) {
        const aiPrompt = data.message.slice(4);
        try {
          // Determine request type with more specific conditions
          const isModificationRequest = aiPrompt.toLowerCase().includes("modify") || 
                                       aiPrompt.toLowerCase().includes("change") || 
                                       aiPrompt.toLowerCase().includes("update");
          
          // Check if this is a request to create something completely new
          const isNewProjectRequest = aiPrompt.toLowerCase().includes("create") ||
                                      aiPrompt.toLowerCase().includes("rewrite")
                                     aiPrompt.toLowerCase().includes("generate") ||
                                     aiPrompt.toLowerCase().includes("build") ||
                                     aiPrompt.toLowerCase().includes("new");
          
          // Special case for TypeScript conversions - treat as new project
          const isTypeScriptConversion = aiPrompt.toLowerCase().includes("typescript") || 
                                        aiPrompt.toLowerCase().includes("ts") ||
                                        aiPrompt.toLowerCase().includes("convert to typescript");
          
          // Prepare prompt with appropriate context
          let contextEnrichedPrompt = aiPrompt;
          
          // For regular modifications (but not TypeScript conversions)
          if (isModificationRequest && !isTypeScriptConversion) {
            // Find AI-generated files to include as context
            const aiGeneratedFiles = Object.entries(fileHistory)
              .filter(([_, meta]) => meta.createdBy === 'ai')
              .map(([fileName, _]) => fileName);
            
            if (aiGeneratedFiles.length > 0) {
              contextEnrichedPrompt += "\n\nHere are the current files I've generated:\n";
              
              for (const fileName of aiGeneratedFiles) {
                contextEnrichedPrompt += `\nFile: ${fileName}\n\`\`\`\n${openFiles[fileName] || fileTree[fileName]?.file.content}\n\`\`\`\n`;
              }
              
              contextEnrichedPrompt += "\nPlease modify these files according to my request.";
            }
          } 
          // For TypeScript conversions, provide context but instruct to create new files
          else if (isTypeScriptConversion) {
            // Find AI-generated files to include as context
            const aiGeneratedFiles = Object.entries(fileHistory)
              .filter(([_, meta]) => meta.createdBy === 'ai')
              .map(([fileName, _]) => fileName);
            
            if (aiGeneratedFiles.length > 0) {
              contextEnrichedPrompt += "\n\nHere are the current files I've generated:\n";
              
              for (const fileName of aiGeneratedFiles) {
                contextEnrichedPrompt += `\nFile: ${fileName}\n\`\`\`\n${openFiles[fileName] || fileTree[fileName]?.file.content}\n\`\`\`\n`;
              }
              
              contextEnrichedPrompt += "\nPlease convert this project to TypeScript by creating new TypeScript files with appropriate extensions and configuration files. Don't simply modify the existing files, but transform the project structure for TypeScript.";
            }
          }
          
          // Send the enriched prompt to the AI
          const res = await api.post("/ai", { prompt: contextEnrichedPrompt });

          // Add AI response to messages
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: res.data.text,
              sender: "AI",
              name: "others",
            },
          ]);
          
          // Replace the current parsing logic with this more robust approach:
          let responseData = res.data;

          // Ensure responseData is an object
          if (typeof responseData === 'string') {
            try {
              // Basic JSON parse
              responseData = JSON.parse(responseData);
            } catch (parseError) {
              console.error("Failed initial JSON parse:", parseError);
              
              // Try to salvage the response - extract what looks like a JSON object
              const possibleJson = responseData.match(/(\{[\s\S]*\})/);
              if (possibleJson && possibleJson[1]) {
                try {
                  responseData = JSON.parse(possibleJson[1]);
                } catch (e) {
                  // If still failing, create a minimal valid response
                  responseData = {
                    text: responseData,
                    fileTree: {}
                  };
                }
              } else {
                // No JSON-like content found
                responseData = {
                  text: responseData,
                  fileTree: {}
                };
              }
            }
          }

          // Handle the case where responseData is empty or null
          if (!responseData || typeof responseData !== 'object') {
            responseData = {
              text: "Received invalid response format",
              fileTree: {}
            };
          }

          // Now ensure fileTree exists
          if (!responseData.fileTree) {
            responseData.fileTree = {};
          }

          // Process the fileTree data
          if (Object.keys(responseData.fileTree).length > 0) {
            console.log("Processing file tree:", responseData.fileTree);
            
            // Create a properly typed updatedFileTree
            const updatedFileTree: Record<string, { file: { content: string } }> = {};
            
            // Process each file with simplified, robust extraction
            Object.entries(responseData.fileTree).forEach(([fileName, fileData]) => {
              let content = "";
              
              if (fileData) {
                if (typeof fileData === 'string') {
                  // Direct string content
                  content = fileData;
                } else if (typeof fileData === 'object') {
                  // Try various possible structures
                  const fd = fileData as any;
                  
                  if (fd.file?.contents) content = fd.file.contents;
                  else if (fd.file?.content) content = fd.file.content;
                  else if (fd.contents) content = fd.contents;
                  else if (fd.content) content = fd.content;
                  else if (Object.values(fd)[0] && typeof Object.values(fd)[0] === 'string') {
                    // Try the first string value if everything else fails
                    content = Object.values(fd)[0] as string;
                  }
                }
              }
              
              // Always add the file to the tree, even with empty content
              updatedFileTree[fileName] = { file: { content } };
            });
            
            // For new projects OR TypeScript conversions, replace the entire file tree
            if (isNewProjectRequest || isTypeScriptConversion) {
              // Replace entire file tree
              setFileTree(() => {
                console.log("Creating new project/TypeScript conversion, replacing file tree");
                return updatedFileTree;
              });
              
              // Clear open files and tabs for fresh start
              setOpenFiles({});
              setOpenFileTabs([]);
            } else {
              // Merge with existing file tree for regular modifications
              setFileTree(prevTree => {
                console.log("Updating existing file tree");
                return { ...prevTree, ...updatedFileTree };
              });
            }
            
            // Update openFiles state and record AI changes safely
            setOpenFiles(prev => {
              const newOpenFiles = { ...prev };
              
              // Add/update all files from the AI response to openFiles
              Object.entries(updatedFileTree).forEach(([fileName, fileObj]) => {
                const fileContent = fileObj.file.content;
                newOpenFiles[fileName] = fileContent;
                
                // Record that the AI modified this file
                recordAIChange(fileName, fileContent);
              });
              
              return newOpenFiles;
            });
            
            // Force selection of a file to make it visible
            const files = Object.keys(responseData.fileTree);
            if (files.length > 0) {
              // Prioritize .ts files if possible
              const tsFile = files.find(file => file.endsWith('.ts'));
              setSelectedFile(tsFile || files[0]);
              
              // Ensure this file is in the open tabs
              setOpenFileTabs(prev => {
                const fileToOpen = tsFile || files[0];
                return prev.includes(fileToOpen) ? prev : [...prev, fileToOpen];
              });
            }
            
            setCodeType(responseData.codeType);
            
            // Add a notification that files were updated
            setMessages(prev => [
              ...prev,
              {
                id: prev.length + 1,
                text: `✅ Files updated: ${Object.keys(responseData.fileTree).join(', ')}`,
                sender: "System",
                name: "others"
              }
            ]);
          }
        } catch (err) {
          console.warn(err);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "⚠️ AI Error: Unable to process request.",
              sender: "System",
              name: "others",
            },
          ]);
        }
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [user, projectId, fileHistory, fileTree, openFiles]);

  /** ✅ Scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ✅ Send Message */
  const sendMessageButton = () => {
    if (newMessage.trim() === "") return;
    sendMessage("project-message", { message: newMessage, sender: user as string });
    setNewMessage("");
  };

  /** ✅ Update file content in memory */
  const updateFileContent = async (fileName: string, newContent: string) => {
    try {
      // Update file tree state
      setFileTree(prevTree => ({
        ...prevTree,
        [fileName]: {
          file: { content: newContent }
        }
      }));
      
      // Store in openFiles state for in-memory persistence
      setOpenFiles(prev => ({
        ...prev,
        [fileName]: newContent
      }));
      
      // Record this change in our file history
      recordUserChange(fileName, newContent);
      
    } catch (err: any) {
      console.error("Error updating file:", err);
      
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error updating file "${fileName}": ${err.message}`,
          sender: "System",
          name: "others"
        }
      ]);
    }
  };

  // When a file is selected, check if we have it in openFiles first
  useEffect(() => {
    if (selectedFile) {
      if (openFiles[selectedFile]) {
        // Use the version from openFiles if available
        setFileTree(prevTree => ({
          ...prevTree,
          [selectedFile]: {
            file: { content: openFiles[selectedFile] }
          }
        }));
      } else if (fileTree[selectedFile]) {
        // Otherwise use the version from fileTree
        setOpenFiles(prev => ({
          ...prev,
          [selectedFile]: fileTree[selectedFile].file.content
        }));
      }
    }
  }, [selectedFile]);

  // When a file is selected, add it to open tabs if not already there
  useEffect(() => {
    if (selectedFile && !openFileTabs.includes(selectedFile)) {
      setOpenFileTabs(prev => [...prev, selectedFile]);
    }
  }, [selectedFile]);

  // Function to close a file tab
  const closeFileTab = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the tab selection
    
    // Remove from open tabs
    setOpenFileTabs(prev => prev.filter(tab => tab !== fileName));
    
    // If this is the currently selected file, select another one
    if (selectedFile === fileName) {
      const newIndex = openFileTabs.indexOf(fileName);
      if (openFileTabs.length > 1) {
        // Select the file to the left, or to the right if this is the first tab
        const newSelectedFile = openFileTabs[newIndex === 0 ? 1 : newIndex - 1];
        setSelectedFile(newSelectedFile);
      } else {
        // No other tabs open
        setSelectedFile(null);
      }
    }
  };

  /** ✅ Render files in a hierarchical structure */
  const renderFiles = () => {
    // Create a hierarchical structure from flat paths
    const fileStructure: Record<string, any> = {};
    
    Object.keys(fileTree).forEach(path => {
      if (!path) return; // Skip empty path
      
      try {
        // For paths like "src/index.ts"
        if (path.includes('/')) {
          const parts = path.split('/');
          if (parts.length === 0) return;
          
          let current = fileStructure;
          
          // Create directory structure
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!part) continue; // Skip empty parts
            
            if (!current[part]) {
              current[part] = { __isDirectory: true, __children: {} };
            } else if (!current[part].__isDirectory) {
              // Handle case where a file exists at this path already
              current[part] = { 
                __isDirectory: true, 
                __children: {},
                __file: current[part] // Save the original file if needed
              };
            }
            
            if (!current[part].__children) {
              current[part].__children = {};
            }
            
            current = current[part].__children;
          }
          
          // Add the file at the leaf if we have a valid part
          const fileName = parts[parts.length - 1];
          if (fileName && current) {
            current[fileName] = { path };
          }
        } else {
          // Handle top-level files
          fileStructure[path] = { path };
        }
      } catch (err) {
        console.error(`Error processing file path: ${path}`, err);
        // Still add the file at the top level as fallback
        fileStructure[path] = { path };
      }
    });
    
    // Recursive function to render the structure
    const renderNode = (node: any, key: string, level = 0): React.ReactElement => {
      if (node.__isDirectory) {
        return (
          <li key={key} className="pl-4">
            <div className="flex items-center py-1 cursor-pointer">
              <span className="font-medium">📁 {key}</span>
            </div>
            <ul className="pl-4">
              {Object.entries(node.__children).map(([childKey, childNode]) => 
                renderNode(childNode, childKey, level + 1)
              )}
            </ul>
          </li>
        );
      } else {
        return (
          <li key={node.path} className="pl-4">
            <div 
              className={`flex items-center py-1 cursor-pointer ${selectedFile === node.path ? 'bg-gray-200 rounded' : ''}`}
              onClick={() => setSelectedFile(node.path)}
            >
              <span>📄 {key}</span>
            </div>
          </li>
        );
      }
    };
    
    return Object.entries(fileStructure).map(([key, node]) => renderNode(node, key));
  };

  return (
      <div className="flex h-screen">      {/* Chat Interface - Left Column */}
          <div className="flex-shrink-0 w-80 border-r border-gray-200 flex flex-col">
          <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 px-4">
          <div className="relative flex items-center space-x-4">
            <div className="relative">
              <span className="absolute text-green-500 right-0 bottom-0">
                <svg width="20" height="20">
                  <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                </svg>
              </span>
              <img
                onClick={() => setIsModalOpen(true)}
                src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                alt="User Avatar"
                className="w-10 sm:w-16 h-10 sm:h-16 rounded-full cursor-pointer"
              />
            </div>
          </div>

          <button
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 focus:outline-none transition-all cursor-pointer"
            onClick={() => setUserAddModal(true)}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Messages Section */}
        <div className="flex flex-col space-y-4 p-3 overflow-y-auto flex-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message flex ${msg.name === "me" ? "justify-end" : ""}`}>
              <div className={`flex flex-col space-y-2 text-md max-w-xs mx-2 ${msg.name === "me" ? "order-1 items-end" : "order-2 items-start"}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.name === "me" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                  <p className="text-xs text-gray-500">{msg.sender}</p>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="border-t-2 border-gray-200 px-4 pt-4 pb-4">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Write your message..."
              className="w-full focus:outline-none text-gray-600 placeholder-gray-600 pl-4 bg-gray-200 rounded-md py-3"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessageButton()}
            />
            <button
              onClick={sendMessageButton}
              className="ml-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* File Explorer - Middle Column */}
      <div className="flex-shrink-0 w-64 bg-gray-600 text-white p-4">
        <h2 className="text-lg font-bold mb-3">Files</h2>
        <ul className="space-y-1">
          {renderFiles()}
        </ul>
      </div>

      {/* File Content Viewer - Right Column */}
      <div className="flex flex-col w-full bg-gray-100 p-0"> {/* Changed padding to 0 */}
        {/* New file tabs bar */}
        <div className="flex bg-gray-700 text-gray-300 overflow-x-auto">
          {openFileTabs.map(fileName => (
            <div 
              key={fileName}
              className={`flex items-center px-3 py-2 border-r border-gray-600 cursor-pointer ${
                selectedFile === fileName ? 'bg-gray-800 text-white' : 'hover:bg-gray-600'
              }`}
              onClick={() => setSelectedFile(fileName)}
            >
              <span className="truncate max-w-xs">{fileName}</span>
              <button 
                className="ml-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                onClick={(e) => closeFileTab(fileName, e)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {/* File content area */}
        <div className="flex-1 p-4">
          {selectedFile ? (
            <div className="flex flex-col w-full h-full">
              <FileEditor 
                selectedFile={selectedFile} 
                fileTree={fileTree} 
                code={codeType}
                onContentChange={updateFileContent}
                getFileMetadata={getFileMetadata}
                isAIGeneratedFile={isAIGeneratedFile}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-lg">
                Select a file to view its content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Modals */}
      <Users isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectName={projectName} />
      <UserAddModal isOpen={userAddModal} onClose={() => setUserAddModal(false)} projectName={projectName} />
    </div>
  );
};

export default Chat;
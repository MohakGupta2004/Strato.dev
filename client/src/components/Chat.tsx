import { useEffect, useRef, useState } from "react";
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          const res = await api.post("/ai", { prompt: aiPrompt });

          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: res.data.text,
              sender: "AI",
              name: "others",
            },
          ]);
          console.log(res.data)
          if(res.data.fileTree){
            // Create updated file tree
            const updatedFileTree = Object.fromEntries(
              Object.entries(res.data.fileTree).map(([fileName, fileData]) => [
                fileName,
                //@ts-ignore
                { file: { content: fileData.file.contents } },
              ])
            );
            
            // Update the file tree state
            setFileTree(updatedFileTree);
            
            // Update openFiles state to keep in sync with new/updated files
            setOpenFiles(prev => {
              const newOpenFiles = { ...prev };
              
              // Add/update all files from the AI response to openFiles
              for (const [fileName, fileData] of Object.entries(res.data.fileTree)) {
                //@ts-ignore
                newOpenFiles[fileName] = fileData.file.contents;
              }
              
              return newOpenFiles;
            });
            
            // Set the selected file to one of the updated files if no file is currently selected
            if (!selectedFile && Object.keys(res.data.fileTree).length > 0) {
              setSelectedFile(Object.keys(res.data.fileTree)[0]);
            }
            
            setCodeType(res.data.codeType)
          }
        } catch (err) {
          console.warn(err)
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
  }, [user, projectId]);

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
      
      // Add a system message to indicate successful save
      // setMessages(prev => [
      //   ...prev,
      //   {
      //     id: prev.length + 1,
      //     text: `File "${fileName}" updated in current session`,
      //     sender: "System",
      //     name: "others"
      //   }
      // ]);
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
          {Object.keys(fileTree).map((fileName) => (
            <li
              key={fileName}
              className="cursor-pointer p-2 rounded-md hover:bg-gray-700"
              onClick={() => setSelectedFile(fileName)}
            >
              {fileName}
            </li>
          ))}
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

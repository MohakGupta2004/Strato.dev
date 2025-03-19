import { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
import { FileText, Plus, X } from "lucide-react";
import { api } from "../utils/api";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../utils/socket";
import { UserAddModal } from "./UserModal";
import { getWebContainer } from "../utils/webContainer";
import { WebContainer } from "@webcontainer/api";
type FileNode = {
  file?: { contents: string };
  [key: string]: any;
};

type FlatFileTree = Record<string, { file: { contents: string } }>;

const flattenFileTree = (tree: FileNode, parentPath = "") => {
  let flatTree: FlatFileTree = {};
  Object.keys(tree).forEach((key) => {
    const fullPath = parentPath ? `${parentPath}/${key}` : key;
    if (tree[key].file) {
      flatTree[fullPath] = tree[key]; // ✅ Store file content
    } else {
      Object.assign(flatTree, flattenFileTree(tree[key], fullPath)); // ✅ Recursive flatten
    }
  });
  return flatTree;
};

const Chat = ({ projectId }: { projectId: string }) => {
  const authResult = new URLSearchParams(window.location.search);
  const projectName = authResult.get('name');

  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; name: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAddModal, setUserAddModal] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<Record<string, {file:{contents: string}}>>({})
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<Array<string>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [webContainer, setWebContainer] = useState<WebContainer|null>(null)
  /** ✅ Fetch user on mount */
  useEffect(() => {
    api.get('/auth/profile')
      .then((result) => {
        console.log("User Email:", result.data.message.email);
        setUser(result.data.message.email);
      })
      .catch((err) => console.log("Error fetching user:", err));
  }, []);

  /** ✅ Socket Connection with Cleanup */
  useEffect(() => {
    if (!user) return; // Ensure user is loaded before connecting to the socket

    initializeSocket(projectId);

    if(!webContainer){
      getWebContainer().then((container)=>{
        setWebContainer(container)
        console.log("container started",container)
      })
    }


    receiveMessage("project-message", async (data) => {
      console.log("Received AI response:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.message,
          sender: data.sender,
          name: data.sender == user ? "me":"others",
        },
      ])
      if (data.message.startsWith("@ai ")) {
        
        try {
          const result = await api.post("/ai", { prompt: data.message.slice(4) });
          console.log("AI FileTree Response:", result.data); // ✅ Debug AI response
          const parsedData = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
          if (parsedData.fileTree) {
            webContainer?.mount(flattenFileTree(parsedData.fileTree))  
            setFileTree(flattenFileTree(result.data.fileTree)); // ✅ Normalize structure
          }
    
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: result.data.text,
              sender: "AI",
              name: "others",
            },
          ]);
        } catch (error) {
          console.error("Error processing AI response:", error);
        }
      }
    });
    

    return () => {
      console.log("Disconnecting socket...");
      disconnectSocket(); // ✅ Cleanup to avoid duplicate event listeners
    };
  }, [user]); // ✅ Runs only when `user` is available

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
  
  return (
    <div className="relative flex h-screen">
      {/* Chat Interface */}
      <div className={`flex-1 p-2 sm:p-6 flex flex-col transition-all duration-300 ${isModalOpen ? "md:w-2/3" : "w-full"}`}>
        {/* Header */}
        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
          <div className="relative flex items-center space-x-4">
            <div className="relative">
              <span className="absolute text-green-500 right-0 bottom-0">
                <svg width="20" height="20">
                  <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                </svg>
              </span>
              <img
                onClick={() => setIsModalOpen(true)}
                src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1742070777~exp=1742074377~hmac=5c30c9257970b1ad1e91540eb6a5a5f2b8f40c4e9701af02992ec57310aa1b2c&w=740"
                alt="User Avatar"
                className="w-10 sm:w-16 h-10 sm:h-16 rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* Plus Button */}
          <button
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 focus:outline-none transition-all cursor-pointer"
            onClick={() => setUserAddModal(true)}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Messages Section */}
        <div className="flex flex-col space-y-4 p-3 overflow-y-auto h-full">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message flex ${msg.name === "me" ? "justify-end" : ""}`}>
              <div className={`flex flex-col space-y-2 text-md max-w-xs mx-2 ${msg.name === "me" ? "order-1 items-end" : "order-2 items-start"}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.name === "me" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                <p className={msg.name === "me"?"text-xs text-blue-950":"text-xs text-gray-500"}>{msg.sender}</p>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="border-t-2 border-gray-200 px-4 pt-4">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Write your message..."
              className="w-full focus:outline-none text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
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

      {/* Users Sliding Window */}
      <Users isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectName={projectName} />

      {/* User Add Modal */}
      <UserAddModal isOpen={userAddModal} onClose={() => setUserAddModal(false)} projectName={projectName} />


      <section className="bg-gray-900 text-white flex h-screen">
      {/* Sidebar - File Explorer */}
      <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
        <h2 className="text-sm font-semibold mb-3 text-gray-400">EXPLORER</h2>
        {Object.keys(fileTree).map((fileName) => (
          <div
            key={fileName}
            className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700 transition"
            onClick={() => {
              setCurrentFile(fileName);
              if (!openFiles.includes(fileName)) {
                setOpenFiles([...openFiles, fileName]);
              }
            }}
          >
            <FileText size={16} className="mr-2 text-gray-400" />
            <span className="text-sm">{fileName}</span>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="flex flex-col flex-1">
        {/* Open File Tabs */}

        {openFiles.length > 0 && (
          <div className="flex items-center bg-gray-800 px-4 border-b border-gray-700">
            {openFiles.map((file) => (
              <div
                key={file}
                className={`flex items-center px-4 py-2 rounded-t-md cursor-pointer ${
                  file === currentFile ? "bg-gray-900 text-blue-400" : "text-gray-400"
                }`}
                onClick={() => setCurrentFile(file)}
              >
                <span className="text-sm">{file}</span>
                <button
                  className="ml-2 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFiles(openFiles.filter((item) => item !== file));
                    if (currentFile === file) setCurrentFile(null);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1 p-4 bg-gray-900">
        <button className="text-lg" onClick={
            async ()=>{
              await webContainer?.mount(fileTree)
              
              const installProcess = await webContainer?.spawn('ls')
              installProcess?.output?.pipeTo(new WritableStream({
                     write(chunk) {
                        console.log(chunk)
                    }
               }))
            }

        }
        
        >ls</button>
          {currentFile ? (
            <>
              <h1 className="text-sm font-semibold text-gray-400">{currentFile}</h1>
              <textarea
                className="w-full h-[90%] bg-gray-800 text-white p-3 rounded-md font-mono text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fileTree[currentFile]?.file.contents || ""}
                onChange={(e) =>
                  setFileTree({
                    ...fileTree,
                    [currentFile]: { 
                      file:{
                        contents: e.target.value
                      } 
                    },
                  })
                }
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No file open
            </div>
          )}
        </div>
      </div>
    </section>

    </div>
  );
};

export default Chat
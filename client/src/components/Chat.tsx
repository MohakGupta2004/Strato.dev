import { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
import { FileText, Plus, X } from "lucide-react";
import { api } from "../utils/api";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../utils/socket";
import { UserAddModal } from "./UserModal";
import { getWebContainer } from "../utils/webContainer";
import { WebContainer } from "@webcontainer/api";
import { Editor } from "@monaco-editor/react";
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
    <div className=" relative flex h-screen">
      {/* Chat Interface */}
      <div className={`flex-1 p-4 sm:p-6 flex flex-col transition-all duration-300 ${isModalOpen ? "md:w-2/3" : "w-full"} bg-gray-900 shadow-md`}>
  {/* Header */}
  <div className="flex items-center justify-between py-4 px-4 bg-gray-800 rounded-t-lg shadow-sm">
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Online Status Indicator */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
        <img
          onClick={() => setIsModalOpen(true)}
          src="/proxy-image/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
          alt="User Avatar"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full cursor-pointer shadow-lg"
        />
      </div>
      <span className="text-lg font-semibold text-white">Chat</span>
    </div>

    {/* Add User Button */}
    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 focus:outline-none transition-all shadow-md" onClick={() => setUserAddModal(true)}>
      <Plus size={20} />
    </button>
  </div>

  {/* Messages Section */}
  <div className="flex flex-col space-y-3 p-4 overflow-y-auto h-full bg-gray-800 rounded-b-lg">
    {messages.map((msg) => (
      <div key={msg.id} className={`chat-message flex ${msg.name === "me" ? "justify-end" : "justify-start"}`}>
        <div className={`flex flex-col space-y-1 text-md max-w-xs mx-2 ${msg.name === "me" ? "items-end" : "items-start"}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.name === "me" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}>
            <p className={msg.name === "me" ? "text-xs text-blue-200" : "text-xs text-gray-400"}>{msg.sender}</p>
            {msg.text}
          </div>
        </div>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* Input Section */}
  <div className="border-t border-gray-700 px-4 py-3 bg-gray-800 shadow-md rounded-b-lg">
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full text-white placeholder-gray-400 px-4 py-3 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessageButton()}
      />
      <button
        onClick={sendMessageButton}
        className="ml-2 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 focus:outline-none shadow-lg transition-transform transform hover:scale-105"
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


      <section className="bg-gray-900 text-white flex h-screen w-2/3">
  {/* Sidebar - File Explorer */}
  <div className="w-64 bg-gray-800/90 backdrop-blur-md p-4 border-r border-gray-700 shadow-lg">
    <h2 className="text-sm font-semibold mb-3 text-gray-400">EXPLORER</h2>
    {Object.keys(fileTree).map((fileName) => (
      <div
        key={fileName}
        className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
        onClick={() => {
          setCurrentFile(fileName);
          if (!openFiles.includes(fileName)) {
            setOpenFiles([...openFiles, fileName]);
          }
        }}
      >
        <FileText size={16} className="mr-2 text-gray-300" />
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
            className={`flex items-center px-4 py-2 rounded-t-md cursor-pointer transition-all duration-200 ${
              file === currentFile ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"
            }`}
            onClick={() => setCurrentFile(file)}
          >
            <span className="text-sm">{file}</span>
            <button
              className="ml-2 text-gray-400 hover:text-red-500 transition"
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
    <div className="flex-1 p-4 bg-gray-900 flex-grow">
      <div className={currentFile?"relative h-full":'h-full'}>
        {/* Run Button */}
        <button
          className="cursor-pointer absolute right-4 top-9 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300"
          onClick={async () => {
            await webContainer?.mount(fileTree);

            const installProcess = await webContainer?.spawn('npm', ['i']);
            installProcess?.output?.pipeTo(
              new WritableStream({
                write(chunk) {
                  console.log(chunk);
                },
              })
            );

            const runProcess = await webContainer?.spawn('npm', ['start']);
            runProcess?.output?.pipeTo(
              new WritableStream({
                write(chunk) {
                  console.log(chunk);
                },
              })
            );
          }}
        >
          ▶
        </button>

        {/* File Name */}
        <h1 className="text-sm font-semibold text-gray-400 mb-2">{currentFile}</h1>

        {/* Code Editor Area */}
        <div className="w-full h-[90%] border border-gray-700 rounded-lg shadow-md">
      <Editor
        height="100%"
        width="100%"
        language="javascript"
        className="pt-15"
        theme="custom-dark"
        value={currentFile ? fileTree[currentFile]?.file?.contents || "" : ""}
        onChange={(value) => {
          if (currentFile && value !== undefined) {
            setFileTree({
              ...fileTree,
              [currentFile]: {
                file: {
                  contents: value,
                },
              },
            });
          }
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          wordWrap: 'on'
        }}
        beforeMount={(monaco) => {
          // Define a custom theme that mimics Tailwind's bg-gray-800 (#1F2937)
          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#1F2937', // Tailwind bg-gray-800
              'editor.foreground': '#FFFFFF', // White text
              // You can add additional colors here if needed
            },
          });
        }}
      />
    </div>

      </div>
    </div>
  </div>
</section>


    </div>
  );
};

export default Chat
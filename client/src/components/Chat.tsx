import { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
import { Plus, X } from "lucide-react";
import { api } from "../utils/api";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../utils/socket";

const Chat = ({ projectId }: { projectId: string }) => {
  const authResult = new URLSearchParams(window.location.search);
  const projectName = authResult.get('name');

  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; name: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAddModal, setUserAddModal] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    receiveMessage("project-message", (data) => {
      console.log("Received:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.message,
          sender: data.sender,
          name: data.sender === user ? "me" : "others",
        },
      ]);
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
    </div>
  );
};
  
// User Add Modal - Centered Popup with Background Blur
function UserAddModal({ isOpen, onClose, projectName }: { isOpen: boolean; onClose: () => void, projectName: string | null}) {
  const [user, setUser] = useState("")
  const [message, setMessage] = useState("")
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Collaborator</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter username or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e)=>setUser(e.target.value)}
            />
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all cursor-pointer"
              onClick={()=>{
                api.post(`/project/add`,{
                  name: projectName,
                  email:user
                }).then((result)=>{
                  setMessage(result.data.message.message)
                })
                setTimeout(()=>{
                  onClose()
                },2000)
              }}
            >
              Add
            </button>
            {message && <p className="text-center">{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;

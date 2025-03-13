import { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
const Chat = () => {
    const [messages, setMessages] = useState([
      { id: 1, text: "Can be verified on any platform using docker", sender: "other" },
      { id: 2, text: "Your error message says permission denied, npm global installs must be given root privileges.", sender: "me" },
      { id: 3, text: "Command was run with root privileges. I'm sure about that.", sender: "other" },
      { id: 4, text: "Any updates on this issue? I'm getting the same error when trying to install devtools. Thanks", sender: "me" },
    ]);
  
    const [newMessage, setNewMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    // Scroll to the bottom when a new message is added
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    const sendMessage = () => {
      if (newMessage.trim() === "") return;
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: newMessage, sender: "me" },
      ]);
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
                  src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?auto=format&fit=facearea&facepad=3&w=144&h=144"
                  alt="User Avatar"
                  className="w-10 sm:w-16 h-10 sm:h-16 rounded-full cursor-pointer"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="text-2xl mt-1 flex items-center">
                  <span className="text-gray-700 mr-3">Anderson Vanhron</span>
                </div>
                <span className="text-lg text-gray-600">Junior Developer</span>
              </div>
            </div>
          </div>
  
          {/* Messages Section */}
          <div className="flex flex-col space-y-4 p-3 overflow-y-auto h-full">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message flex ${msg.sender === "me" ? "justify-end" : ""}`}>
                <div className={`flex flex-col space-y-2 text-md max-w-xs mx-2 ${msg.sender === "me" ? "order-1 items-end" : "order-2 items-start"}`}>
                  <div className={`px-4 py-2 rounded-lg ${msg.sender === "me" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
                    {msg.text}
                  </div>
                </div>
                <img
                  src={
                    msg.sender === "me"
                      ? "https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?auto=format&fit=facearea&facepad=3&w=144&h=144"
                      : "https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?auto=format&fit=facearea&facepad=3&w=144&h=144"
                  }
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
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
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>
  
        {/* Users Sliding Window */}
        <Users isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  };
  
  



export default Chat;

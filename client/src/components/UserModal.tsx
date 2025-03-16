import { useState } from "react";
import { api } from "../utils/api";
import { X } from "lucide-react";

export function UserAddModal({ isOpen, onClose, projectName }: { isOpen: boolean; onClose: () => void; projectName: string | null }) {
    const [user, setUser] = useState("");
    const [message, setMessage] = useState("");
  
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
              <input type="text" placeholder="Enter username or email..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setUser(e.target.value)} />
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all cursor-pointer"
                onClick={() => {
                  api.post(`/project/add`, { name: projectName, email: user }).then((result) => setMessage(result.data.message.message));
                  setTimeout(() => onClose(), 2000);
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
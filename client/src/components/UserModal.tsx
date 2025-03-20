import { useState } from "react";
import { api } from "../utils/api";
import { X } from "lucide-react";

export function UserAddModal({ isOpen, onClose, projectName }: { isOpen: boolean; onClose: () => void; projectName: string | null }) {
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-96 border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">Add Collaborator</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                <X size={20} />
              </button>
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Enter username or email..."
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUser(e.target.value)}
            />

            {/* Add Button */}
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition-all shadow-md"
              onClick={() => {
                api.post(`/project/add`, { name: projectName, email: user }).then((result) => setMessage(result.data.message.message));
                setTimeout(() => onClose(), 2000);
              }}
            >
              Add
            </button>

            {/* Success/Error Message */}
            {message && <p className="text-center mt-2 text-gray-300">{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from "react";

interface CommitMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  commitMessage: string | null;
  projectId: string;
  onOpen?: () => void;
}

const CommitMessageModal: React.FC<CommitMessageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  commitMessage,
  projectId,
}) => {
  const [message, setMessage] = useState(commitMessage || "");

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Direct 🟢 CommitMessageModal - Received projectId:", projectId);
    onSubmit(message);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center backdrop-blur-md z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 w-96 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Enter Commit Message</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-600 bg-gray-800 rounded-md p-2 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your commit message..."
        />
        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition shadow-lg"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 text-white rounded-md px-4 py-2 hover:bg-gray-600 transition shadow-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommitMessageModal;

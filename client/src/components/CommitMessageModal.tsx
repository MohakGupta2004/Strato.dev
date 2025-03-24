import React, { useState, useEffect } from 'react'

interface CommitMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void; // Function to handle commit message submission
  commitMessage: string | null;
  projectId: string
  onOpen?: () => void;
}

const CommitMessageModal: React.FC<CommitMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  commitMessage, 
  projectId
}) => {
  
  const [message, setMessage] = useState(commitMessage || '');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    console.log("Direct 🟢 CommitMessageModal - Received projectId:", projectId); // Debugging
    onSubmit(message)
  };

  return (
    <div className="z-70 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Enter Commit Message</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
          placeholder="Type your commit message here..."
        />
        <div className="flex justify-between">
          <button 
            onClick={handleSubmit} 
            className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
          >
            Submit
          </button>
          <button 
            onClick={onClose} 
            className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};



export default CommitMessageModal 
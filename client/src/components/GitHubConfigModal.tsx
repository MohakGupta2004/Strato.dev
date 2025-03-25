import React, { useState } from "react";

interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitHubConfigModal: React.FC<GitHubConfigModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState<string>("");
  const [pat, setPat] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("githubUsername", username);
    localStorage.setItem("githubPAT", pat);
    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl border border-gray-700 w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">GitHub Configuration</h2>
        <form onSubmit={handleSubmit}>
          {/* GitHub Username Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">GitHub Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* GitHub PAT Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Personal Access Token</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubConfigModal;

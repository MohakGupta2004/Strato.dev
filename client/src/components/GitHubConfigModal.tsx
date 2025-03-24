import React, { useState } from 'react';

interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitHubConfigModal: React.FC<GitHubConfigModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState<string>('');
  const [pat, setPat] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('githubUsername', username);
    localStorage.setItem('githubPAT', pat);
    onClose(); // Close the modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="z-80 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">GitHub Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">GitHub Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Personal Access Token</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end ">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubConfigModal; 
import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import GitHubConfigModal from './GitHubConfigModal';
import DepositFundsModal from './DepositFundsModal';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositFundsModalOpen, setDepositFundsModalOpen] = useState(false);
  const { address, isConnected } = useAccount(); // Get wallet address
  const { disconnect } = useDisconnect(); // Disconnect wallet
  const navigate = useNavigate(); // Navigation hook

  // Sample balance and wallet address for demonstration
  const balance = 100; // Replace with actual balance logic
  const walletAddress = address || '0x0'; // Use the connected wallet address

  // Redirect to /wallet if not authenticated
  useEffect(() => {
    if (!isConnected) {
      navigate('/wallet'); // Redirect to wallet connection page
    }
  }, [isConnected, navigate]);

  const handleDeposit = () => {

    // Add logic to handle deposit
  };

  const handleWithdraw = () => {
    // Add logic to handle withdrawal
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
      {/* App Name */}
      <h1 className="text-xl font-semibold">My App</h1>

      {/* Buttons Section */}
      <div className="flex space-x-4">
        {/* Deposit Funds Button */}
        <button
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          onClick={() => setDepositFundsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> Deposit Funds
        </button>

        {/* GitHub Configuration Button */}
        <button
          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faGithub} className="mr-2" /> GitHub Configuration
        </button>

        {/* Wallet Address Display */}
        {isConnected ? (
          <div className="flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-300">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <span className="text-gray-400">Not Connected</span>
        )}
      </div>

      {/* GitHub Modal */}
      <GitHubConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Deposit Funds Modal */}
      <DepositFundsModal
        isOpen={depositFundsModalOpen}
        onClose={() => setDepositFundsModalOpen(false)}
        balance={balance}
        walletAddress={walletAddress}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </nav>
  );
};

export default Navbar;

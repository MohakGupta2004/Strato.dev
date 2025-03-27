import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import CommitMessageModal from './CommitMessageModal';
import DepositFundsModal from './DepositFundsModal';
import { api } from '../utils/api';
import { getBalance } from '../utils/getBalance';
import { deposit } from '../utils/sendDeposit';
import { withdrawFunds } from '../utils/getWithdraw';

interface PushToGithubProps {
  projectId: string;
  fileTree: any;
  paymentDone: boolean
}

const PushToGithub: React.FC<PushToGithubProps> = ({ projectId, fileTree, paymentDone }) => {
  const [commitMessageModalOpen, setCommitMessageModalOpen] = useState(false);
  const [depositFundsModalOpen, setDepositFundsModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const { address, isConnected } = useAccount(); // Get wallet address
  const [balance, setBalance] = useState<number>(12);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { disconnect } = useDisconnect(); // Wallet disconnect
  const navigate = useNavigate(); // Navigation
  const walletAddress = address || "0x0";

  // Redirect to /wallet if not authenticated
  useEffect(() => {
    if (!isConnected) {
      navigate('/wallet');
    }
  }, [isConnected, navigate]);

  const handlePushToGithub = () => {
    setCommitMessageModalOpen(true);
  };

  // Fetch balance when walletAddress changes
  useEffect(() => {
    if (walletAddress !== "0x0") {
      getBalance(walletAddress).then((res) => {
        setBalance(Number(res));
      });
    }
  }, [walletAddress, paymentDone]);

  const handleCommitMessageSubmit = async (message: string) => {
    if (!localStorage.getItem("githubPAT")) return;

    const filteredFileTree = Object.keys(fileTree)
      .filter((path) => !path.startsWith(".git"))
      .reduce((acc, path) => {
        acc[path] = fileTree[path];
        return acc;
      }, {} as typeof fileTree);

    console.log(filteredFileTree);
    const result = await api.post('/git/push', {
      repoUrl: localStorage.getItem(`${projectId}_repoUrl`),
      token: localStorage.getItem("githubPAT"),
      message: message,
      fileTree: filteredFileTree
    });

    console.log(result);
    setCommitMessageModalOpen(false);
  };

  const handleDeposit = async (amount: number) => {
    console.log("Deposited amount:", amount);
    try {
      // Attempt to perform deposit
      const result = await deposit(amount, walletAddress);
      console.log(result);
      
      // Update balance if deposit succeeded
      if (result) {
        // Option 1: Update state directly if you trust the amount
        setBalance((prevBalance) => prevBalance + amount);
        // Option 2: Alternatively, re-fetch balance from the contract:
        // getBalance(walletAddress).then((res) => setBalance(Number(res)));
        
        setErrorMessage(''); // Clear any previous error message
      }
    } catch (error) {
      console.error("Deposit error:", error);
      // Set an error message to be shown on the modal
      setErrorMessage("Deposit failed: insufficient funds or transaction error.");
    }
  };

  const handleWithdraw = async() => {
    // Add logic to handle withdrawal
    try {
        // Attempt to perform deposit
        const result = await withdrawFunds(walletAddress);
        console.log(result);
        
        // Update balance if deposit succeeded
        if (result) {
          // Option 1: Update state directly if you trust the amount
          setBalance(0);
          // Option 2: Alternatively, re-fetch balance from the contract:
          // getBalance(walletAddress).then((res) => setBalance(Number(res)));
          
          setErrorMessage(''); // Clear any previous error message
        }
      } catch (error) {
        console.error("Withdraw error:", error);
        // Set an error message to be shown on the modal
        setErrorMessage("Deposit failed: insufficient funds or transaction error.");
      }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
      {/* App Name */}
      <h1 className="text-xl font-semibold">My app</h1>

      {/* Buttons Section */}
      <div className="flex space-x-4">
        {/* Deposit Funds Button */}
        <button
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          onClick={() => setDepositFundsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> Deposit Funds
        </button>

        {/* Push to GitHub Button */}
        <button
          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
          onClick={handlePushToGithub}
        >
          <FontAwesomeIcon icon={faGithub} className="mr-2" /> Push to GitHub
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

      {/* Commit Message Modal */}
      <CommitMessageModal
        isOpen={commitMessageModalOpen}
        onClose={() => setCommitMessageModalOpen(false)}
        onSubmit={handleCommitMessageSubmit}
        commitMessage={commitMessage}
        projectId={projectId}
      />

      {/* Deposit Funds Modal with error message prop */}
      <DepositFundsModal
        isOpen={depositFundsModalOpen}
        onClose={() => setDepositFundsModalOpen(false)}
        balance={balance}
        walletAddress={walletAddress}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        errorMessage={errorMessage}
      />
    </nav>
  );
};

export default PushToGithub;

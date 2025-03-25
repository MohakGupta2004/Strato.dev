import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount(); // Check if the user is connected

  useEffect(() => {
    if (isConnected) {
      navigate("/"); // Redirect to Home on successful login
    }
  }, [isConnected, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      {/* Blurred Glassmorphic Card */}
      <div className="relative bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-96 border border-gray-700">
        

        {/* Heading */}
        <h1 className="text-2xl font-semibold mb-4 text-gray-100 text-center">Connect Your Wallet</h1>
        
        {/* Description */}
        <p className="mb-6 text-gray-400 text-center">Please connect your wallet to proceed.</p>
        
        {/* Wallet Connect Button */}
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;

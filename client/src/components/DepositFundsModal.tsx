import React, { useState } from 'react';

interface DepositFundsModalProps {
    isOpen: boolean; // Controls the visibility of the modal
    onClose: () => void; // Function to close the modal
    balance: number; // User's current balance
    walletAddress: string; // User's wallet address
    onDeposit: (amount: number) => void; // Function to handle deposit
    onWithdraw: () => void; // Function to handle withdrawal
    errorMessage?: string; // Optional error message to display
}

const DepositFundsModal: React.FC<DepositFundsModalProps> = ({
    isOpen,
    onClose,
    balance,
    walletAddress,
    onDeposit,
    onWithdraw,
    errorMessage,
}) => {
    const [amount, setAmount] = useState<number | string>(''); // State for the input amount

    if (!isOpen) return null; // Don't render if not open

    const handleDeposit = () => {
        const numericAmount = Number(amount);
        if (numericAmount > 0) {
            onDeposit(numericAmount);
            setAmount(''); // Clear input after deposit
        }
    };

    const handleWithdraw = () => onWithdraw();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center backdrop-blur-md z-50">
            <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 w-96 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-200">Deposit Funds</h2>
                <p className="mb-2">
                    Wallet Address: {walletAddress.slice(0, 5)}...{walletAddress.slice(-7)}
                </p>
                <p className="mb-4">Balance: {balance} ETH</p>
                {/* Show error message if provided */}
                {errorMessage && (
                    <p className="mb-4 text-red-500 font-semibold">{errorMessage}</p>
                )}
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-800 rounded-md p-2 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                />
                <div className="flex justify-between">
                    <button
                        onClick={handleDeposit}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition shadow-lg"
                    >
                        Deposit
                    </button>
                    <button
                        onClick={handleWithdraw}
                        className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition shadow-lg"
                    >
                        Withdraw
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

export default DepositFundsModal;

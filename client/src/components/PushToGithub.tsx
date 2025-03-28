import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import CommitMessageModal from './CommitMessageModal';
import { api } from '../utils/api';

interface PushToGithubProps {
    projectId: string;
    fileTree: any;
}

const PushToGithub: React.FC<PushToGithubProps> = ({ projectId, fileTree }) => {
    const [commitMessageModalOpen, setCommitMessageModalOpen] = useState(false);
    const [commitMessage, setCommitMessage] = useState<string | null>(null);
    const { address, isConnected } = useAccount(); // Get wallet address
    const { disconnect } = useDisconnect(); // Wallet disconnect
    const navigate = useNavigate(); // Navigation

    // Redirect to /wallet if not authenticated
    useEffect(() => {
        if (!isConnected) {
            navigate('/wallet');
        }
    }, [isConnected, navigate]);

    const handlePushToGithub = () => {
        setCommitMessageModalOpen(true);
    };

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

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
            {/* App Name */}
            <h1 className="text-xl font-semibold cursor-pointer" onClick={() => navigate('/')} >My App</h1>

            {/* Buttons Section */}
            <div className="flex items-center space-x-4">
                {/* Deposit Funds Button */}
                <div className='tooltip-container'>
                    <button id='text1' className="text px-4 py-2 bg-green-600 hover:bg-green-700 text-white">
                        <FontAwesomeIcon icon={faDollarSign} className="" />
                    </button>
                    <span className='tooltip flex'>Deposit Funds</span>
                </div>

                {/* Push to GitHub Button */}

                <div className='tooltip-container'>
                    <button
                        // flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition
                        className="text px-4 py-2"
                        id='text2'
                        onClick={handlePushToGithub}
                    >
                        <FontAwesomeIcon icon={faGithub} className="" />
                    </button>
                    <div className='tooltip flex'>Push to GitHub</div>
                </div>

                {/* Wallet Address Display */}
                {isConnected ? (
                    <div className="flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-300">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                        <button
                            onClick={() => disconnect()}
                            // className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            className="group flex items-center justify-start h-8 w-8 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1">
                            <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                                <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                                </svg>
                            </div>
                            <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all ease-in-out duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                Log out
                            </div>
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
        </nav>
    );
};

export default PushToGithub;

import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import CommitMessageModal from './CommitMessageModal'
import { api } from '../utils/api'

interface PushToGithubProps {
    projectId: string; // Ensure projectId is passed as a prop
    fileTree: any;
}

const PushToGithub: React.FC<PushToGithubProps> = ({ projectId, fileTree }) => {
    const [commitMessageModalOpen, setCommitMessageModalOpen] = useState(false)
    const [commitMessage, setCommitMessage] = useState<string | null>(null)

    const handlePushToGithub = () => {
        // Open the commit message modal
        setCommitMessageModalOpen(true)
    }

    const handleCommitMessageSubmit = async (message: string) => {
        if (!localStorage.getItem("githubPAT")) {
            return;
        }
    
        // Filter out .git folder entries
        const filteredFileTree = Object.keys(fileTree)
            .filter((path) => !path.startsWith(".git")) // Exclude .git folder files
            .reduce((acc, path) => {
                acc[path] = fileTree[path];
                return acc;
            }, {} as typeof fileTree);
            
        console.log(filteredFileTree)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8f9fa' }}>
            <h1>My App</h1>
            <div>
                <button style={{ margin: '0 10px' }}>
                    <FontAwesomeIcon icon={faDollarSign} /> Deposit Funds
                </button>
                
                <button 
                    className='cursor-pointer'
                    style={{ margin: '0 10px' }} 
                    onClick={handlePushToGithub}
                >
                    <FontAwesomeIcon icon={faGithub} /> Push to GitHub
                </button>
            </div>

            <CommitMessageModal 
                isOpen={commitMessageModalOpen} 
                onClose={() => setCommitMessageModalOpen(false)} 
                onSubmit={handleCommitMessageSubmit} 
                commitMessage={commitMessage} 
                projectId={projectId} // Pass projectId to the modal
            />
        </div>
    )
}

export default PushToGithub
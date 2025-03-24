import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import GitHubConfigModal from './GitHubConfigModal'

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f8f9fa' }}>
      <h1>My App</h1>
      <div>
        <button style={{ margin: '0 10px' }}>
          <FontAwesomeIcon icon={faDollarSign} /> Deposit Funds
        </button>
        
          <button 
            style={{ margin: '0 10px' }} 
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faGithub} /> GitHub Configuration
          </button>
      </div>
      <GitHubConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default Navbar
import React from 'react'
import { FaTimes } from 'react-icons/fa'
import './CancelContractModal.css'

const CancelContractModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Cancel Contract</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p className="cancel-modal-message">
            Are you sure you wish to cancel this contract? All entered information will be deleted. This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Close
          </button>
          <button 
            className="modal-confirm-cancel-btn" 
            onClick={onConfirm}
          >
            <span>Yes, Cancel</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelContractModal


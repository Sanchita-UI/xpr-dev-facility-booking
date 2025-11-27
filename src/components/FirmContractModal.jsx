import React from 'react'
import { FaTimes } from 'react-icons/fa'
import './FirmContractModal.css'

const FirmContractModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Firm Contract</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p className="firm-modal-message">
            Are you sure you wish to firm this contract? Any further changes to this contract will be considered amendments. This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Close
          </button>
          <button 
            className="modal-firm-btn" 
            onClick={onConfirm}
          >
            <span>Yes, Firm Contract</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FirmContractModal


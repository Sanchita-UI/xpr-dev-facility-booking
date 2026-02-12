import React from 'react'
import BaseModalRadix from './BaseModalRadix'
import './CancelContractModal.css'

const CancelContractModal = ({ isOpen, onClose, onConfirm }) => {
  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={onClose}
      >
        Close
      </button>
      <button 
        type="button" 
        className="btn btn-danger" 
        onClick={onConfirm}
      >
        Yes, Cancel
      </button>
    </>
  )

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Contract"
      size="medium"
      footer={footer}
    >
      <p className="cancel-modal-message mb-0">
        Are you sure you wish to cancel this contract? All entered information will be deleted. This action cannot be undone.
      </p>
    </BaseModalRadix>
  )
}

export default CancelContractModal


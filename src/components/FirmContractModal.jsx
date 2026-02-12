import React from 'react'
import BaseModalRadix from './BaseModalRadix'
import './FirmContractModal.css'

const FirmContractModal = ({ isOpen, onClose, onConfirm }) => {
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
        className="btn btn-primary" 
        onClick={onConfirm}
      >
        Yes, Firm Contract
      </button>
    </>
  )

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Firm Contract"
      size="medium"
      footer={footer}
    >
      <p className="firm-modal-message mb-0">
        Are you sure you wish to firm this contract? Any further changes to this contract will be considered amendments. This action cannot be undone.
      </p>
    </BaseModalRadix>
  )
}

export default FirmContractModal


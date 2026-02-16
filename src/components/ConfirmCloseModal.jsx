import React from 'react'
import { FaSpinner } from 'react-icons/fa'
import BaseModalRadix from './BaseModalRadix'

const ConfirmCloseModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Are you sure you want to close without saving?",
  loading = false // Show small spinner during async operations
}) => {
  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
      <button 
        type="button" 
        className="btn btn-primary" 
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <>
            <FaSpinner className="me-2" style={{ 
              animation: 'spin 1s linear infinite',
              display: 'inline-block',
              fontSize: '0.875rem'
            }} />
            Processing...
          </>
        ) : (
          'Yes, Close'
        )}
      </button>
    </>
  )

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={footer}
      size="medium"
      resizable={false}
      description="Confirmation dialog for unsaved changes"
    >
      <p className="mb-0">{message}</p>
    </BaseModalRadix>
  )
}

export default ConfirmCloseModal

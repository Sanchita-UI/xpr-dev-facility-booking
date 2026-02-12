import React from 'react'
import { FaTimes } from 'react-icons/fa'
import './BaseModal.css'

const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium', // small, medium, large, xlarge
  className = ''
}) => {
  if (!isOpen) return null

  return (
    <div className="base-modal-overlay" onClick={onClose}>
      <div 
        className={`base-modal-content base-modal-${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="base-modal-header">
          <h2 className="base-modal-title">{title}</h2>
          <button className="base-modal-close-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="base-modal-body">
          {children}
        </div>
        {footer && (
          <div className="base-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default BaseModal


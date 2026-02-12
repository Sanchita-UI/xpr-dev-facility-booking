import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import './BaseModalRadix.css'

const BaseModalRadix = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium', // small, medium, large, xlarge
  className = '',
  description // Optional description for accessibility
}) => {
  const getBootstrapSizeClass = (size) => {
    const sizeMap = {
      small: 'modal-sm',
      medium: '',
      large: 'modal-lg',
      xlarge: 'modal-xl'
    }
    return sizeMap[size] || ''
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop fade show" />
        <Dialog.Content 
          className={`modal fade show d-block ${className}`}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          <div className={`modal-dialog modal-dialog-centered ${getBootstrapSizeClass(size)}`}>
            <div className="modal-content">
              <div className="modal-header">
                <Dialog.Title className="modal-title h5">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="visually-hidden">
                  {description || title}
                </Dialog.Description>
                <Dialog.Close 
                  className="btn-close" 
                  aria-label="Close"
                  type="button"
                >
                  <FaTimes />
                </Dialog.Close>
              </div>
              
              <div className="modal-body">
                {children}
              </div>
              
              {footer && (
                <div className="modal-footer">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BaseModalRadix


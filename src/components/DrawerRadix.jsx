import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import './DrawerRadix.css'

const DrawerRadix = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  position = 'right', // left, right, top, bottom
  size = 'medium', // small, medium, large
  className = '',
  description
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-backdrop fade show" />
        <Dialog.Content 
          className={`drawer drawer-${position} drawer-${size} ${className}`}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          <div className="drawer-content">
            <div className="drawer-header">
              <Dialog.Title className="drawer-title h5">
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
            
            <div className="drawer-body">
              {children}
            </div>
            
            {footer && (
              <div className="drawer-footer">
                {footer}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default DrawerRadix


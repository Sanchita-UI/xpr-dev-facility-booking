import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { FaTimes, FaSpinner } from 'react-icons/fa'
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
  description,
  showDescription = false, // If true, shows description visibly; if false, uses visually-hidden for a11y
  preventClose = false, // Prevent close if unsaved changes
  onCloseAttempt = null, // Callback when user tries to close
  loading = false // Show loading spinner overlay
}) => {
  const handleOpenChange = (open) => {
    if (!open) {
      if (preventClose && onCloseAttempt) {
        // Trigger confirmation
        onCloseAttempt(() => {
          // User confirmed, allow close
          onClose()
        })
      } else {
        onClose()
      }
    }
  }

  const handleEscapeKey = (e) => {
    if (preventClose && onCloseAttempt) {
      e.preventDefault()
      onCloseAttempt(() => onClose())
    } else {
      onClose()
    }
  }

  const handlePointerDownOutside = (e) => {
    if (preventClose && onCloseAttempt) {
      e.preventDefault()
      onCloseAttempt(() => onClose())
    } else {
      onClose()
    }
  }

  const handleCloseClick = () => {
    if (preventClose && onCloseAttempt) {
      onCloseAttempt(() => onClose())
    } else {
      onClose()
    }
  }

  // Map position to Bootstrap offcanvas position classes
  const getOffcanvasPositionClass = (position) => {
    const positionMap = {
      right: 'offcanvas-end',
      left: 'offcanvas-start',
      top: 'offcanvas-top',
      bottom: 'offcanvas-bottom'
    }
    return positionMap[position] || 'offcanvas-end'
  }

  // Map size to custom size classes (Bootstrap doesn't have size variants for offcanvas)
  const getSizeClass = (size) => {
    if (size === 'small' || size === 'medium' || size === 'large') {
      return `offcanvas-${size}`
    }
    return ''
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
        <Dialog.Content 
          className={`offcanvas ${getOffcanvasPositionClass(position)} ${getSizeClass(size)} show d-block ${className}`}
          onEscapeKeyDown={handleEscapeKey}
          onPointerDownOutside={handlePointerDownOutside}
        >
          <div className="offcanvas-header">
            <div className="offcanvas-header-content">
              <Dialog.Title className="offcanvas-title h5">
                {title}
              </Dialog.Title>
              {showDescription && description && (
                <Dialog.Description className="offcanvas-description">
                  {description}
                </Dialog.Description>
              )}
              {!showDescription && (
                <Dialog.Description className="visually-hidden">
                  {description || title}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close 
              className="btn-close" 
              aria-label="Close"
              type="button"
              onClick={handleCloseClick}
            >
              <FaTimes />
            </Dialog.Close>
          </div>
          
          <div className="offcanvas-body" style={{ position: 'relative' }}>
            {loading && (
              <div className="drawer-loading-overlay">
                <div className="drawer-loading-spinner">
                  <FaSpinner className="spinner-icon" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
            {children}
          </div>
          
          {footer && (
            <div className="offcanvas-footer">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default DrawerRadix


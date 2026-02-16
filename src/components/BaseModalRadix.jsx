import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  description, // Optional description for accessibility
  hideCloseButton = false, // Option to hide the close button
  resizable = true, // Enable/disable resize functionality
  resizeDirections = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    topLeft: true,
    topRight: true,
    bottomRight: true,
    bottomLeft: true
  }, // Control which directions can be resized
  minWidth = 300, // Minimum width in pixels
  minHeight = 200, // Minimum height in pixels
  maxWidth = null, // Maximum width in pixels (null = viewport - 40px)
  maxHeight = null, // Maximum height in pixels (null = viewport - 40px)
  initialWidth = null, // Initial width in pixels (null = use Bootstrap default)
  initialHeight = null // Initial height in pixels (null = use Bootstrap default)
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [modalSize, setModalSize] = useState({ 
    width: initialWidth, 
    height: initialHeight 
  })
  const modalDialogRef = useRef(null)
  const modalContentRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, direction: '' })
  const animationFrameRef = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef({ width: initialWidth, height: initialHeight })

  const getBootstrapSizeClass = (size) => {
    const sizeMap = {
      small: 'modal-sm',
      medium: '',
      large: 'modal-lg',
      xlarge: 'modal-xl'
    }
    return sizeMap[size] || ''
  }

  const handleOpenChange = (open) => {
    if (!open) {
      onClose()
      // Reset position and size when modal closes
      setPosition({ x: 0, y: 0 })
      setModalSize({ width: initialWidth, height: initialHeight })
      positionRef.current = { x: 0, y: 0 }
      sizeRef.current = { width: initialWidth, height: initialHeight }
      if (modalDialogRef.current) {
        modalDialogRef.current.style.transform = ''
        modalDialogRef.current.style.transition = ''
        if (initialWidth) {
          modalDialogRef.current.style.width = ''
        }
        if (initialHeight) {
          modalDialogRef.current.style.height = ''
        }
      }
    }
  }

  // Reset transform when dragging stops
  useEffect(() => {
    if (!isDragging && !isResizing && modalDialogRef.current) {
      // Restore smooth transition after drag/resize
      modalDialogRef.current.style.transition = 'transform 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out'
      // Sync final position
      if (positionRef.current.x !== 0 || positionRef.current.y !== 0) {
        modalDialogRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`
      }
      // Sync final size
      if (sizeRef.current.width || sizeRef.current.height) {
        if (sizeRef.current.width) {
          modalDialogRef.current.style.width = `${sizeRef.current.width}px`
          modalDialogRef.current.style.maxWidth = `${sizeRef.current.width}px`
        }
        if (sizeRef.current.height) {
          modalDialogRef.current.style.height = `${sizeRef.current.height}px`
        }
      }
    }
  }, [isDragging, isResizing])

  // Apply initial size when modal opens
  useEffect(() => {
    if (isOpen && modalDialogRef.current && (initialWidth || initialHeight)) {
      if (initialWidth) {
        modalDialogRef.current.style.width = `${initialWidth}px`
        modalDialogRef.current.style.maxWidth = `${initialWidth}px`
      }
      if (initialHeight) {
        modalDialogRef.current.style.height = `${initialHeight}px`
      }
    }
  }, [isOpen, initialWidth, initialHeight])

  // Handle mouse down on header - optimized for smooth dragging
  const handleMouseDown = useCallback((e) => {
    // Don't start drag if clicking on close button or its children
    if (e.target.closest('.modal-close-btn') || e.target.closest('.btn-close')) {
      return
    }
    
    const rect = modalDialogRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsDragging(true)
    
    // Sync position ref with current state
    positionRef.current = { ...position }
    
    // Get the actual modal center position on screen (accounting for current transform)
    const modalCenterX = rect.left + rect.width / 2
    const modalCenterY = rect.top + rect.height / 2
    
    // Store the offset from where user clicked to modal center
    // This maintains the relative position during drag
    dragStartRef.current = {
      x: e.clientX - modalCenterX,
      y: e.clientY - modalCenterY
    }
  }, [position])

  // Optimized mouse move handler using requestAnimationFrame
  const handleMouseMove = useCallback((e) => {
    if (!modalDialogRef.current) return

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!modalDialogRef.current) return

      const modalRect = modalDialogRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate where the modal center should be based on mouse position
      // The dragStart offset maintains the relative position from click point
      const newModalCenterX = e.clientX - dragStartRef.current.x
      const newModalCenterY = e.clientY - dragStartRef.current.y
      
      // Convert to position relative to viewport center
      const viewportCenterX = viewportWidth / 2
      const viewportCenterY = viewportHeight / 2
      let newX = newModalCenterX - viewportCenterX
      let newY = newModalCenterY - viewportCenterY

      // Constrain to viewport bounds (keep modal fully visible)
      const maxX = (viewportWidth - modalRect.width) / 2
      const maxY = (viewportHeight - modalRect.height) / 2
      newX = Math.max(-maxX, Math.min(maxX, newX))
      newY = Math.max(-maxY, Math.min(maxY, newY))

      // Update ref immediately for next frame
      positionRef.current = { x: newX, y: newY }
      
      // Update DOM directly for smooth dragging (avoid React re-render during drag)
      if (modalDialogRef.current) {
        modalDialogRef.current.style.transform = `translate(${newX}px, ${newY}px)`
        modalDialogRef.current.style.transition = 'none'
      }
    })
  }, [])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Sync ref position and size to state for final render
    setPosition(positionRef.current)
    setModalSize(sizeRef.current)
  }, [])

  // Handle resize start
  const handleResizeStart = useCallback((e, direction) => {
    if (!resizable) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = modalDialogRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsResizing(true)
    
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
      direction: direction
    }
    
    sizeRef.current = { ...modalSize }
  }, [modalSize, resizable])

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !modalDialogRef.current) return

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!modalDialogRef.current) return

      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      const direction = resizeStartRef.current.direction
      
      let newWidth = resizeStartRef.current.width
      let newHeight = resizeStartRef.current.height
      
      // Minimum and maximum sizes (use props or defaults)
      const minW = minWidth
      const minH = minHeight
      const maxW = maxWidth !== null ? maxWidth : window.innerWidth - 40
      const maxH = maxHeight !== null ? maxHeight : window.innerHeight - 40

      // Calculate new dimensions based on resize direction
      if (direction.includes('right')) {
        newWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.width + deltaX))
      }
      if (direction.includes('left')) {
        newWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.width - deltaX))
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.height + deltaY))
      }
      if (direction.includes('top')) {
        newHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.height - deltaY))
      }

      // Update ref
      sizeRef.current = { width: newWidth, height: newHeight }
      
      // Update DOM directly for smooth resizing
      if (modalDialogRef.current) {
        modalDialogRef.current.style.width = `${newWidth}px`
        modalDialogRef.current.style.height = `${newHeight}px`
        modalDialogRef.current.style.transition = 'none'
      }
    })
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight])

  // Set up event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      // Use passive listeners where possible for better performance
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp)
      // Prevent default to avoid text selection
      document.addEventListener('selectstart', (e) => e.preventDefault())
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Set up event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('selectstart', (e) => e.preventDefault())
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isResizing, handleResizeMove, handleMouseUp])

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop fade show" />
        <Dialog.Content 
          className={`modal fade show d-block ${className}`}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          <div 
            ref={modalDialogRef}
            className={`modal-dialog modal-dialog-centered ${getBootstrapSizeClass(size)} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
            style={{
              transform: !isDragging && (position.x !== 0 || position.y !== 0)
                ? `translate(${position.x}px, ${position.y}px)` 
                : undefined,
              transition: (isDragging || isResizing) ? 'none' : 'transform 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out',
              margin: isDragging && (position.x !== 0 || position.y !== 0) ? '0' : undefined,
              willChange: (isDragging || isResizing) ? 'transform, width, height' : 'auto',
              width: modalSize.width ? `${modalSize.width}px` : (initialWidth ? `${initialWidth}px` : undefined),
              height: modalSize.height ? `${modalSize.height}px` : (initialHeight ? `${initialHeight}px` : undefined),
              maxWidth: modalSize.width ? `${modalSize.width}px` : (initialWidth ? `${initialWidth}px` : undefined),
              minWidth: `${minWidth}px`,
              minHeight: `${minHeight}px`
            }}
          >
            <div ref={modalContentRef} className={`modal-content ${resizable ? 'modal-content-resizable' : ''}`}>
              {/* Resize handles - only show if resizable is enabled */}
              {resizable && (
                <>
                  {resizeDirections.top && (
                    <div className="resize-handle resize-handle-top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
                  )}
                  {resizeDirections.right && (
                    <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
                  )}
                  {resizeDirections.bottom && (
                    <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
                  )}
                  {resizeDirections.left && (
                    <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
                  )}
                  {resizeDirections.topRight && (
                    <div className="resize-handle resize-handle-top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')} />
                  )}
                  {resizeDirections.bottomRight && (
                    <div className="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} />
                  )}
                  {resizeDirections.bottomLeft && (
                    <div className="resize-handle resize-handle-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} />
                  )}
                  {resizeDirections.topLeft && (
                    <div className="resize-handle resize-handle-top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')} />
                  )}
                </>
              )}
              <div 
                className="modal-header modal-header-draggable"
                onMouseDown={handleMouseDown}
              >
                <Dialog.Title className="modal-title h5">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="visually-hidden">
                  {description || title}
                </Dialog.Description>
                {!hideCloseButton && (
                  <Dialog.Close 
                    className="btn-close modal-close-btn" 
                    aria-label="Close"
                    type="button"
                  >
                    <FaTimes />
                  </Dialog.Close>
                )}
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


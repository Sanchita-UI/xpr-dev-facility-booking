import React, { useEffect, useState, useRef } from 'react'
import { FaExclamationCircle, FaUndo, FaTimes } from 'react-icons/fa'
import './DeleteToast.css'

const DeleteToast = ({ message, onUndo, onClose, t, duration = 4000 }) => {
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef(null)
  const animationFrameRef = useRef(null)
  const isCompletedRef = useRef(false)
  const lastProgressRef = useRef(100)

  // Initialize timer when toast is created
  useEffect(() => {
    if (!t || isCompletedRef.current) return

    // Initialize only once when toast is created
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
      isCompletedRef.current = false
      lastProgressRef.current = 100
      setProgress(100)
    }

    const updateProgress = () => {
      if (isCompletedRef.current) return

      const now = Date.now()
      
      // Calculate elapsed time: current time - start time
      const elapsed = now - startTimeRef.current
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100
      
      // Update progress
      setProgress(progressPercent)
      lastProgressRef.current = progressPercent

      if (progressPercent > 0) {
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(updateProgress)
      } else {
        // Animation complete - close the toast
        animationFrameRef.current = null
        isCompletedRef.current = true
        if (onClose) {
          onClose()
        }
      }
    }

    // Start the animation loop only if not already running
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [t, duration, onClose]) // Only re-run when toast or duration changes


  return (
    <div className="delete-toast-container">
      <div className="delete-toast-content-wrapper">
        <div className="delete-toast-content">
          <div className="delete-icon-wrapper">
            <FaExclamationCircle className="delete-icon" />
          </div>
          <span className="delete-message">{message}</span>
        </div>
        <div className="delete-toast-actions">
          <button 
            className="undo-button" 
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              // Stop the progress animation
              if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
              }
              isCompletedRef.current = true
              // Only call onUndo, not onClose - let handleUndoDelete handle the replacement
              if (onUndo) {
                onUndo()
              }
            }}
            aria-label="Restore deleted row"
            type="button"
          >
            <FaUndo className="undo-icon" />
            <span>Restore</span>
          </button>
          <button 
            className="close-button" 
            onClick={(e) => {
              e.stopPropagation()
              if (onClose) {
                onClose()
              }
            }}
            aria-label="Close"
          >
            <FaTimes className="close-icon" />
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="toast-progress-bar-container">
        <div 
          className="toast-progress-bar"
          style={{ 
            width: `${progress}%`,
            backgroundColor: '#e74c3c'
          }}
        />
      </div>
    </div>
  )
}

export default DeleteToast


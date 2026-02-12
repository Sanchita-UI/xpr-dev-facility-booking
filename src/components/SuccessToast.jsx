import React, { useEffect, useState, useRef } from 'react'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'
import './SuccessToast.css'

const SuccessToast = ({ message, onClose, t, duration = 4000 }) => {
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
    <div className="success-toast-container">
      <div className="success-toast-content-wrapper">
        <div className="success-toast-content">
          <div className="success-icon-wrapper">
            <FaCheckCircle className="success-icon" />
          </div>
          <span className="success-message">{message}</span>
        </div>
        <button 
          className="success-close-button" 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onClose) {
              onClose()
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label="Close"
          type="button"
        >
          <FaTimes className="success-close-icon" />
        </button>
      </div>
      {/* Progress Bar */}
      <div className="toast-progress-bar-container">
        <div 
          className="toast-progress-bar"
          style={{ 
            width: `${progress}%`,
            backgroundColor: '#34C759'
          }}
        />
      </div>
    </div>
  )
}

export default SuccessToast


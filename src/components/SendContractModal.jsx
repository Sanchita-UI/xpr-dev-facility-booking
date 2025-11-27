import React, { useState } from 'react'
import { FaEnvelope, FaTimes } from 'react-icons/fa'
import './SendContractModal.css'

const SendContractModal = ({ isOpen, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    to: 'Ava Spencer <ava.spencer@email.com>',
    cc: '',
    message: ''
  })

  const handleSend = () => {
    if (formData.message.trim()) {
      onSend(formData)
      // Reset form after sending
      setFormData({
        to: 'Ava Spencer <ava.spencer@email.com>',
        cc: '',
        message: ''
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Send Contract</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="to-field">To</label>
            <input
              id="to-field"
              type="text"
              className="form-input"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cc-field">CC</label>
            <input
              id="cc-field"
              type="text"
              className="form-input"
              value={formData.cc}
              onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="message-field">Message</label>
            <div className="textarea-wrapper">
              <textarea
                id="message-field"
                className="form-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your optional message here"
                maxLength={2000}
              />
              <span className="char-counter">{formData.message.length}/2000</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-send-btn" 
            disabled={!formData.message.trim()}
            onClick={handleSend}
          >
            <FaEnvelope />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendContractModal


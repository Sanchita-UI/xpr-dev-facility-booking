import React, { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import BaseModalRadix from './BaseModalRadix'
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

  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={onClose}
      >
        Cancel
      </button>
      <button 
        type="button" 
        className="btn btn-primary" 
        disabled={!formData.message.trim()}
        onClick={handleSend}
      >
        <FaEnvelope className="me-2" />
        Send
      </button>
    </>
  )

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onClose}
      title="Send Contract"
      size="medium"
      footer={footer}
    >
      <div className="mb-3">
        <label htmlFor="to-field" className="form-label">To</label>
        <input
          id="to-field"
          type="text"
          className="form-control"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="cc-field" className="form-label">CC</label>
        <input
          id="cc-field"
          type="text"
          className="form-control"
          value={formData.cc}
          onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
          placeholder=""
        />
      </div>
      <div className="mb-3">
        <label htmlFor="message-field" className="form-label">Message</label>
        <textarea
          id="message-field"
          className="form-control"
          rows="5"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Type your optional message here"
          maxLength={2000}
        />
        <div className="form-text text-muted">
          {formData.message.length}/2000
        </div>
      </div>
    </BaseModalRadix>
  )
}

export default SendContractModal


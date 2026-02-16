import React from 'react'
import BaseModalRadix from './BaseModalRadix'

const ViewSessionModal = ({ isOpen, onClose, session }) => {
  if (!session) return null

  const footer = (
    <button type="button" className="btn btn-secondary" onClick={onClose}>
      Close
    </button>
  )

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onClose}
      title="Contract Preview"
      footer={footer}
      size="large"
      resizable={false}
      description="View contract details"
    >
      <div className="view-session-content">
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Start Date:</strong> {session.startDate || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>End Date:</strong> {session.endDate || 'N/A'}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Start Time:</strong> {session.startTime || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>End Time:</strong> {session.endTime || 'N/A'}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Location:</strong> {session.location || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>Facility:</strong> {session.facility || 'N/A'}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Extra Fees:</strong> {session.extraFees || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>Fee:</strong> {session.fee || 'N/A'}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Price:</strong> {session.price || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>Include:</strong> {session.include ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </BaseModalRadix>
  )
}

export default ViewSessionModal

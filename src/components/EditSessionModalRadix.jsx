import React, { useState, useEffect } from 'react'
import { FaSave } from 'react-icons/fa'
import BaseModalRadix from './BaseModalRadix'
import './EditSessionModal.css'

const EditSessionModalRadix = ({ 
  isOpen, 
  onClose, 
  session, 
  onSave,
  locationFacilityMap,
  calculateFee,
  calculatePrice,
  convertToDateInputFormat,
  convertFromDateInputFormat,
  convertToTimeInputFormat,
  convertFromTimeInputFormat
}) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    facility: '',
    extraFees: '',
    fee: '',
    price: '',
    include: true
  })

  const [errors, setErrors] = useState({})

  // Initialize form data when session changes
  useEffect(() => {
    if (session) {
      setFormData({
        startDate: convertToDateInputFormat(session.startDate || ''),
        endDate: convertToDateInputFormat(session.endDate || ''),
        startTime: convertToTimeInputFormat(session.startTime || ''),
        endTime: convertToTimeInputFormat(session.endTime || ''),
        location: session.location || '',
        facility: session.facility || '',
        extraFees: session.extraFees || '',
        fee: session.fee || '',
        price: session.price || '',
        include: session.include !== undefined ? session.include : true
      })
      setErrors({})
    }
  }, [session, convertToDateInputFormat, convertToTimeInputFormat])

  // Get available facilities for selected location
  const getAvailableFacilities = (location) => {
    return locationFacilityMap[location] || []
  }

  // Handle location change - update facility and recalculate fee/price
  const handleLocationChange = (newLocation) => {
    const availableFacilities = getAvailableFacilities(newLocation)
    const currentFacility = formData.facility
    
    // If current facility is not available for new location, reset to first available
    let newFacility = availableFacilities[0] || ''
    if (availableFacilities.includes(currentFacility)) {
      newFacility = currentFacility
    }

    const newFee = newFacility ? calculateFee(newLocation, newFacility) : ''
    const newPrice = newFacility ? calculatePrice(newLocation, newFacility) : ''

    setFormData({
      ...formData,
      location: newLocation,
      facility: newFacility,
      fee: newFee,
      price: newPrice
    })
  }

  // Handle facility change - recalculate fee/price
  const handleFacilityChange = (newFacility) => {
    const newFee = calculateFee(formData.location, newFacility)
    const newPrice = calculatePrice(formData.location, newFacility)
    
    setFormData({
      ...formData,
      facility: newFacility,
      fee: newFee,
      price: newPrice
    })
  }

  // Validate form
  const validate = () => {
    const newErrors = {}
    
    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate.trim()) {
      newErrors.endDate = 'End date is required'
    }
    if (!formData.startTime.trim()) {
      newErrors.startTime = 'Start time is required'
    }
    if (!formData.endTime.trim()) {
      newErrors.endTime = 'End time is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.facility.trim()) {
      newErrors.facility = 'Facility is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = () => {
    if (!validate()) {
      return
    }

    const updatedSession = {
      ...session,
      startDate: convertFromDateInputFormat(formData.startDate),
      endDate: convertFromDateInputFormat(formData.endDate),
      startTime: convertFromTimeInputFormat(formData.startTime),
      endTime: convertFromTimeInputFormat(formData.endTime),
      location: formData.location,
      facility: formData.facility,
      extraFees: formData.extraFees,
      fee: formData.fee,
      price: formData.price,
      include: formData.include
    }

    onSave(updatedSession)
    onClose()
  }

  if (!session) return null

  const availableFacilities = getAvailableFacilities(formData.location)
  const allLocations = Object.keys(locationFacilityMap)

  return (
    <BaseModalRadix
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Session"
      size="large"
      description="Edit session details including dates, times, location, and facility information."
      footer={
        <>
          <button className="edit-modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="edit-modal-save-btn" onClick={handleSave}>
            <FaSave />
            <span>Save Changes</span>
          </button>
        </>
      }
    >
      <div className="edit-session-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">Start Date <span className="required">*</span></label>
            <input
              id="start-date"
              type="date"
              className={`form-input ${errors.startDate ? 'error' : ''}`}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="end-date">End Date <span className="required">*</span></label>
            <input
              id="end-date"
              type="date"
              className={`form-input ${errors.endDate ? 'error' : ''}`}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-time">Start Time <span className="required">*</span></label>
            <input
              id="start-time"
              type="time"
              className={`form-input ${errors.startTime ? 'error' : ''}`}
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            {errors.startTime && <span className="error-message">{errors.startTime}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="end-time">End Time <span className="required">*</span></label>
            <input
              id="end-time"
              type="time"
              className={`form-input ${errors.endTime ? 'error' : ''}`}
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            {errors.endTime && <span className="error-message">{errors.endTime}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location <span className="required">*</span></label>
            <select
              id="location"
              className={`form-input ${errors.location ? 'error' : ''}`}
              value={formData.location}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              <option value="">Select Location</option>
              {allLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="facility">Facility <span className="required">*</span></label>
            <select
              id="facility"
              className={`form-input ${errors.facility ? 'error' : ''}`}
              value={formData.facility}
              onChange={(e) => handleFacilityChange(e.target.value)}
              disabled={!formData.location}
            >
              <option value="">Select Facility</option>
              {availableFacilities.map(facility => (
                <option key={facility} value={facility}>{facility}</option>
              ))}
            </select>
            {errors.facility && <span className="error-message">{errors.facility}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="extra-fees">Extra Fees</label>
            <input
              id="extra-fees"
              type="text"
              className="form-input"
              value={formData.extraFees}
              onChange={(e) => setFormData({ ...formData, extraFees: e.target.value })}
              placeholder="Enter extra fees"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fee">Fee</label>
            <input
              id="fee"
              type="text"
              className="form-input"
              value={formData.fee}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="text"
              className="form-input"
              value={formData.price}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>

          <div className="form-group">
            <label htmlFor="include" className="checkbox-label">
              <input
                id="include"
                type="checkbox"
                checked={formData.include}
                onChange={(e) => setFormData({ ...formData, include: e.target.checked })}
              />
              <span>Include</span>
            </label>
          </div>
        </div>
      </div>
    </BaseModalRadix>
  )
}

export default EditSessionModalRadix


import React, { useState, useEffect, useRef } from 'react'
import { FaSave } from 'react-icons/fa'
import DrawerRadix from './DrawerRadix'
import ConfirmCloseModal from './ConfirmCloseModal'
import Tooltip from './Tooltip'
import './EditSessionModal.css'

const EditSessionModal = ({ 
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
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const initialFormDataRef = useRef(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const pendingCloseCallbackRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form data when session changes
  useEffect(() => {
    if (session) {
      const initialData = {
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
      }
      setFormData(initialData)
      initialFormDataRef.current = initialData
      setHasUnsavedChanges(false)
      setErrors({})
    }
  }, [session, convertToDateInputFormat, convertToTimeInputFormat])

  // Check for unsaved changes whenever formData changes
  useEffect(() => {
    if (initialFormDataRef.current && session) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current)
      setHasUnsavedChanges(hasChanges)
    }
  }, [formData, session])

  // Get available facilities for selected location
  const getAvailableFacilities = (location) => {
    return locationFacilityMap[location] || []
  }

  // Validate location (same as inline edit)
  const validateLocation = (location) => {
    const allLocations = Object.keys(locationFacilityMap)
    if (!location || !location.trim()) {
      return 'Location is required'
    }
    if (!allLocations.includes(location.trim())) {
      return `Invalid location. Must be one of: ${allLocations.join(', ')}`
    }
    return null
  }

  // Handle location change - update facility and recalculate fee/price
  const handleLocationChange = (newLocation) => {
    // Validate location in real-time
    const locationError = validateLocation(newLocation)
    const newErrors = { ...errors }
    if (locationError) {
      newErrors.location = locationError
    } else {
      delete newErrors.location
    }
    setErrors(newErrors)

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
    const allLocations = Object.keys(locationFacilityMap)
    
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
    } else if (!allLocations.includes(formData.location.trim())) {
      newErrors.location = `Invalid location. Must be one of: ${allLocations.join(', ')}`
    }
    if (!formData.facility.trim()) {
      newErrors.facility = 'Facility is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validate()) {
      return
    }

    setIsSaving(true)

    try {
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

      // Call onSave and check if it returns a Promise
      const saveResult = onSave(updatedSession)
      
      // If onSave returns a Promise, await it; otherwise add a small delay for UX
      if (saveResult && typeof saveResult.then === 'function') {
        await saveResult
      } else {
        // Simulate async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setHasUnsavedChanges(false)
      onClose()
    } catch (error) {
      console.error('Error saving session:', error)
      // You can add error handling/toast notification here
    } finally {
      setIsSaving(false)
    }
  }

  // Handle close attempt with confirmation
  const handleCloseAttempt = (confirmClose) => {
    if (hasUnsavedChanges) {
      pendingCloseCallbackRef.current = confirmClose
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  // Handle confirm close
  const handleConfirmClose = () => {
    setShowConfirmClose(false)
    if (pendingCloseCallbackRef.current) {
      pendingCloseCallbackRef.current()
      pendingCloseCallbackRef.current = null
    }
    setHasUnsavedChanges(false)
  }

  // Handle cancel close
  const handleCancelClose = () => {
    setShowConfirmClose(false)
    pendingCloseCallbackRef.current = null
  }

  // Handle cancel button
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      handleCloseAttempt(() => onClose())
    } else {
      onClose()
    }
  }

  if (!session) return null

  const availableFacilities = getAvailableFacilities(formData.location)
  const allLocations = Object.keys(locationFacilityMap)

  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={handleCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
      <button 
        type="button" 
        className="btn btn-primary" 
        onClick={handleSave}
        disabled={isSaving}
      >
        <FaSave className="me-2" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  )

  return (
    <>
      <DrawerRadix
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Session"
        position="right"
        size="large"
        footer={footer}
        preventClose={hasUnsavedChanges || isSaving}
        onCloseAttempt={handleCloseAttempt}
        loading={isSaving}
      >
      <div className="edit-session-form">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="start-date" className="form-label">
              Start Date <span className="text-danger">*</span>
            </label>
            <input
              id="start-date"
              type="date"
              className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="end-date" className="form-label">
              End Date <span className="text-danger">*</span>
            </label>
            <input
              id="end-date"
              type="date"
              className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label htmlFor="start-time" className="form-label">
              Start Time <span className="text-danger">*</span>
            </label>
            <input
              id="start-time"
              type="time"
              className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="end-time" className="form-label">
              End Time <span className="text-danger">*</span>
            </label>
            <input
              id="end-time"
              type="time"
              className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <Tooltip content="Enter a valid location. Available locations: Location A, Location B, Location C, Location D, Location E" side="right">
              <label htmlFor="location" className="form-label">
                Location <span className="text-danger">*</span>
              </label>
            </Tooltip>
            <Tooltip 
              content={errors.location || "Enter a valid location (e.g., Location A, Location B, Location C, Location D, Location E)"} 
              side="right"
            >
              <input
                type="text"
                id="location"
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                value={formData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onBlur={(e) => {
                  // Re-validate on blur
                  const error = validateLocation(e.target.value)
                  if (error) {
                    setErrors(prev => ({ ...prev, location: error }))
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.location
                      return newErrors
                    })
                  }
                }}
                placeholder="Enter location"
                style={{
                  borderColor: errors.location ? '#dc3545' : undefined,
                  borderWidth: errors.location ? '2px' : undefined
                }}
              />
            </Tooltip>
            {errors.location && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.location}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="facility" className="form-label">
              Facility <span className="text-danger">*</span>
            </label>
            <select
              id="facility"
              className={`form-select ${errors.facility ? 'is-invalid' : ''}`}
              value={formData.facility}
              onChange={(e) => handleFacilityChange(e.target.value)}
              disabled={!formData.location}
            >
              <option value="">Select Facility</option>
              {availableFacilities.map(facility => (
                <option key={facility} value={facility}>{facility}</option>
              ))}
            </select>
            {errors.facility && <div className="invalid-feedback">{errors.facility}</div>}
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label htmlFor="extra-fees" className="form-label">Extra Fees</label>
            <input
              id="extra-fees"
              type="text"
              className="form-control"
              value={formData.extraFees}
              onChange={(e) => setFormData({ ...formData, extraFees: e.target.value })}
              placeholder="Enter extra fees"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="fee" className="form-label">Fee</label>
            <input
              id="fee"
              type="text"
              className="form-control"
              value={formData.fee}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label htmlFor="price" className="form-label">Price</label>
            <input
              id="price"
              type="text"
              className="form-control"
              value={formData.price}
              readOnly
              placeholder="Auto-calculated"
            />
          </div>

          <div className="col-md-6">
            <div className="form-check mt-4">
              <input
                id="include"
                type="checkbox"
                className="form-check-input"
                checked={formData.include}
                onChange={(e) => setFormData({ ...formData, include: e.target.checked })}
              />
              <label htmlFor="include" className="form-check-label">
                Include
              </label>
            </div>
          </div>
        </div>
      </div>
    </DrawerRadix>

    {/* Confirmation Modal - Centered Popup */}
    <ConfirmCloseModal
      isOpen={showConfirmClose}
      onConfirm={handleConfirmClose}
      onCancel={handleCancelClose}
      title="Unsaved Changes"
      message="You have unsaved changes. Are you sure you want to close without saving?"
    />
    </>
  )
}

export default EditSessionModal


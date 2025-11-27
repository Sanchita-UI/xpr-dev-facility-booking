import React, { useState } from 'react'
import { FaArrowLeft, FaCopy, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaPlus, FaCheck, FaFileExport, FaFileAlt, FaPaperclip, FaToggleOn, FaToggleOff, FaList, FaTimes, FaSearch, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { sessionsData } from '../data/mockData'
import SendContractModal from '../components/SendContractModal'
import FirmContractModal from '../components/FirmContractModal'
import CancelContractModal from '../components/CancelContractModal'
import MapThumbnail from '../components/MapThumbnail'
import meetingRoomImage from '../assets/images/meeting-room.jpg'
import extrasImage from '../assets/images/extras.jpg'
import './ContractDetails.css'

const ContractDetails = () => {
  const [activeTab, setActiveTab] = useState('sessions')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showFirmNotification, setShowFirmNotification] = useState(false)
  
  // Pagination, Search, and Sorting states
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Inline editing states
  const [editingCell, setEditingCell] = useState(null) // { sessionId, field }
  const [editValue, setEditValue] = useState('') // Temporary value while editing
  const [newRowIds, setNewRowIds] = useState(new Set()) // Track newly added row IDs
  const [duplicatedRowIds, setDuplicatedRowIds] = useState(new Set()) // Track duplicated row IDs

  const tabs = [
    { id: 'sessions', label: 'Sessions', icon: FaList },
    { id: 'attachments', label: 'Attachments', icon: FaPaperclip },
  ]

  // Fetch sessions data from mock data and ensure all include flags are true by default
  const [sessions, setSessions] = useState(
    sessionsData.map(session => ({ ...session, include: session.include !== undefined ? session.include : true }))
  )

  // Location-Facility mapping
  const locationFacilityMap = {
    'Location A': ['Facility #1', 'Facility #2', 'Facility #3'],
    'Location B': ['Facility #4', 'Facility #5', 'Facility #6', 'Facility #7'],
    'Location C': ['Facility #8', 'Facility #9'],
    'Location D': ['Facility #10', 'Facility #11', 'Facility #12'],
    'Location E': ['Facility #13', 'Facility #14']
  }

  // Get available facilities for a given location
  const getAvailableFacilities = (location) => {
    return locationFacilityMap[location] || []
  }

  // All facilities (for reference)
  const allFacilities = [
    'Facility #1', 'Facility #2', 'Facility #3', 'Facility #4', 'Facility #5',
    'Facility #6', 'Facility #7', 'Facility #8', 'Facility #9', 'Facility #10',
    'Facility #11', 'Facility #12', 'Facility #13', 'Facility #14'
  ]

  // Handle facility change (now inline editable, but keep this for auto-update logic)
  const handleFacilityChange = (sessionId, newFacility) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        // Auto-update fee and price based on location and facility
        const updatedFee = calculateFee(session.location, newFacility)
        const updatedPrice = calculatePrice(session.location, newFacility)
        return { 
          ...session, 
          facility: newFacility,
          fee: updatedFee,
          price: updatedPrice
        }
      }
      return session
    })
    setSessions(updatedSessions)
  }

  // Auto-update fee and price when location changes
  const handleLocationSave = (sessionId, newLocation) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      // Check if current facility is available for the new location
      const availableFacilities = getAvailableFacilities(newLocation)
      let updatedFacility = session.facility
      
      // If current facility is not available for new location, set to first available facility
      if (!availableFacilities.includes(session.facility) && availableFacilities.length > 0) {
        updatedFacility = availableFacilities[0]
      }
      
      const updatedFee = calculateFee(newLocation, updatedFacility)
      const updatedPrice = calculatePrice(newLocation, updatedFacility)
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, location: newLocation, facility: updatedFacility, fee: updatedFee, price: updatedPrice }
          : s
      ))
    }
  }

  // Calculate fee based on location and facility (mock calculation)
  const calculateFee = (location, facility) => {
    // Simple calculation based on location and facility
    // You can replace this with your actual business logic
    const baseFee = 100
    const locationMultiplier = 
      location.toLowerCase().includes('location a') ? 1.1 : 
      location.toLowerCase().includes('location b') ? 1.15 : 
      location.toLowerCase().includes('location c') ? 1.2 : 
      location.toLowerCase().includes('location d') ? 1.25 : 
      location.toLowerCase().includes('location e') ? 1.3 : 1.0
    const facilityMultiplier = 
      facility === 'Facility #1' ? 1.1 : 
      facility === 'Facility #2' ? 1.2 : 
      facility === 'Facility #3' ? 1.15 : 
      facility === 'Facility #4' ? 1.25 : 
      facility === 'Facility #5' ? 1.3 : 
      facility === 'Facility #6' ? 1.35 : 
      facility === 'Facility #7' ? 1.4 : 
      facility === 'Facility #8' ? 1.2 : 
      facility === 'Facility #9' ? 1.25 : 
      facility === 'Facility #10' ? 1.3 : 
      facility === 'Facility #11' ? 1.35 : 
      facility === 'Facility #12' ? 1.4 : 
      facility === 'Facility #13' ? 1.3 : 
      facility === 'Facility #14' ? 1.35 : 1.0
    const calculatedFee = Math.round(baseFee * locationMultiplier * facilityMultiplier)
    return `$${calculatedFee.toFixed(2)}`
  }

  // Calculate price based on location and facility (mock calculation)
  const calculatePrice = (location, facility) => {
    // Simple calculation based on location and facility
    // You can replace this with your actual business logic
    const basePrice = 500
    const locationMultiplier = 
      location.toLowerCase().includes('location a') ? 1.1 : 
      location.toLowerCase().includes('location b') ? 1.15 : 
      location.toLowerCase().includes('location c') ? 1.2 : 
      location.toLowerCase().includes('location d') ? 1.25 : 
      location.toLowerCase().includes('location e') ? 1.3 : 1.0
    const facilityMultiplier = 
      facility === 'Facility #1' ? 1.1 : 
      facility === 'Facility #2' ? 1.2 : 
      facility === 'Facility #3' ? 1.15 : 
      facility === 'Facility #4' ? 1.25 : 
      facility === 'Facility #5' ? 1.3 : 
      facility === 'Facility #6' ? 1.35 : 
      facility === 'Facility #7' ? 1.4 : 
      facility === 'Facility #8' ? 1.2 : 
      facility === 'Facility #9' ? 1.25 : 
      facility === 'Facility #10' ? 1.3 : 
      facility === 'Facility #11' ? 1.35 : 
      facility === 'Facility #12' ? 1.4 : 
      facility === 'Facility #13' ? 1.3 : 
      facility === 'Facility #14' ? 1.35 : 1.0
    const calculatedPrice = Math.round(basePrice * locationMultiplier * facilityMultiplier)
    return `$${calculatedPrice.toFixed(2)}`
  }

  // Handle include toggle
  const handleIncludeToggle = (sessionId) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, include: !session.include }
        : session
    ))
  }

  // Handle add new session (duplicates the last row)
  const handleAddSession = () => {
    // Check if there are any sessions to duplicate
    if (sessions.length === 0) {
      // If no sessions exist, create a default one
      const defaultLocation = Object.keys(locationFacilityMap)[0] || 'Location A'
      const defaultFacility = locationFacilityMap[defaultLocation]?.[0] || 'Facility #1'
      
      const today = new Date()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const year = today.getFullYear()
      const todayFormatted = `${month}/${day}/${year}`
      
      const newSession = {
        id: 1,
        startDate: todayFormatted,
        endDate: todayFormatted,
        startTime: '9:00 AM',
        endTime: '10:00 AM',
        location: defaultLocation,
        facility: defaultFacility,
        extraFees: 'Extra Fee 1',
        fee: calculateFee(defaultLocation, defaultFacility),
        price: calculatePrice(defaultLocation, defaultFacility),
        include: true
      }
      
      setSessions([newSession])
      setDuplicatedRowIds(new Set([1]))
      return
    }
    
    // Get the last session in the original sessions array (not filtered/sorted)
    const lastSession = sessions[sessions.length - 1]
    
    // Get the maximum ID from existing sessions and add 1
    const maxId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) : 0
    const newId = maxId + 1
    
    // Duplicate the last session with a new ID
    const duplicatedSession = {
      ...lastSession,
      id: newId
    }
    
    // Get filtered and sorted sessions (same logic as display)
    const filteredAndSortedSessions = getFilteredAndSortedSessions()
    
    // Calculate the start index for the current page
    const pageStartIndex = (currentPage - 1) * entriesPerPage
    
    // Determine where to insert the duplicated session
    let actualInsertIndex = sessions.length // Default: insert at the end
    
    if (filteredAndSortedSessions.length > 0) {
      // Get the first session visible on the current page
      const firstVisibleIndex = pageStartIndex
      
      if (firstVisibleIndex < filteredAndSortedSessions.length) {
        // Find the first visible session on current page
        const firstVisibleSession = filteredAndSortedSessions[firstVisibleIndex]
        
        // Find this session's position in the original sessions array
        const foundIndex = sessions.findIndex(s => s.id === firstVisibleSession.id)
        
        if (foundIndex >= 0) {
          // Insert at the start of the current page (before the first visible session)
          actualInsertIndex = foundIndex
        } else {
          // If not found (shouldn't happen), insert at the beginning
          actualInsertIndex = 0
        }
      } else {
        // If current page is beyond available sessions, insert at the end
        // But find the last session's position in original array
        const lastFilteredSession = filteredAndSortedSessions[filteredAndSortedSessions.length - 1]
        const foundIndex = sessions.findIndex(s => s.id === lastFilteredSession.id)
        if (foundIndex >= 0) {
          actualInsertIndex = foundIndex + 1
        }
      }
    } else {
      // No filtered sessions, insert at the beginning
      actualInsertIndex = 0
    }
    
    // Insert the duplicated session at the calculated position
    const updatedSessions = [
      ...sessions.slice(0, actualInsertIndex),
      duplicatedSession,
      ...sessions.slice(actualInsertIndex)
    ]
    setSessions(updatedSessions)
    
    // Mark this row as duplicated (with dark gray color)
    setDuplicatedRowIds(new Set([...duplicatedRowIds, newId]))
    
    // Scroll to the duplicated row after a short delay to allow rendering
    setTimeout(() => {
      const duplicatedRow = document.querySelector(`tr[data-session-id="${newId}"]`)
      if (duplicatedRow) {
        duplicatedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }

  // Inline editing handlers
  // Convert date from MM/DD/YYYY to YYYY-MM-DD for date input
  const convertToDateInputFormat = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const [month, day, year] = parts
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateString
  }

  // Convert date from YYYY-MM-DD to MM/DD/YYYY for display/storage
  const convertFromDateInputFormat = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${month}/${day}/${year}`
    }
    return dateString
  }

  // Convert time from 12-hour format (e.g., "12:30 PM") to 24-hour format (e.g., "12:30")
  const convertToTimeInputFormat = (timeString) => {
    if (!timeString) return ''
    // Check if already in 24-hour format (HH:MM)
    if (/^\d{1,2}:\d{2}$/.test(timeString.trim())) {
      return timeString.trim()
    }
    // Parse 12-hour format (e.g., "12:30 PM" or "1:30 PM")
    const match = timeString.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (match) {
      let hours = parseInt(match[1], 10)
      const minutes = match[2]
      const period = match[3].toUpperCase()
      
      if (period === 'PM' && hours !== 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`
    }
    return timeString
  }

  // Convert time from 24-hour format (e.g., "12:30") to 12-hour format (e.g., "12:30 PM")
  const convertFromTimeInputFormat = (timeString) => {
    if (!timeString) return ''
    // Check if already in 12-hour format
    if (/^\d{1,2}:\d{2}\s*(AM|PM)/i.test(timeString.trim())) {
      return timeString.trim()
    }
    // Parse 24-hour format (HH:MM)
    const match = timeString.trim().match(/(\d{1,2}):(\d{2})/)
    if (match) {
      let hours = parseInt(match[1], 10)
      const minutes = match[2]
      let period = 'AM'
      
      if (hours === 0) {
        hours = 12
      } else if (hours === 12) {
        period = 'PM'
      } else if (hours > 12) {
        hours -= 12
        period = 'PM'
      }
      
      return `${hours}:${minutes} ${period}`
    }
    return timeString
  }

  const handleCellClick = (sessionId, field, currentValue) => {
    // Don't allow editing if already editing another cell
    if (editingCell && (editingCell.sessionId !== sessionId || editingCell.field !== field)) {
      return
    }
    setEditingCell({ sessionId, field })
    // Convert date format for date inputs
    if (field === 'startDate' || field === 'endDate') {
      setEditValue(convertToDateInputFormat(currentValue))
    } else if (field === 'startTime' || field === 'endTime') {
      // Convert time format for time inputs
      setEditValue(convertToTimeInputFormat(currentValue))
    } else {
      setEditValue(currentValue)
    }
  }

  const handleCellChange = (e) => {
    setEditValue(e.target.value)
  }

  const handleCellSave = (sessionId, field) => {
    if (editValue.trim() === '') {
      // Don't save empty values, cancel edit instead
      handleCellCancel()
      return
    }

    // Special handling for dates - convert from YYYY-MM-DD to MM/DD/YYYY
    let valueToSave = editValue.trim()
    if (field === 'startDate' || field === 'endDate') {
      valueToSave = convertFromDateInputFormat(editValue.trim())
    } else if (field === 'startTime' || field === 'endTime') {
      // Special handling for times - convert from 24-hour format to 12-hour format
      valueToSave = convertFromTimeInputFormat(editValue.trim())
    }

    // Special handling for startDate - auto-update endDate to match startDate
    if (field === 'startDate') {
      const updatedSessions = sessions.map(session => {
        if (session.id === sessionId) {
          // Always update endDate to match the selected startDate
          return { ...session, startDate: valueToSave, endDate: valueToSave }
        }
        return session
      })
      setSessions(updatedSessions)
      setEditingCell(null)
      setEditValue('')
      return
    }

    // Special handling for location - auto-update fee and price
    if (field === 'location') {
      handleLocationSave(sessionId, valueToSave)
      setEditingCell(null)
      setEditValue('')
      return
    }

    // Special handling for facility - auto-update fee and price
    if (field === 'facility') {
      handleFacilityChange(sessionId, valueToSave)
      setEditingCell(null)
      setEditValue('')
      return
    }

    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, [field]: valueToSave }
        : session
    ))
    setEditingCell(null)
    setEditValue('')
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleCellKeyDown = (e, sessionId, field) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCellSave(sessionId, field)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCellCancel()
    }
  }

  // Check if a cell is currently being edited
  const isEditing = (sessionId, field) => {
    return editingCell && editingCell.sessionId === sessionId && editingCell.field === field
  }

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle entries per page change
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Filter and sort sessions
  const getFilteredAndSortedSessions = () => {
    let filtered = sessions

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(session =>
        session.startDate.toLowerCase().includes(searchLower) ||
        session.endDate.toLowerCase().includes(searchLower) ||
        session.startTime.toLowerCase().includes(searchLower) ||
        session.endTime.toLowerCase().includes(searchLower) ||
        session.location.toLowerCase().includes(searchLower) ||
        session.facility.toLowerCase().includes(searchLower) ||
        session.extraFees.toLowerCase().includes(searchLower) ||
        session.fee.toLowerCase().includes(searchLower) ||
        session.price.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle date sorting
        if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          aValue = new Date(aValue.split('/').reverse().join('-'))
          bValue = new Date(bValue.split('/').reverse().join('-'))
        }
        // Handle price sorting (remove $ and parse)
        if (sortConfig.key === 'price') {
          aValue = parseFloat(aValue.replace('$', ''))
          bValue = parseFloat(bValue.replace('$', ''))
        }
        // Handle boolean sorting
        if (typeof aValue === 'boolean') {
          aValue = aValue ? 1 : 0
          bValue = bValue ? 1 : 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  // Get paginated sessions
  const filteredAndSortedSessions = getFilteredAndSortedSessions()
  const totalPages = Math.ceil(filteredAndSortedSessions.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedSessions = filteredAndSortedSessions.slice(startIndex, endIndex)

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    const newSelected = new Set(selectedRows)
    if (checked) {
      paginatedSessions.forEach(session => newSelected.add(session.id))
    } else {
      paginatedSessions.forEach(session => newSelected.delete(session.id))
    }
    setSelectedRows(newSelected)
  }

  const handleRowSelect = (sessionId) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedRows(newSelected)
    // Update selectAll based on current page selection
    const allPageSelected = paginatedSessions.every(session => newSelected.has(session.id))
    setSelectAll(allPageSelected && paginatedSessions.length > 0)
  }

  const exportToCSV = () => {
    if (selectedRows.size === 0) {
      alert('Please select at least one row to export.')
      return
    }

    const selectedSessions = sessions.filter(session => selectedRows.has(session.id))
    
    // CSV headers
    const headers = ['Start Date', 'End Date', 'Start Time', 'End Time', 'Location', 'Facility', 'Extra Fees', 'Fee', 'Price', 'Include']
    
    // Convert data to CSV format
    const csvRows = [
      headers.join(','),
      ...selectedSessions.map(session => [
        session.startDate,
        session.endDate,
        session.startTime,
        session.endTime,
        session.location,
        session.facility,
        session.extraFees,
        session.fee,
        session.price,
        session.include ? 'Yes' : 'No'
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sessions_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    try {
      if (selectedRows.size === 0) {
        alert('Please select at least one row to export.')
        return
      }

      const selectedSessions = sessions.filter(session => selectedRows.has(session.id))
      
      if (selectedSessions.length === 0) {
        alert('No sessions selected.')
        return
      }
      
      console.log('Exporting PDF for', selectedSessions.length, 'sessions')
      
      // Create new PDF document
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(16)
      doc.text('Sessions Export', 14, 20)
      
      // Add export date
      doc.setFontSize(10)
      doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 28)
      
      // Prepare table data
      const tableData = selectedSessions.map(session => [
        String(session.startDate || ''),
        String(session.endDate || ''),
        String(session.startTime || ''),
        String(session.endTime || ''),
        String(session.location || ''),
        String(session.facility || ''),
        String(session.extraFees || ''),
        String(session.fee || ''),
        String(session.price || ''),
        session.include ? 'Yes' : 'No'
      ])
      
      // Define table columns
      const columns = [
        'Start Date',
        'End Date',
        'Start Time',
        'End Time',
        'Location',
        'Facility',
        'Extra Fees',
        'Fee',
        'Price',
        'Include'
      ]
      
      // Add table to PDF using autoTable function
      autoTable(doc, {
        head: [columns],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35 }
      })
      
      // Save the PDF
      doc.save(`sessions_export_${new Date().toISOString().split('T')[0]}.pdf`)
      console.log('PDF exported successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF: ' + error.message)
    }
  }

  return (
    <div className="contract-details-page">
      {/* Contract Sent Notification */}
      {showNotification && (
        <div className="contract-notification">
          <FaCheck className="notification-icon" />
          <span className="notification-text">Contract Sent</span>
          <button className="notification-close" onClick={() => setShowNotification(false)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Contract Firmed Notification */}
      {showFirmNotification && (
        <div className="contract-notification">
          <FaCheck className="notification-icon" />
          <span className="notification-text">Contract Firmed</span>
          <button className="notification-close" onClick={() => setShowFirmNotification(false)}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="contract-header">
        <button className="back-button">
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="contract-title-section">
          <h1 className="contract-title">Contract ABC</h1>
          <div className="contract-id">
            <span>#1234567890</span>
            <FaCopy className="copy-icon" />
          </div>
        </div>
      </div>

      <div className="contract-content">
        <div className="contract-details-card">
          <h2 className="section-title">Contract Details</h2>
          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-header">
                <div className="detail-avatar">AS</div>
                <div>
                  <h3 className="detail-name">Ava Spencer</h3>
                  <div className="detail-contact">
                    <FaEnvelope className="contact-icon" />
                    <span>ava.spencer@email.com</span>
                  </div>
                  <div className="detail-contact">
                    <FaPhone className="contact-icon" />
                    <span>(000) 000-1234</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <MapThumbnail address="123 W Main St, Vancouver, BC V5G 2B5" />
                <div>
                  <h3 className="detail-name">Maywood Rec Centre</h3>
                  <div className="detail-contact">
                    <FaMapMarkerAlt className="contact-icon" />
                    <span>123 W Main St, Vancouver, BC V5G 2B5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <div className="detail-thumbnail meeting-thumbnail">
                  <img 
                    src={meetingRoomImage} 
                    alt="Meeting Room"
                    className="meeting-thumbnail-image"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to online image matching the description: people around wooden table in meeting
                      e.target.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop&crop=center&q=90&auto=format"
                    }}
                  />
                </div>
                <div>
                  <h3 className="detail-name">Meeting Room #1</h3>
                  <div className="detail-contact">
                    <FaCalendarAlt className="contact-icon" />
                    <span>Monday, June 1, 2025</span>
                  </div>
                  <div className="detail-contact">
                    <FaClock className="contact-icon" />
                    <span>12:30 PM - 1:30 PM</span>
                  </div>
                  <div className="detail-contact">
                    <FaUsers className="contact-icon" />
                    <span>4 guests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <div className="detail-thumbnail extras-thumbnail">
                  <img 
                    src={extrasImage} 
                    alt="Extras"
                    className="extras-thumbnail-image"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <h3 className="detail-name">Extras</h3>
                  <div className="detail-contact">
                    <FaPlus className="contact-icon" />
                    <span>Extra Chair (x2)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs-container">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="tab-icon" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {activeTab === 'sessions' && (
            <div className="sessions-content">
              <div className="sessions-header">
                <div className="sessions-left">
                  <button 
                    className="bulk-update-btn"
                    disabled={selectedRows.size === 0}
                  >
                    Bulk Update
                  </button>
                  <div className="success-message">
                    <FaCheck className="check-icon" />
                    <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''} created</span>
                  </div>
                </div>
                <div className="sessions-right">
                  <button className="export-btn" onClick={exportToCSV}>
                    <FaFileExport className="export-icon" />
                    <span>Export CSV</span>
                  </button>
                  <button className="export-btn" onClick={exportToPDF}>
                    <FaFileExport className="export-icon" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Search and Entries Per Page */}
              <div className="table-controls">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="entries-per-page-container">
                  <label htmlFor="entries-per-page">Show</label>
                  <select
                    id="entries-per-page"
                    className="entries-per-page-select"
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries</span>
                </div>
              </div>

              <div className="sessions-table-container">
                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          checked={paginatedSessions.length > 0 && paginatedSessions.every(session => selectedRows.has(session.id))}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('startDate')}
                      >
                        Start Date
                        {sortConfig.key === 'startDate' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'startDate' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('endDate')}
                      >
                        End Date
                        {sortConfig.key === 'endDate' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'endDate' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('startTime')}
                      >
                        Start Time
                        {sortConfig.key === 'startTime' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'startTime' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('endTime')}
                      >
                        End Time
                        {sortConfig.key === 'endTime' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'endTime' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('location')}
                      >
                        Location
                        {sortConfig.key === 'location' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'location' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th>Facility</th>
                      <th>Extra Fees</th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('fee')}
                      >
                        Fee
                        {sortConfig.key === 'fee' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'fee' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('price')}
                      >
                        Price
                        {sortConfig.key === 'price' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'price' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('include')}
                      >
                        Include
                        {sortConfig.key === 'include' && (
                          sortConfig.direction === 'asc' ? <FaChevronUp className="sort-icon-active" /> : <FaChevronDown className="sort-icon-active" />
                        )}
                        {sortConfig.key !== 'include' && <FaChevronUp className="sort-icon-inactive" />}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSessions.map((session) => (
                      <tr 
                        key={session.id} 
                        data-session-id={session.id}
                        className={`${newRowIds.has(session.id) ? 'new-row' : ''} ${duplicatedRowIds.has(session.id) ? 'duplicated-row' : ''}`}
                      >
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedRows.has(session.id)}
                            onChange={() => handleRowSelect(session.id)}
                          />
                        </td>
                        <td 
                          className="editable-cell"
                          onClick={() => handleCellClick(session.id, 'startDate', session.startDate)}
                          style={{ position: 'relative' }}
                        >
                          {isEditing(session.id, 'startDate') ? (
                            <input
                              type="date"
                              className="inline-edit-input date-input"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={() => handleCellSave(session.id, 'startDate')}
                              onKeyDown={(e) => handleCellKeyDown(e, session.id, 'startDate')}
                              autoFocus
                            />
                          ) : (
                            <span>{session.startDate}</span>
                          )}
                        </td>
                        <td 
                          className="editable-cell"
                          onClick={() => handleCellClick(session.id, 'endDate', session.endDate)}
                          style={{ position: 'relative' }}
                        >
                          {isEditing(session.id, 'endDate') ? (
                            <input
                              type="date"
                              className="inline-edit-input date-input"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={() => handleCellSave(session.id, 'endDate')}
                              onKeyDown={(e) => handleCellKeyDown(e, session.id, 'endDate')}
                              autoFocus
                            />
                          ) : (
                            <span>{session.endDate}</span>
                          )}
                        </td>
                        <td 
                          className="editable-cell"
                          onClick={() => handleCellClick(session.id, 'startTime', session.startTime)}
                          style={{ position: 'relative' }}
                        >
                          {isEditing(session.id, 'startTime') ? (
                            <input
                              type="time"
                              className="inline-edit-input time-input"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={() => handleCellSave(session.id, 'startTime')}
                              onKeyDown={(e) => handleCellKeyDown(e, session.id, 'startTime')}
                              autoFocus
                            />
                          ) : (
                            <span>{session.startTime}</span>
                          )}
                        </td>
                        <td 
                          className="editable-cell"
                          onClick={() => handleCellClick(session.id, 'endTime', session.endTime)}
                          style={{ position: 'relative' }}
                        >
                          {isEditing(session.id, 'endTime') ? (
                            <input
                              type="time"
                              className="inline-edit-input time-input"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={() => handleCellSave(session.id, 'endTime')}
                              onKeyDown={(e) => handleCellKeyDown(e, session.id, 'endTime')}
                              autoFocus
                            />
                          ) : (
                            <span>{session.endTime}</span>
                          )}
                        </td>
                        <td 
                          className="editable-cell"
                          onClick={() => handleCellClick(session.id, 'location', session.location)}
                          style={{ position: 'relative' }}
                        >
                          {isEditing(session.id, 'location') ? (
                            <input
                              type="text"
                              className="inline-edit-input"
                              value={editValue}
                              onChange={handleCellChange}
                              onBlur={() => handleCellSave(session.id, 'location')}
                              onKeyDown={(e) => handleCellKeyDown(e, session.id, 'location')}
                              autoFocus
                            />
                          ) : (
                            <span>{session.location}</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="facility-dropdown"
                            value={session.facility}
                            onChange={(e) => {
                              handleFacilityChange(session.id, e.target.value)
                            }}
                          >
                            {getAvailableFacilities(session.location).map((facility) => (
                              <option key={facility} value={facility}>
                                {facility}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span className="badge">
                            {session.extraFees}
                            <span className="badge-count">2</span>
                          </span>
                        </td>
                        <td className="non-editable-cell">
                          <span>{session.fee}</span>
                        </td>
                        <td className="non-editable-cell">
                          <span>{session.price}</span>
                        </td>
                        <td>
                          {session.include ? (
                            <FaToggleOn 
                              className="toggle-on" 
                              onClick={() => handleIncludeToggle(session.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <FaToggleOff 
                              className="toggle-off" 
                              onClick={() => handleIncludeToggle(session.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedSessions.length)} of {filteredAndSortedSessions.length} entries
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft />
                    <span>Previous</span>
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1)
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1]
                        const showEllipsis = prevPage && page - prevPage > 1
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        )
                      })}
                  </div>
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <span>Next</span>
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <button className="add-session-btn" onClick={handleAddSession}>
                <FaPlus />
                <span>Add Session</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="contract-footer">
        <button className="cancel-btn" onClick={() => setIsCancelModalOpen(true)}>Cancel Contract</button>
        <div className="footer-actions">
          <button className="action-btn send-btn" onClick={() => setIsSendModalOpen(true)}>
            <FaEnvelope />
            <span>Send</span>
          </button>
          <button className="action-btn save-btn">
            <FaFileAlt />
            <span>Save & Close</span>
          </button>
          <button className="action-btn firm-btn" onClick={() => setIsFirmModalOpen(true)}>
            <FaFileAlt />
            <span>Firm Contract</span>
          </button>
        </div>
      </div>

      {/* Send Contract Modal */}
      <SendContractModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={(formData) => {
          console.log('Sending contract:', formData)
          setIsSendModalOpen(false)
          setShowNotification(true)
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNotification(false)
          }, 5000)
        }}
      />

      {/* Confirm Firm Contract Modal */}
      <FirmContractModal
        isOpen={isFirmModalOpen}
        onClose={() => setIsFirmModalOpen(false)}
        onConfirm={() => {
          console.log('Contract firmed')
          setIsFirmModalOpen(false)
          setShowFirmNotification(true)
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowFirmNotification(false)
          }, 5000)
        }}
      />

      {/* Cancel Contract Modal */}
      <CancelContractModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => {
          console.log('Contract cancelled')
          setIsCancelModalOpen(false)
          // Handle cancel contract action here
          // You can add navigation or other actions
        }}
      />
    </div>
  )
}

export default ContractDetails


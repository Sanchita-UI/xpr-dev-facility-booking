import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FaArrowLeft, FaCopy, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaPlus, FaCheck, FaCheckCircle, FaFileExport, FaFileAlt, FaPaperclip, FaToggleOn, FaToggleOff, FaList, FaTimes, FaSearch, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight, FaUndo, FaEdit, FaTrash, FaEllipsisV, FaEye } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { sessionsData } from '../data/mockData'
import SendContractModal from '../components/SendContractModal'
import FirmContractModal from '../components/FirmContractModal'
import CancelContractModal from '../components/CancelContractModal'
import EditSessionModal from '../components/EditSessionModal'
import ViewSessionModal from '../components/ViewSessionModal'
import MapThumbnail from '../components/MapThumbnail'
import DeleteToast from '../components/DeleteToast'
import SuccessToast from '../components/SuccessToast'
import Tooltip from '../components/Tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import meetingRoomImage from '../assets/images/meeting-room.jpg'
import extrasImage from '../assets/images/extras.jpg'
import './ContractDetails.css'

// Column Filter Dropdown Component
const ColumnFilterDropdown = ({ column, table, accessorKey, sessions, openFilterId, setOpenFilterId }) => {
  const filterId = `filter-${accessorKey}`
  const isOpen = openFilterId === filterId
  const filterValue = column.getFilterValue() || []
  const containerRef = useRef(null)
  const menuRef = useRef(null)
  
  // Get unique values from the sessions data
  const uniqueValues = useMemo(() => {
    const values = sessions.map(session => {
      const value = session[accessorKey]
      return value ? String(value) : ''
    })
    return [...new Set(values)].filter(v => v !== '').sort()
  }, [sessions, accessorKey])
  
  const handleToggle = (value) => {
    const currentFilters = Array.isArray(filterValue) ? filterValue : []
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(v => v !== value)
      : [...currentFilters, value]
    column.setFilterValue(newFilters.length > 0 ? newFilters : undefined)
  }
  
  const handleSelectAll = () => {
    column.setFilterValue(undefined)
  }
  
  const handleClearAll = () => {
    column.setFilterValue(undefined)
  }
  
  // Position dropdown relative to column header and update on scroll/resize
  useEffect(() => {
    if (isOpen && containerRef.current && menuRef.current) {
      const container = containerRef.current
      const menu = menuRef.current
      const columnHeader = container.closest('.column-header-with-filter')
      
      const updatePosition = () => {
        if (columnHeader && menu) {
          const headerRect = columnHeader.getBoundingClientRect()
          
          // Check if header is still visible in viewport
          const isHeaderVisible = headerRect.top >= 0 && 
                                 headerRect.left >= 0 && 
                                 headerRect.bottom <= window.innerHeight &&
                                 headerRect.right <= window.innerWidth
          
          // If header is not visible, close the dropdown
          if (!isHeaderVisible) {
            setOpenFilterId(null)
            return
          }
          
          // Position dropdown relative to viewport using fixed positioning
          menu.style.position = 'fixed'
          menu.style.left = `${headerRect.left}px`
          menu.style.top = `${headerRect.bottom + 2}px`
          menu.style.width = `${Math.max(headerRect.width, 220)}px`
          menu.style.minWidth = '220px'
          menu.style.maxWidth = '280px'
        }
      }
      
      // Initial positioning
      updatePosition()
      
      // Throttle scroll events for better performance using requestAnimationFrame
      let scrollTimeout
      const handleScroll = () => {
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout)
        }
        scrollTimeout = requestAnimationFrame(() => {
          updatePosition()
        })
      }
      
      // Update position on resize
      const handleResize = () => {
        updatePosition()
      }
      
      // Add event listeners to window and scrollable containers
      window.addEventListener('scroll', handleScroll, true) // Use capture phase to catch all scrolls
      window.addEventListener('resize', handleResize)
      
      // Also listen to table container scroll if it exists
      const tableContainer = container.closest('.sessions-table-container') || 
                             container.closest('.table-container') ||
                             document.querySelector('.sessions-table')?.parentElement ||
                             document.querySelector('table')?.parentElement
      
      if (tableContainer) {
        tableContainer.addEventListener('scroll', handleScroll, true)
      }
      
      // Listen to all scrollable parents
      let parent = container.parentElement
      const scrollableParents = []
      while (parent && parent !== document.body) {
        if (parent.scrollHeight > parent.clientHeight) {
          parent.addEventListener('scroll', handleScroll, true)
          scrollableParents.push(parent)
        }
        parent = parent.parentElement
      }
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
        if (tableContainer) {
          tableContainer.removeEventListener('scroll', handleScroll, true)
        }
        scrollableParents.forEach(parent => {
          parent.removeEventListener('scroll', handleScroll, true)
        })
        if (scrollTimeout) {
          cancelAnimationFrame(scrollTimeout)
        }
      }
    }
  }, [isOpen, setOpenFilterId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          !event.target.closest('.filter-dropdown-container') && 
          !event.target.closest('.filter-dropdown-menu')) {
        setOpenFilterId(null)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setOpenFilterId])
  
  return (
    <>
      <div className="filter-dropdown-container" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <Tooltip content={filterValue && filterValue.length > 0 ? `${filterValue.length} filter(s) active` : "Filter column values"} side="bottom">
          <button 
            className="filter-dropdown-trigger"
            onClick={(e) => {
              e.stopPropagation()
              setOpenFilterId(isOpen ? null : filterId)
            }}
            type="button"
          >
            <FaEllipsisV className="filter-icon" />
            {filterValue && filterValue.length > 0 && (
              <span className="filter-badge">{filterValue.length}</span>
            )}
          </button>
        </Tooltip>
      </div>
      {isOpen && (
        <div 
          className="filter-dropdown-menu" 
          ref={menuRef}
          id={filterId}
          role="menu"
          aria-labelledby={`filter-trigger-${accessorKey}`}
        >
          <div className="filter-dropdown-header" role="heading" aria-level="3">FILTER</div>
          <div className="filter-dropdown-options" role="group" aria-label={`Filter options for ${accessorKey}`}>
            {uniqueValues.length > 0 ? (
              uniqueValues.map(value => (
                <label key={value} className="filter-option" role="menuitemcheckbox" aria-checked={filterValue?.includes(value) || false}>
                  <input
                    type="checkbox"
                    checked={filterValue?.includes(value) || false}
                    onChange={() => handleToggle(value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Filter by ${value}`}
                  />
                  <span>{value}</span>
                </label>
              ))
            ) : (
              <div className="filter-no-options" role="status" aria-live="polite">No options available</div>
            )}
          </div>
          {filterValue && filterValue.length > 0 && (
            <Tooltip content="Remove all active filters" side="top">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearAll()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClearAll()
                  }
                }}
                className="filter-clear-btn"
                aria-label="Clear all filters"
              >
                Clear filter
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </>
  )
}

// Sortable Row Component
const SortableRow = ({ row, session, table, newRowIds, duplicatedRowIds, activeRowId, restoredRowId, columnOrder, defaultColumnOrder, selectedRows, handleRowSelect, editingCell, editValue, handleCellClick, handleCellChange, handleCellSave, handleCellKeyDown, isEditing, handleFacilityChange, getAvailableFacilities, handleIncludeToggle, handleEditRow, handleDeleteRow }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: session.id,
    disabled: editingCell !== null, // Disable drag when editing
    data: {
      type: 'row',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Disable transition while dragging for smoother experience
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const isRestored = restoredRowId === session.id

  // Custom listeners that prevent dragging on interactive elements
  const handlePointerDown = (e) => {
    const target = e.target
    const closestEditable = target.closest('.editable-cell')
    
    // First check: If clicking on or inside an editable cell, prevent drag
    if (closestEditable) {
      e.stopPropagation()
      return
    }
    
    // Check if clicking on interactive elements - prevent drag on these
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('button') ||
      target.closest('.expand-button') ||
      target.closest('.facility-dropdown') ||
      target.closest('.toggle-on') ||
      target.closest('.toggle-off') ||
      target.closest('.badge') ||
      target.closest('.row-actions') ||
      target.closest('.action-btn') ||
      target.closest('.filter-dropdown-container')
    ) {
      e.stopPropagation()
      return
    }
    
    // Allow drag on other areas - call original listener
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e)
    }
  }

  const customListeners = {
    ...listeners,
    onPointerDown: handlePointerDown,
  }

  const isExpanded = row.getIsExpanded()

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [month, day, year] = dateString.split('/')
    const date = new Date(year, month - 1, day)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return `${days[date.getDay()]} ${dateString}`
  }

  // Track if we're dragging to prevent click from firing
  const wasDraggingRef = useRef(false)
  
  // Handle row click to toggle expansion
  const handleRowClick = (e) => {
    // Don't toggle if we just dragged (dnd-kit handles this via isDragging state)
    if (isDragging || wasDraggingRef.current) {
      wasDraggingRef.current = false
      return
    }
    
    // Don't toggle if clicking on interactive elements
    const target = e.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('button') ||
      target.closest('.expand-button') ||
      target.closest('.editable-cell') ||
      target.closest('.facility-dropdown') ||
      target.closest('.toggle-on') ||
      target.closest('.toggle-off') ||
      target.closest('.badge') ||
      target.closest('.row-actions') ||
      target.closest('.action-btn') ||
      target.closest('.filter-dropdown-container')
    ) {
      return
    }
    
    // Toggle row expansion
    row.toggleExpanded()
  }
  
  // Track when dragging starts/ends to prevent click after drag
  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true
    } else if (wasDraggingRef.current) {
      // Reset after drag ends with a small delay
      const timeout = setTimeout(() => {
        wasDraggingRef.current = false
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [isDragging])

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        data-session-id={session.id}
        className={`${newRowIds.has(session.id) ? 'new-row' : ''} ${duplicatedRowIds.has(session.id) ? 'duplicated-row' : ''} ${isDragging ? 'dragging' : ''} ${isRestored ? 'restored-row' : ''} draggable-row`}
        onClick={handleRowClick}
        {...attributes}
        {...customListeners}
      >
        {(columnOrder.length > 0 ? columnOrder : defaultColumnOrder)
          .map(columnId => {
            const cell = row.getVisibleCells().find(c => c.column.id === columnId)
            return cell ? (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ) : null
          })
          .filter(Boolean)}
      </tr>
      {isExpanded && (
        <tr className="expanded-row-details">
          <td colSpan={(columnOrder.length > 0 ? columnOrder : defaultColumnOrder).length} className="expanded-cell">
            <div className="session-details-container">
              <div className="session-details-header">
                <h3>Session Details - ID: {session.id}</h3>
              </div>
              <div className="session-details-grid">
                <div className="detail-item">
                  <span className="detail-label">DATE:</span>
                  <span className="detail-value">{formatDate(session.startDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">START DATE:</span>
                  <span className="detail-value">{session.startDate || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">END DATE:</span>
                  <span className="detail-value">{session.endDate || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">TIME RANGE:</span>
                  <span className="detail-value">{session.startTime || 'N/A'} - {session.endTime || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">START TIME:</span>
                  <span className="detail-value">{session.startTime || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">END TIME:</span>
                  <span className="detail-value">{session.endTime || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PRICE:</span>
                  <span className="detail-value">{session.price || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">LOCATION:</span>
                  <span className="detail-value">{session.location || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">FACILITY:</span>
                  <span className="detail-value">{session.facility || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">EXTRA FEES:</span>
                  <span className="detail-value">{session.extraFees || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">FEE:</span>
                  <span className="detail-value">{session.fee || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">INCLUDE:</span>
                  <span className="detail-value">{session.include ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// Sortable Column Header Component
const SortableColumnHeader = ({ header, columnId, activeColumnId, table }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: columnId,
    data: {
      type: 'column',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Custom listeners that prevent dragging on interactive elements
  const customListeners = {
    ...listeners,
    onPointerDown: (e) => {
      const target = e.target
      // Check if clicking on interactive elements
      if (
        target.tagName === 'INPUT' ||
        target.closest('input') ||
        target.classList.contains('sort-icon-active') ||
        target.classList.contains('sort-icon-inactive') ||
        target.closest('.sort-icon-active') ||
        target.closest('.sort-icon-inactive')
      ) {
        e.stopPropagation()
        return
      }
      // Call original listener if not on interactive element
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e)
      }
    },
  }

  return (
    <th
      ref={setNodeRef}
      style={{ ...style, width: header.getSize() }}
      className={`${isDragging ? 'column-dragging' : ''} draggable-column-header`}
      {...attributes}
      {...customListeners}
    >
      {header.isPlaceholder
        ? null
        : flexRender(
            header.column.columnDef.header,
            header.getContext()
          )}
    </th>
  )
}

const ContractDetails = () => {
  const [activeTab, setActiveTab] = useState('sessions')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingSession, setViewingSession] = useState(null)
  
  // Pagination, Search, and Sorting states
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  
  // Row expansion state
  const [expanded, setExpanded] = useState({})
  
  // Track which filter dropdown is open (only one at a time)
  const [openFilterId, setOpenFilterId] = useState(null)

  // Inline editing states
  const [editingCell, setEditingCell] = useState(null) // { sessionId, field }
  const [editValue, setEditValue] = useState('') // Temporary value while editing
  const [locationErrors, setLocationErrors] = useState({}) // Track validation errors for location inputs
  const [newRowIds, setNewRowIds] = useState(new Set()) // Track newly added row IDs
  const [duplicatedRowIds, setDuplicatedRowIds] = useState(new Set()) // Track duplicated row IDs
  
  // Drag and drop states - using @dnd-kit
  const [activeRowId, setActiveRowId] = useState(null)
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [columnOrder, setColumnOrder] = useState([])
  
  // Sensors for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced from 8px for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Refs for undo delete functionality
  const deletedRowRef = useRef(null)
  const deletedRowIndexRef = useRef(null)
  const deleteTimeoutRef = useRef(null)
  
  // Track if we're switching cells to prevent blur interference
  const isSwitchingCellRef = useRef(false)
  
  // State to track restored row for highlighting
  const [restoredRowId, setRestoredRowId] = useState(null)

  const tabs = [
    { id: 'sessions', label: 'Sessions', icon: FaList },
    { id: 'attachments', label: 'Attachments', icon: FaPaperclip },
  ]

  // Fetch sessions data from mock data and ensure all include flags are true by default
  const initialSessions = useMemo(() => 
    sessionsData.map(session => ({ ...session, include: session.include !== undefined ? session.include : true })),
    []
  )
  const [sessions, setSessions] = useState(initialSessions)
  
  // Initialize column order if not set
  const defaultColumnOrder = useMemo(() => [
    'expand',
    'select',
    'startDate',
    'endDate',
    'startTime',
    'endTime',
    'location',
    'facility',
    'extraFees',
    'fee',
    'price',
    'include',
    'actions'
  ], [])
  
  // Track if row order has changed from original
  const hasOrderChanged = useMemo(() => {
    if (sessions.length !== initialSessions.length) return false
    return sessions.some((session, index) => session.id !== initialSessions[index].id)
  }, [sessions, initialSessions])
  
  // Track if column order has changed from original
  const hasColumnOrderChanged = useMemo(() => {
    if (columnOrder.length === 0 || defaultColumnOrder.length === 0) return false
    if (columnOrder.length !== defaultColumnOrder.length) return true
    return columnOrder.some((colId, index) => colId !== defaultColumnOrder[index])
  }, [columnOrder, defaultColumnOrder])
  
  // Reset to original order (both rows and columns)
  const handleResetOrder = () => {
    setSessions([...initialSessions])
    setColumnOrder([...defaultColumnOrder])
  }

  // Location-Facility mapping
  const locationFacilityMap = {
    'Location A': ['Facility #1', 'Facility #2', 'Facility #3'],
    'Location B': ['Facility #4', 'Facility #5', 'Facility #6', 'Facility #7'],
    'Location C': ['Facility #8', 'Facility #9'],
    'Location D': ['Facility #10', 'Facility #11', 'Facility #12'],
    'Location E': ['Facility #13', 'Facility #14']
  }

  // Get all valid locations
  const allLocations = Object.keys(locationFacilityMap)

  // Validate location
  const validateLocation = (location) => {
    if (!location || !location.trim()) {
      return 'Location is required'
    }
    if (!allLocations.includes(location.trim())) {
      return `Invalid location. Must be one of: ${allLocations.join(', ')}`
    }
    return null
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
    // Validate location
    const error = validateLocation(newLocation)
    if (error) {
      setLocationErrors(prev => ({ ...prev, [sessionId]: error }))
      return false
    }

    // Clear error if validation passes
    setLocationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[sessionId]
      return newErrors
    })

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
      return true
    }
    return false
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

  // Handle add new session (duplicates the last row and adds at the beginning)
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
    
    // Get the last session in the original sessions array (not filtered/sorted) to duplicate
    const lastSession = sessions[sessions.length - 1]
    
    // Get the maximum ID from existing sessions and add 1
    const maxId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) : 0
    const newId = maxId + 1
    
    // Duplicate the last session with a new ID
    const duplicatedSession = {
      ...lastSession,
      id: newId
    }
    
    // Insert the duplicated session at the beginning
    const updatedSessions = [duplicatedSession, ...sessions]
    setSessions(updatedSessions)
    
    // Reset to first page to show the new session (since it's at the beginning)
    setPagination({ ...pagination, pageIndex: 0 })
    
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

  const handleCellClick = (sessionId, field, currentValue, event) => {
    // Prevent blur from firing when clicking on another cell
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Allow editing if clicking the same cell that's already being edited
    if (editingCell && editingCell.sessionId === sessionId && editingCell.field === field) {
      return // Already editing this cell, don't do anything
    }
    
    // If clicking on a different cell while another is being edited, save the current cell first
    if (editingCell && (editingCell.sessionId !== sessionId || editingCell.field !== field)) {
      // Mark that we're switching cells to prevent blur from interfering
      isSwitchingCellRef.current = true
      
      // Save the current cell immediately before switching
      const currentSessionId = editingCell.sessionId
      const currentField = editingCell.field
      const currentEditValue = editValue
      
      // Save immediately without waiting for blur
      if (currentEditValue.trim() !== '') {
        let valueToSave = currentEditValue.trim()
        if (currentField === 'startDate' || currentField === 'endDate') {
          valueToSave = convertFromDateInputFormat(currentEditValue.trim())
        } else if (currentField === 'startTime' || currentField === 'endTime') {
          valueToSave = convertFromTimeInputFormat(currentEditValue.trim())
        }
        
        // Update the session data directly
        if (currentField === 'startDate') {
          setSessions(prevSessions => prevSessions.map(session => 
            session.id === currentSessionId 
              ? { ...session, startDate: valueToSave, endDate: valueToSave }
              : session
          ))
        } else if (currentField === 'location') {
          handleLocationSave(currentSessionId, valueToSave)
        } else if (currentField === 'facility') {
          handleFacilityChange(currentSessionId, valueToSave)
        } else {
          setSessions(prevSessions => prevSessions.map(session => 
            session.id === currentSessionId 
              ? { ...session, [currentField]: valueToSave }
              : session
          ))
        }
      }
      
      // Switch to the new cell immediately
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
      
      // Reset the flag after a brief moment
      setTimeout(() => {
        isSwitchingCellRef.current = false
      }, 100)
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
    // For date/time inputs, check if calendar picker is open
    if (field === 'startDate' || field === 'endDate' || field === 'startTime' || field === 'endTime') {
      // Check if the active element is still the input (calendar might be open)
      const activeElement = document.activeElement
      if (activeElement && activeElement.type === (field.includes('Date') ? 'date' : 'time')) {
        // Calendar/time picker is likely open, don't save yet
        return
      }
    }

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
      const success = handleLocationSave(sessionId, valueToSave)
      if (success) {
        setEditingCell(null)
        setEditValue('')
      } else {
        // Keep editing cell open if validation failed
        return
      }
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

  // Handle search
  const handleSearch = (e) => {
    setGlobalFilter(e.target.value)
    setPagination({ ...pagination, pageIndex: 0 }) // Reset to first page when searching
  }

  // Handle entries per page change
  const handleEntriesPerPageChange = (e) => {
    setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 })
  }

  const handleRowSelect = (sessionId) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedRows(newSelected)
  }

  // Handle view row
  const handleViewRow = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setViewingSession(session)
      setIsViewModalOpen(true)
    }
  }

  // Handle edit row
  const handleEditRow = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setEditingSession(session)
      setIsEditModalOpen(true)
    }
  }

  // Handle save edited session
  const handleSaveEditedSession = (updatedSession) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    )
    // Scroll to the updated row
    const rowElement = document.querySelector(`tr[data-session-id="${updatedSession.id}"]`)
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      // Add a temporary highlight class
      rowElement.classList.add('row-edit-highlight')
      setTimeout(() => {
        rowElement.classList.remove('row-edit-highlight')
      }, 2000)
    }
  }

  // Handle delete row
  const handleDeleteRow = (sessionId) => {
    const sessionToDelete = sessions.find(s => s.id === sessionId)
    if (!sessionToDelete) return

    // Store the deleted row and its index for undo
    const deletedIndex = sessions.findIndex(s => s.id === sessionId)
    deletedRowRef.current = { ...sessionToDelete }
    deletedRowIndexRef.current = deletedIndex

    // Show toast notification with restore button
    const toastId = `delete-${sessionId}`
    toast.custom(
      (t) => (
        <DeleteToast
          message="Row deleted"
          onUndo={() => {
            handleUndoDelete(sessionId, t.id)
          }}
          onClose={() => toast.dismiss(t.id)}
          t={t}
          duration={4000}
        />
      ),
      {
        id: toastId,
        duration: Infinity, // Let our animation control when to close
        position: 'top-right',
              }
    )

    // Delete the row after notification appears (small delay to ensure notification renders first)
    requestAnimationFrame(() => {
      deleteTimeoutRef.current = setTimeout(() => {
        // Only delete if undo hasn't been clicked (check if refs are still set)
        if (deletedRowRef.current && deletedRowIndexRef.current !== null) {
          setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId))
          
          // Also remove from selected rows if it was selected
          setSelectedRows(prevSelected => {
            const newSelected = new Set(prevSelected)
            newSelected.delete(sessionId)
            return newSelected
          })
        }
        deleteTimeoutRef.current = null
      }, 50)
    })
  }

  // Handle undo delete
  const handleUndoDelete = (sessionId, deleteToastId) => {
    // Cancel the deletion timeout if it hasn't executed yet
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current)
      deleteTimeoutRef.current = null
    }
    
    if (deletedRowRef.current && deletedRowIndexRef.current !== null) {
      const restoredRow = deletedRowRef.current
      const restoredIndex = deletedRowIndexRef.current
      const restoredId = restoredRow.id
      
      // Use functional update to get the latest sessions state
      setSessions(prevSessions => {
        // Check if the row already exists in current sessions
        const rowExists = prevSessions.find(s => s.id === restoredId)
        
        if (!rowExists) {
          // Create a new array and insert the deleted row back at its original position
          const newSessions = [...prevSessions]
          newSessions.splice(restoredIndex, 0, restoredRow)
          
          // Highlight the restored row
          setRestoredRowId(restoredId)
          
          // Show success toast notification - replaces delete toast by using same ID
          // Use a small delay to ensure smooth transition
          setTimeout(() => {
            toast.custom(
              (t) => (
                <SuccessToast
                  message="Row restored successfully"
                  onClose={() => toast.dismiss(t.id)}
                  t={t}
                  duration={4000}
                />
              ),
              {
                id: deleteToastId, // Use same ID to replace the delete toast in place
                duration: Infinity, // Let our animation control when to close
                position: 'top-right',
              }
            )
          }, 50)
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setRestoredRowId(null)
          }, 3000)
          
          return newSessions
        }
        
        // Row already exists, return unchanged
        return prevSessions
      })
      
      // Clear the refs
      deletedRowRef.current = null
      deletedRowIndexRef.current = null
    }
  }

  // Row drag and drop handlers using @dnd-kit
  const handleRowDragStart = (event) => {
    setActiveRowId(event.active.id)
    // Clear sorting when starting drag for smoother experience
    setSorting([])
  }

  const handleRowDragEnd = (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setActiveRowId(null)
      return
    }

    // Get current visible rows (after filtering) to understand visual order
    // Note: We clear sorting on drag start, so rows should be in data order
    const visibleRows = table.getRowModel().rows.map(row => row.original)
    const activeIndex = visibleRows.findIndex(s => s.id === active.id)
    const overIndex = visibleRows.findIndex(s => s.id === over.id)

    if (activeIndex === -1 || overIndex === -1) {
      setActiveRowId(null)
      return
    }

    // Use functional update to ensure we have the latest sessions state
    setSessions((prevSessions) => {
      // Find indices in the original data array
      const oldIndex = prevSessions.findIndex(s => s.id === active.id)
      const newIndex = prevSessions.findIndex(s => s.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        return prevSessions // Return unchanged if indices not found
      }

      // Use arrayMove from dnd-kit for smooth reordering
      return arrayMove(prevSessions, oldIndex, newIndex)
    })
    
    setActiveRowId(null)
  }

  // Initialize columnOrder state
  React.useEffect(() => {
    if (columnOrder.length === 0 && defaultColumnOrder.length > 0) {
      setColumnOrder(defaultColumnOrder)
    }
  }, [defaultColumnOrder])

  // Column drag and drop handlers using @dnd-kit
  const handleColumnDragStart = (event) => {
    setActiveColumnId(event.active.id)
  }

  const handleColumnDragEnd = (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setActiveColumnId(null)
      return
    }

    const newColumnOrder = [...columnOrder]
    const oldIndex = newColumnOrder.indexOf(active.id)
    const newIndex = newColumnOrder.indexOf(over.id)

    if (oldIndex === -1 || newIndex === -1) {
      setActiveColumnId(null)
      return
    }

    setColumnOrder(arrayMove(newColumnOrder, oldIndex, newIndex))
    setActiveColumnId(null)
  }

  // Define columns for TanStack Table
  const columns = useMemo(() => [
    {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => (
        <Tooltip content={row.getIsExpanded() ? "Collapse row details" : "Expand row details"} side="right">
          <button
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                row.toggleExpanded()
              }
            }}
            className="expand-button"
            aria-label={row.getIsExpanded() ? `Collapse row ${row.original.id} details` : `Expand row ${row.original.id} details`}
            aria-expanded={row.getIsExpanded()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {row.getIsExpanded() ? (
              <FaChevronUp style={{ fontSize: '12px', color: '#666' }} aria-hidden="true" />
            ) : (
              <FaChevronDown style={{ fontSize: '12px', color: '#666' }} aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      ),
      enableSorting: false,
      size: 40,
    },
    {
      id: 'select',
      header: ({ table }) => {
        // Check if all rows on current page are selected
        const currentPageRows = table.getRowModel().rows
        const allSelected = currentPageRows.length > 0 && 
          currentPageRows.every(row => selectedRows.has(row.original.id))
        const someSelected = currentPageRows.some(row => selectedRows.has(row.original.id))
        
        return (
          <Tooltip content={allSelected ? "Unselect all rows on this page" : "Select all rows on this page"} side="top">
            <span style={{ display: 'inline-block' }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected
                }}
                onChange={(e) => {
                  const checked = e.target.checked
                  const newSelected = new Set(selectedRows)
                  const currentPageRows = table.getRowModel().rows
                  
                  if (checked) {
                    // Select all rows on current page
                    currentPageRows.forEach(row => {
                      newSelected.add(row.original.id)
                    })
                  } else {
                    // Unselect all rows on current page
                    currentPageRows.forEach(row => {
                      newSelected.delete(row.original.id)
                    })
                  }
                  setSelectedRows(newSelected)
                }}
                onClick={(e) => e.stopPropagation()}
                aria-label={allSelected ? "Unselect all rows on this page" : "Select all rows on this page"}
              />
            </span>
          </Tooltip>
        )
      },
      cell: ({ row }) => (
        <Tooltip content={selectedRows.has(row.original.id) ? `Unselect row ${row.original.id}` : `Select row ${row.original.id}`} side="right">
          <input
            type="checkbox"
            checked={selectedRows.has(row.original.id)}
            onChange={() => handleRowSelect(row.original.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={selectedRows.has(row.original.id) ? `Unselect row ${row.original.id}` : `Select row ${row.original.id}`}
          />
        </Tooltip>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'startDate',
      header: ({ column, table }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="column-header-with-filter">
            <div
              className="sortable-header"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Start Date
              {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
              {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
              {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
            </div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="startDate"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        return (
          <div
            className="editable-cell"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCellClick(session.id, 'startDate', session.startDate, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            style={{ position: 'relative' }}
          >
            {isEditing(session.id, 'startDate') ? (
              <input
                type="date"
                className="inline-edit-input date-input"
                value={editValue}
                onChange={handleCellChange}
                onBlur={(e) => {
                  // Don't save if we're switching to another cell
                  if (isSwitchingCellRef.current) {
                    return
                  }
                  // Delay to allow calendar picker to be clicked
                  setTimeout(() => {
                    if (!isSwitchingCellRef.current) {
                      handleCellSave(session.id, 'startDate')
                    }
                  }, 200)
                }}
                onKeyDown={(e) => handleCellKeyDown(e, session.id, 'startDate')}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span onClick={(e) => e.stopPropagation()}>{session.startDate}</span>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const aValue = new Date(rowA.original.startDate.split('/').reverse().join('-'))
        const bValue = new Date(rowB.original.startDate.split('/').reverse().join('-'))
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'endDate',
      header: ({ column, table }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="column-header-with-filter">
            <div
              className="sortable-header"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              End Date
              {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
              {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
              {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
            </div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="endDate"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        return (
          <div
            className="editable-cell"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCellClick(session.id, 'endDate', session.endDate, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            style={{ position: 'relative' }}
          >
            {isEditing(session.id, 'endDate') ? (
              <input
                type="date"
                className="inline-edit-input date-input"
                value={editValue}
                onChange={handleCellChange}
                onBlur={(e) => {
                  // Don't save if we're switching to another cell
                  if (isSwitchingCellRef.current) {
                    return
                  }
                  // Delay to allow calendar picker to be clicked
                  setTimeout(() => {
                    if (!isSwitchingCellRef.current) {
                      handleCellSave(session.id, 'endDate')
                    }
                  }, 200)
                }}
                onKeyDown={(e) => handleCellKeyDown(e, session.id, 'endDate')}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span onClick={(e) => e.stopPropagation()}>{session.endDate}</span>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const aValue = new Date(rowA.original.endDate.split('/').reverse().join('-'))
        const bValue = new Date(rowB.original.endDate.split('/').reverse().join('-'))
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'startTime',
      header: ({ column, table }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="column-header-with-filter">
            <div
              className="sortable-header"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Start Time
              {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
              {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
              {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
            </div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="startTime"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        return (
          <div
            className="editable-cell"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCellClick(session.id, 'startTime', session.startTime, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            style={{ position: 'relative' }}
          >
            {isEditing(session.id, 'startTime') ? (
              <input
                type="time"
                className="inline-edit-input time-input"
                value={editValue}
                onChange={handleCellChange}
                onBlur={(e) => {
                  // Don't save if we're switching to another cell
                  if (isSwitchingCellRef.current) {
                    return
                  }
                  // Delay to allow time picker to be clicked
                  setTimeout(() => {
                    if (!isSwitchingCellRef.current) {
                      handleCellSave(session.id, 'startTime')
                    }
                  }, 200)
                }}
                onKeyDown={(e) => handleCellKeyDown(e, session.id, 'startTime')}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span onClick={(e) => e.stopPropagation()}>{session.startTime}</span>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        // Convert time to comparable format (HH:MM AM/PM)
        const convertTime = (timeStr) => {
          if (!timeStr) return 0
          const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
          if (!match) return 0
          let hours = parseInt(match[1], 10)
          const minutes = parseInt(match[2], 10)
          const period = match[3].toUpperCase()
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0
          return hours * 60 + minutes
        }
        const aValue = convertTime(rowA.original.startTime)
        const bValue = convertTime(rowB.original.startTime)
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'endTime',
      header: ({ column, table }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="column-header-with-filter">
            <div
              className="sortable-header"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              End Time
              {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
              {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
              {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
            </div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="endTime"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        return (
          <div
            className="editable-cell"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCellClick(session.id, 'endTime', session.endTime, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            style={{ position: 'relative' }}
          >
            {isEditing(session.id, 'endTime') ? (
              <input
                type="time"
                className="inline-edit-input time-input"
                value={editValue}
                onChange={handleCellChange}
                onBlur={(e) => {
                  // Don't save if we're switching to another cell
                  if (isSwitchingCellRef.current) {
                    return
                  }
                  // Delay to allow time picker to be clicked
                  setTimeout(() => {
                    if (!isSwitchingCellRef.current) {
                      handleCellSave(session.id, 'endTime')
                    }
                  }, 200)
                }}
                onKeyDown={(e) => handleCellKeyDown(e, session.id, 'endTime')}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span onClick={(e) => e.stopPropagation()}>{session.endTime}</span>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        // Convert time to comparable format (HH:MM AM/PM)
        const convertTime = (timeStr) => {
          if (!timeStr) return 0
          const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
          if (!match) return 0
          let hours = parseInt(match[1], 10)
          const minutes = parseInt(match[2], 10)
          const period = match[3].toUpperCase()
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0
          return hours * 60 + minutes
        }
        const aValue = convertTime(rowA.original.endTime)
        const bValue = convertTime(rowB.original.endTime)
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'location',
      header: ({ column, table }) => {
        const isSorted = column.getIsSorted()
        return (
          <div className="column-header-with-filter">
            <div
              className="sortable-header"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Location
              {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
              {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
              {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
            </div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="location"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        const isEditingLocation = isEditing(session.id, 'location')
        const locationError = locationErrors[session.id]
        
        return (
          <div
            className="editable-cell"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleCellClick(session.id, 'location', session.location, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            style={{ position: 'relative' }}
          >
            {isEditingLocation ? (
              <>
                <Tooltip 
                  content={locationError || "Enter a valid location (e.g., Location A, Location B, Location C, Location D, Location E)"} 
                  side="top"
                >
                  <input
                    type="text"
                    className={`inline-edit-input ${locationError ? 'is-invalid' : ''}`}
                    value={editValue}
                    onChange={handleCellChange}
                    onBlur={() => {
                      // Don't save if we're switching to another cell
                      if (!isSwitchingCellRef.current) {
                        handleCellSave(session.id, 'location')
                      }
                    }}
                    onKeyDown={(e) => handleCellKeyDown(e, session.id, 'location')}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    autoFocus
                    placeholder="Enter location"
                  />
                </Tooltip>
                {locationError && (
                  <div className="invalid-feedback" style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#dc3545', 
                    marginTop: '4px',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 20,
                    background: 'white',
                    padding: '4px 8px',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {locationError}
                  </div>
                )}
              </>
            ) : (
              <Tooltip content="Click to edit location" side="top">
                <span onClick={(e) => e.stopPropagation()}>{session.location}</span>
              </Tooltip>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const aValue = String(rowA.original.location || '').toLowerCase()
        const bValue = String(rowB.original.location || '').toLowerCase()
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'facility',
      header: ({ column, table }) => {
        return (
          <div className="column-header-with-filter">
            <div className="sortable-header">Facility</div>
            <ColumnFilterDropdown 
              column={column} 
              table={table} 
              accessorKey="facility"
              sessions={sessions}
              openFilterId={openFilterId}
              setOpenFilterId={setOpenFilterId}
            />
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true
        const cellValue = String(row.getValue(columnId))
        return filterValue.includes(cellValue)
      },
      cell: ({ row }) => {
        const session = row.original
        return (
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
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'extraFees',
      header: 'Extra Fees',
      cell: ({ row }) => (
        <span className="badge">
          {row.original.extraFees}
          <span className="badge-count">2</span>
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'fee',
      header: 'Fee',
      cell: ({ row }) => (
        <div className="non-editable-cell">
          <span>{row.original.fee}</span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        const isSorted = column.getIsSorted()
        return (
          <div
            className="sortable-header"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            {isSorted === 'asc' && <FaChevronUp className="sort-icon-active" />}
            {isSorted === 'desc' && <FaChevronDown className="sort-icon-active" />}
            {!isSorted && <FaChevronUp className="sort-icon-inactive" />}
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="non-editable-cell">
          <span>{row.original.price}</span>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const aValue = parseFloat(String(rowA.original.price).replace('$', '')) || 0
        const bValue = parseFloat(String(rowB.original.price).replace('$', '')) || 0
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      },
    },
    {
      accessorKey: 'include',
      header: 'Include',
      cell: ({ row }) => (
        <Tooltip content={row.original.include ? "Exclude row" : "Include row"} side="top">
          <button
            type="button"
            className={row.original.include ? "toggle-on" : "toggle-off"}
            onClick={() => handleIncludeToggle(row.original.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleIncludeToggle(row.original.id)
              }
            }}
            aria-label={row.original.include ? `Exclude row ${row.original.id}` : `Include row ${row.original.id}`}
            aria-pressed={row.original.include}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {row.original.include ? (
              <FaToggleOn aria-hidden="true" />
            ) : (
              <FaToggleOff aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="row-actions" role="group" aria-label={`Actions for row ${row.original.id}`}>
          <Tooltip content="View row" side="top">
            <button
              type="button"
              className="action-btn view-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleViewRow(row.original.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewRow(row.original.id)
                }
              }}
              aria-label={`View row ${row.original.id}`}
            >
              <FaEye />
            </button>
          </Tooltip>
          <Tooltip content="Edit row" side="top">
            <button
              type="button"
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleEditRow(row.original.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEditRow(row.original.id)
                }
              }}
              aria-label={`Edit row ${row.original.id}`}
            >
              <FaEdit />
            </button>
          </Tooltip>
          <Tooltip content="Delete row" side="top">
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDeleteRow(row.original.id)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteRow(row.original.id)
                }
              }}
              aria-label={`Delete row ${row.original.id}`}
            >
              <FaTrash />
            </button>
          </Tooltip>
        </div>
      ),
      enableSorting: false,
    },
  ], [sessions, editingCell, editValue, selectedRows, handleCellClick, handleCellChange, handleCellSave, handleCellKeyDown, isEditing, handleFacilityChange, getAvailableFacilities, handleIncludeToggle, handleViewRow, handleEditRow, handleDeleteRow])

  // Global filter function
  const globalFilterFn = (row, columnId, filterValue) => {
    const search = filterValue.toLowerCase()
    const session = row.original
    return (
      String(session.startDate || '').toLowerCase().includes(search) ||
      String(session.endDate || '').toLowerCase().includes(search) ||
      String(session.startTime || '').toLowerCase().includes(search) ||
      String(session.endTime || '').toLowerCase().includes(search) ||
      String(session.location || '').toLowerCase().includes(search) ||
      String(session.facility || '').toLowerCase().includes(search) ||
      String(session.extraFees || '').toLowerCase().includes(search) ||
      String(session.fee || '').toLowerCase().includes(search) ||
      String(session.price || '').toLowerCase().includes(search)
    )
  }

  // Create table instance
  const table = useReactTable({
    data: sessions,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
      expanded,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn,
    enableRowSelection: false, // We handle selection manually
    getRowCanExpand: () => true, // All rows can be expanded
  })

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
    <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={0}>
      <div className="contract-details-page">

     
      <div className="contract-header">
        <Tooltip content="Go back to previous page" side="bottom">
          <button 
            type="button"
            className="back-button"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft aria-hidden="true" />
            <span>Back</span>
          </button>
        </Tooltip>
        <div className="contract-title-section">
          <h1 className="contract-title">Contract Details</h1>
          <p className="contract-subtitle">Advanced Reservation Sessions</p>
        </div>
      </div>

      <div className="contract-content">
        <div className="contract-details-card">
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

          <div className="tabs-container" role="tablist" aria-label="Contract sections">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Tooltip key={tab.id} content={`Switch to ${tab.label} tab`} side="bottom">
                  <button
                    type="button"
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveTab(tab.id)
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault()
                        const currentIndex = tabs.findIndex(t => t.id === tab.id)
                        const nextIndex = e.key === 'ArrowRight' 
                          ? (currentIndex + 1) % tabs.length
                          : (currentIndex - 1 + tabs.length) % tabs.length
                        setActiveTab(tabs[nextIndex].id)
                        document.querySelectorAll('.tab-button')[nextIndex]?.focus()
                      }
                    }}
                    aria-label={`${tab.label} tab`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    <Icon className="tab-icon" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                </Tooltip>
              )
            })}
          </div>

          {activeTab === 'sessions' && (
            <div className="sessions-content">
              <div className="sessions-header">
                <div className="sessions-left">
                  <Tooltip 
                    content={selectedRows.size === 0 ? "Select rows to enable bulk update" : "Update multiple selected sessions at once"} 
                    side="bottom"
                  >
                    <button 
                      className="bulk-update-btn"
                      disabled={selectedRows.size === 0}
                    >
                      <FaPlus />
                      <span>Bulk Update</span>
                    </button>
                  </Tooltip>
                  <div className="success-message">
                    <FaCheck className="check-icon" />
                    <span>{sessions.length} sessions created</span>
                  </div>
                </div>
                <div className="sessions-right">
                  <Tooltip 
                    content={selectedRows.size === 0 ? "Select rows to export" : `Export ${selectedRows.size} selected session(s) to CSV file`} 
                    side="bottom"
                  >
                    <button 
                      type="button"
                      className="export-btn export-csv-btn" 
                      onClick={exportToCSV}
                      aria-label="Export selected sessions to CSV"
                      disabled={selectedRows.size === 0}
                    >
                      <FaFileExport className="export-icon" aria-hidden="true" />
                      <span>Export CSV</span>
                    </button>
                  </Tooltip>
                  <Tooltip 
                    content={selectedRows.size === 0 ? "Select rows to export" : `Export ${selectedRows.size} selected session(s) to PDF file`} 
                    side="bottom"
                  >
                    <button 
                      type="button"
                      className="export-btn export-pdf-btn" 
                      onClick={exportToPDF}
                      aria-label="Export selected sessions to PDF"
                      disabled={selectedRows.size === 0}
                    >
                      <FaFileAlt className="export-icon" aria-hidden="true" />
                      <span>Export PDF</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Search and Entries Per Page */}
              <div className="table-controls">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input
                    id="search-sessions"
                    type="text"
                    className="search-input"
                    placeholder="Q Search sessions..."
                    value={globalFilter}
                    onChange={handleSearch}
                    aria-label="Search sessions"
                  />
                </div>
                <div className="table-controls-right">
                  <div className="entries-per-page-container">
                    <label htmlFor="entries-per-page">Show</label>
                    <select
                      id="entries-per-page"
                      className="entries-per-page-select"
                      value={pagination.pageSize}
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
                  <div className="entries-info" role="status" aria-live="polite" aria-atomic="true">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}{' '}
                    of {table.getFilteredRowModel().rows.length} entries
                  </div>
                  {(hasOrderChanged || hasColumnOrderChanged) && (
                    <Tooltip content="Reset to original order" side="top">
                      <button
                        type="button"
                        className="reset-order-btn"
                        onClick={handleResetOrder}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleResetOrder()
                          }
                        }}
                        aria-label="Reset table to original row and column order"
                      >
                        <FaUndo className="reset-icon" aria-hidden="true" />
                        <span>Reset Order</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="sessions-table-container">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => {
                    if (event.active.data.current?.type === 'column') {
                      handleColumnDragStart(event)
                    } else {
                      handleRowDragStart(event)
                    }
                  }}
                  onDragEnd={(event) => {
                    if (event.active.data.current?.type === 'column') {
                      handleColumnDragEnd(event)
                    } else {
                      handleRowDragEnd(event)
                    }
                  }}
                >
                  <table className="sessions-table" role="table" aria-label="Sessions table">
                    <thead role="rowgroup">
                      {table.getHeaderGroups().map(headerGroup => {
                        const currentColumnOrder = columnOrder.length > 0 ? columnOrder : defaultColumnOrder
                        // Sort headers based on columnOrder
                        const sortedHeaders = [...headerGroup.headers].sort((a, b) => {
                          const aIndex = currentColumnOrder.indexOf(a.column.id)
                          const bIndex = currentColumnOrder.indexOf(b.column.id)
                          if (aIndex === -1) return 1
                          if (bIndex === -1) return -1
                          return aIndex - bIndex
                        })
                        return (
                          <tr key={headerGroup.id}>
                            <SortableContext
                              items={currentColumnOrder}
                              strategy={horizontalListSortingStrategy}
                            >
                              {sortedHeaders.map(header => {
                                const columnId = header.column.id
                                return (
                                  <SortableColumnHeader
                                    key={header.id}
                                    header={header}
                                    columnId={columnId}
                                    activeColumnId={activeColumnId}
                                    table={table}
                                  />
                                )
                              })}
                            </SortableContext>
                          </tr>
                        )
                      })}
                    </thead>
                    <tbody>
                      <SortableContext
                        items={table.getRowModel().rows.map(row => row.original.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map(row => {
                          const session = row.original
                          return (
                            <SortableRow
                              key={row.id}
                              row={row}
                              session={session}
                              table={table}
                              newRowIds={newRowIds}
                              duplicatedRowIds={duplicatedRowIds}
                              activeRowId={activeRowId}
                              restoredRowId={restoredRowId}
                              columnOrder={columnOrder}
                              defaultColumnOrder={defaultColumnOrder}
                              selectedRows={selectedRows}
                              handleRowSelect={handleRowSelect}
                              editingCell={editingCell}
                              editValue={editValue}
                              handleCellClick={handleCellClick}
                              handleCellChange={handleCellChange}
                              handleCellSave={handleCellSave}
                              handleCellKeyDown={handleCellKeyDown}
                              isEditing={isEditing}
                              handleFacilityChange={handleFacilityChange}
                              getAvailableFacilities={getAvailableFacilities}
                              handleIncludeToggle={handleIncludeToggle}
                              handleEditRow={handleEditRow}
                              handleDeleteRow={handleDeleteRow}
                            />
                          )
                        })}
                      </SortableContext>
                    </tbody>
                  </table>
                  <DragOverlay>
                    {activeRowId ? (
                      <table style={{ opacity: 0.5 }}>
                        <tbody>
                          <tr>
                            {table.getRowModel().rows
                              .find(r => r.original.id === activeRowId)
                              ?.getVisibleCells()
                              .map(cell => (
                                <td key={cell.id} style={{ padding: '8px', background: '#fff', border: '1px solid #ccc' }}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                          </tr>
                        </tbody>
                      </table>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>

              {/* Pagination Controls */}
              <div className="pagination-container">
                <div className="pagination-left">
                  <div className="entries-per-page-container">
                    <label htmlFor="entries-per-page-bottom">Show</label>
                    <select
                      id="entries-per-page-bottom"
                      className="entries-per-page-select"
                      value={pagination.pageSize}
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
                <div className="pagination-right">
                  <div className="total-amount">
                    ${sessions.reduce((sum, session) => {
                      const price = parseFloat(session.price?.replace('$', '') || 0)
                      return sum + price
                    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="pagination-controls">
                    <Tooltip content="Go to previous page" side="top">
                      <button
                        className="pagination-btn"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to previous page"
                      >
                        <span>&lt; Previous</span>
                      </button>
                    </Tooltip>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                        .filter(page => {
                          const currentPage = table.getState().pagination.pageIndex + 1
                          const totalPages = table.getPageCount()
                          // Show first page, last page, current page, and pages around current
                          return page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1)
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1]
                          const showEllipsis = prevPage && page - prevPage > 1
                          const currentPage = table.getState().pagination.pageIndex + 1
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="pagination-ellipsis">...</span>}
                              <Tooltip content={`Go to page ${page}`} side="top">
                                <button
                                  type="button"
                                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                  onClick={() => table.setPageIndex(page - 1)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      table.setPageIndex(page - 1)
                                    }
                                  }}
                                  aria-label={`Go to page ${page}`}
                                  aria-current={currentPage === page ? 'page' : undefined}
                                >
                                  {page}
                                </button>
                              </Tooltip>
                            </React.Fragment>
                          )
                        })}
                    </div>
                    
                    <Tooltip content="Go to next page" side="top">
                      <button
                        className="pagination-btn"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to next page"
                      >
                        <span>Next &gt;</span>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <Tooltip content="Add a new session row" side="top">
                <button className="add-session-btn" onClick={handleAddSession} aria-label="Add new session">
                  <FaPlus />
                  <span>Add Session</span>
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      <div className="contract-footer">
        <Tooltip content="Cancel and discard changes" side="top">
          <button className="footer-btn cancel-btn" onClick={() => setIsCancelModalOpen(true)} aria-label="Cancel contract">
            Cancel
          </button>
        </Tooltip>
        <div className="footer-actions">
          <Tooltip content="Save contract and close" side="top">
            <button className="footer-btn action-btn save-btn" aria-label="Save and close contract">
              <FaFileAlt />
              <span>Save & Close</span>
            </button>
          </Tooltip>
          <Tooltip content="Send contract via email" side="top">
            <button className="footer-btn action-btn send-btn" onClick={() => setIsSendModalOpen(true)} aria-label="Send contract">
              <FaEnvelope />
              <span>Send</span>
            </button>
          </Tooltip>
          <Tooltip content="Firm and finalize the contract" side="top">
            <button className="footer-btn action-btn firm-btn" onClick={() => setIsFirmModalOpen(true)} aria-label="Firm contract">
              <FaCheck />
              <span>Firm Contract</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Send Contract Modal */}
      <SendContractModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={(formData) => {
          console.log('Sending contract:', formData)
          setIsSendModalOpen(false)
          // Show success toast with custom component for progress bar
          toast.custom(
            (t) => (
              <SuccessToast
                message="Contract sent successfully"
                onClose={() => toast.dismiss(t.id)}
                t={t}
                duration={4000}
              />
            ),
            {
              duration: Infinity, // Let our animation control when to close
              position: 'top-right'             
            }
          )
        }}
      />

      {/* Confirm Firm Contract Modal */}
      <FirmContractModal
        isOpen={isFirmModalOpen}
        onClose={() => setIsFirmModalOpen(false)}
        onConfirm={() => {
          console.log('Contract firmed')
          setIsFirmModalOpen(false)
          // Show success toast with custom component for progress bar
          toast.custom(
            (t) => (
              <SuccessToast
                message="Contract firmed successfully"
                onClose={() => toast.dismiss(t.id)}
                t={t}
                duration={4000}
              />
            ),
            {
              duration: Infinity, // Let our animation control when to close
              position: 'top-right'             
            }
          )
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

      {/* View Session Modal */}
      <ViewSessionModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewingSession(null)
        }}
        session={viewingSession}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSession(null)
        }}
        session={editingSession}
        onSave={handleSaveEditedSession}
        locationFacilityMap={locationFacilityMap}
        calculateFee={calculateFee}
        calculatePrice={calculatePrice}
        convertToDateInputFormat={convertToDateInputFormat}
        convertFromDateInputFormat={convertFromDateInputFormat}
        convertToTimeInputFormat={convertToTimeInputFormat}
        convertFromTimeInputFormat={convertFromTimeInputFormat}
      />

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          removeDelay: 0,
          pauseOnHover: false,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#34C759',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
          },
        }}
      />
      </div>
    </TooltipPrimitive.Provider>
  )
}

export default ContractDetails;


import React from 'react'
import { FaUser, FaCalendarAlt, FaBuilding, FaShoppingBag, FaGlobe, FaEllipsisH } from 'react-icons/fa'
import './SecondaryNav.css'

const SecondaryNav = () => {
  const navItems = [
    { icon: FaUser, label: 'Clients' },
    { icon: FaCalendarAlt, label: 'Classes' },
    { icon: FaBuilding, label: 'Facilities' },
    { icon: FaShoppingBag, label: 'Store' },
    { icon: FaGlobe, label: 'Marketing' },
    { icon: FaEllipsisH, label: 'More' },
  ]

  return (
    <nav className="secondary-nav">
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button key={index} className="nav-button">
            <Icon className="nav-icon" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default SecondaryNav


import React from 'react'
import { FaRocket, FaShoppingCart, FaList, FaCircle } from 'react-icons/fa'
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <FaRocket className="logo-icon" />
        <span className="logo-text">xplor</span>
      </div>
      <div className="header-right">
        <div className="header-item">
          <FaShoppingCart className="header-icon" />
          <span>POS</span>
        </div>
        <div className="header-item">
          <FaList className="header-icon" />
          <span>Tasks</span>
        </div>
        <div className="header-item profile">
          <div className="profile-picture">
            <div className="profile-avatar">JJ</div>
            <FaCircle className="online-indicator" />
          </div>
          <span>John Jones</span>
        </div>
      </div>
    </header>
  )
}

export default Header


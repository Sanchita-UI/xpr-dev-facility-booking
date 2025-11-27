import React from 'react'
import Header from './components/Header'
import SecondaryNav from './components/SecondaryNav'
import ContractDetails from './pages/ContractDetails'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <SecondaryNav />
      <ContractDetails />
    </div>
  )
}

export default App


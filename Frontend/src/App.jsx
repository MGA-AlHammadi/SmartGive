import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] grid grid-rows-[1fr_auto]">
      <div className="min-h-0">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App

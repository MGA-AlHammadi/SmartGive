import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Footer from './components/Footer'

// Temporäre Platzhalter für die Profilseiten
const SpenderProfile = () => (
  <div className="p-20 text-center animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Mein Spender-Profil</h1>
    <p className="text-gray-500 text-lg">Hier kannst du deine persönlichen Daten und Spenden verwalten.</p>
  </div>
);

const NGOProfile = () => (
  <div className="p-20 text-center animate-in fade-in duration-500">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">NGO Dashboard</h1>
    <p className="text-gray-500 text-lg">Verwalte hier deine Bedarfe und sieh eingegangene Spenden ein.</p>
  </div>
);

function App() {
  const location = useLocation();
  const hideHeaderFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="h-screen bg-[#F7F6F2] grid grid-rows-[1fr_auto] overflow-hidden">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1a4731',
            borderRadius: '12px',
            border: '1px solid #f4ece3',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(26, 71, 49, 0.1)'
          },
          success: {
            iconTheme: {
              primary: '#1a4731',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <div className="overflow-y-auto min-h-0 flex flex-col">
        {!hideHeaderFooter && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/spender-profile" element={<SpenderProfile />} />
            <Route path="/ngo-profile" element={<NGOProfile />} />
          </Routes>
        </main>
      </div>
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}

export default App

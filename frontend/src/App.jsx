import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useChatStore } from './store/chatStore'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import ScholarshipsPage from './pages/ScholarshipsPage'
import InternshipsPage from './pages/InternshipsPage'
import NPTELPage from './pages/NPTELPage'
import StateSchemesPage from './pages/StateSchemesPage'
import HeroPage from './pages/HeroPage'

export default function App() {
  const { activeView } = useChatStore()

  // Removed old onpopstate logic since React Router handles back navigation automatically
  
  return (
    <Routes>
      <Route path="/" element={<HeroPage onEnter={() => {}} />} />
      <Route path="/chat" element={
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
          <div className="bg-mesh" />
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            {activeView === 'chat' && <ChatPage />}
            {activeView === 'scholarships' && <ScholarshipsPage />}
            {activeView === 'internships' && <InternshipsPage />}
            {activeView === 'nptel' && <NPTELPage />}
            {activeView === 'state-schemes' && <StateSchemesPage />}
          </div>
        </div>
      } />
    </Routes>
  )
}

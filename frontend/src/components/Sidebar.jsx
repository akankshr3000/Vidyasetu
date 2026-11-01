import React, { useEffect } from 'react'
import { useChatStore } from '../store/chatStore'
import { MessageSquare, ChevronLeft, ChevronRight, Sparkles, GraduationCap, Plus, Award, MessageCircle, Trash2, Briefcase, BookOpen, Landmark } from 'lucide-react'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(79,142,247,0.35)', flexShrink: 0,
    }}>
      <GraduationCap size={18} color="#fff" />
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1 }}>VidyaSetu</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>AI Assistant</div>
    </div>
  </div>
)

const navItems = [
  { id: 'scholarships', icon: Award, label: 'Scholarships', desc: 'Browse all India' },
  { id: 'internships', icon: Briefcase, label: 'Internships', desc: 'Explore opportunities' },
  { id: 'nptel', icon: BookOpen, label: 'NPTEL Courses', desc: 'IIT/IISc courses' },
  { id: 'state-schemes', icon: Landmark, label: 'State Schemes', desc: 'Govt welfare' },
]

export default function Sidebar() {
  const { activeView, setActiveView, sidebarOpen, toggleSidebar, newSession, chatSessions, fetchSessions, loadSessionData, sessionId, deleteSession } = useChatStore()

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <div style={{
      width: sidebarOpen ? 260 : 64,
      height: '100vh',
      background: 'rgba(13,18,32,0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', flexShrink: 0, zIndex: 10, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: sidebarOpen ? '20px 20px 16px' : '20px 14px 16px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
        {sidebarOpen ? <Logo /> : (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={18} color="#fff" />
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border-accent), transparent)', margin: '0 12px 12px' }} />

      {/* New Chat Button */}
      <div style={{ padding: sidebarOpen ? '0 12px 12px' : '0 8px 12px' }}>
        <button onClick={newSession} className="btn btn-primary" style={{ width: '100%', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px' }}>
          <Plus size={16} />
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Main Options */}
      <div style={{ padding: '0 8px', marginBottom: 16 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
            background: activeView === item.id ? 'rgba(79,142,247,0.12)' : 'transparent',
            color: activeView === item.id ? 'var(--accent-bright)' : 'var(--text-secondary)',
            transition: 'all 0.2s', marginBottom: 2,
            justifyContent: sidebarOpen ? 'flex-start' : 'center', position: 'relative',
          }}
          onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={e => { if (activeView !== item.id) e.currentTarget.style.background = 'transparent' }}
          >
            {activeView === item.id && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 24, background: 'var(--accent)', borderRadius: '0 3px 3px 0' }} />}
            <item.icon size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{item.label}</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Chat History List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', display: 'flex', flexDirection: 'column' }}>
        {sidebarOpen && <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 8px 8px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Recent Chats</div>}
        {chatSessions.map(session => (
          <div key={session.chat_id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button onClick={() => loadSessionData(session.chat_id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: sidebarOpen ? '10px 12px' : '10px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              background: activeView === 'chat' && sessionId === session.chat_id ? 'rgba(79,142,247,0.12)' : 'transparent',
              color: activeView === 'chat' && sessionId === session.chat_id ? 'var(--accent-bright)' : 'var(--text-secondary)',
              transition: 'all 0.2s', marginBottom: 2,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
            onMouseEnter={e => { if (!(activeView === 'chat' && sessionId === session.chat_id)) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!(activeView === 'chat' && sessionId === session.chat_id)) e.currentTarget.style.background = 'transparent' }}
            >
              <MessageCircle size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && (
                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title || "New Chat"}</div>
                </div>
              )}
            </button>
            {sidebarOpen && activeView === 'chat' && sessionId === session.chat_id && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteSession(session.chat_id); }}
                style={{
                  position: 'absolute', right: 8, padding: 4, background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 4
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: sidebarOpen ? '12px 16px' : '12px 8px', borderTop: '1px solid var(--border)' }}>
        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={13} color="var(--gold)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Powered by Groq AI</span>
          </div>
        )}
        <button onClick={toggleSidebar} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: 8, padding: '8px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {sidebarOpen ? <><ChevronLeft size={14} /><span>Collapse</span></> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  )
}

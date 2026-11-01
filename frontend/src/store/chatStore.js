import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { getChatSessions, getHistory, deleteChatSession } from '../services/api'

const STORAGE_KEY = 'vidyasetu_session'

function loadSession() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

export const useChatStore = create((set, get) => {
  const savedSession = loadSession()
  return {
    sessionId: savedSession?.sessionId || uuidv4(),
    messages: savedSession?.messages || [],
    chatSessions: [],
    isLoading: false,
    language: savedSession?.language || 'en-IN',
    activeView: 'chat', // 'chat' | 'scholarships' | 'internships' | 'nptel' | 'state-schemes'
    sidebarOpen: true,

    fetchSessions: async () => {
      try {
        const sessions = await getChatSessions()
        set({ chatSessions: sessions })
      } catch (e) {
        console.error("Failed to fetch sessions", e)
      }
    },

    loadSessionData: async (id) => {
      try {
        set({ isLoading: true })
        const data = await getHistory(id)
        const messages = data.messages.map(m => ({...m, id: uuidv4()}))
        set({ sessionId: data.chat_id, messages, activeView: 'chat', isLoading: false })
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: data.chat_id, messages, language: get().language }))
      } catch (e) {
        console.error("Failed to load session", e)
        set({ isLoading: false })
      }
    },

    deleteSession: async (id) => {
       try {
         await deleteChatSession(id)
         const { chatSessions, sessionId } = get()
         set({ chatSessions: chatSessions.filter(s => s.chat_id !== id) })
         if (sessionId === id) {
            get().newSession()
         }
       } catch (e) {
         console.error("Failed to delete session", e)
       }
    },

    setLanguage: (lang) => {
      set({ language: lang })
      const s = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: s.sessionId, messages: s.messages, language: lang }))
    },

    setActiveView: (view) => set({ activeView: view }),
    toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

    addMessage: (msg) => {
      set(s => {
        const messages = [...s.messages, { ...msg, id: uuidv4(), timestamp: new Date().toISOString() }]
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: s.sessionId, messages, language: s.language }))
        return { messages }
      })
    },

    setLoading: (isLoading) => set({ isLoading }),

    clearChat: () => {
      const newSession = uuidv4()
      set({ messages: [], sessionId: newSession })
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: newSession, messages: [], language: get().language }))
    },

    newSession: () => {
      const newSession = uuidv4()
      set({ messages: [], sessionId: newSession, activeView: 'chat' })
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: newSession, messages: [], language: get().language }))
    },
  }
})

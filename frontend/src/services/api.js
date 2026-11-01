import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const sendMessage = async (message, language, sessionId) => {
  const { data } = await api.post('/chat', { message, language, session_id: sessionId })
  return data
}

export const sendMessageWithImage = async (message, language, sessionId, imageBase64) => {
  const { data } = await api.post('/chat', {
    message,
    language,
    session_id: sessionId,
    image_base64: imageBase64,
  })
  return data
}

export const getHistory = async (sessionId) => {
  const { data } = await api.get(`/chat/${sessionId}`)
  return data
}

export const getChatSessions = async () => {
  const { data } = await api.get('/chats')
  return data
}

export const deleteChatSession = async (id) => {
  const { data } = await api.delete(`/chat/${id}`)
  return data
}

export const getFAQs = async (category = null) => {
  const params = category ? { category } : {}
  const { data } = await api.get('/admin/faqs', { params })
  return data
}

export const createFAQ = async (faq) => {
  const { data } = await api.post('/admin/faqs', faq)
  return data
}

export const updateFAQ = async (id, faq) => {
  const { data } = await api.put(`/admin/faqs/${id}`, faq)
  return data
}

export const deleteFAQ = async (id) => {
  const { data } = await api.delete(`/admin/faqs/${id}`)
  return data
}

export const getStats = async () => {
  const { data } = await api.get('/admin/stats')
  return data
}

export const getAllQueries = async () => {
  const { data } = await api.get('/admin/queries')
  return data
}
export const getScholarships = async (params = {}) => {
  const { data } = await api.get('/scholarships', { params })
  return data
}

export const searchScholarships = async (query) => {
  const { data } = await api.get('/scholarships', { params: { search: query } })
  return data
}

// ── Internships ───────────────────────────────────────────────────────────────

export const getInternships = async (params = {}) => {
  const { data } = await api.get('/internships', { params })
  return data
}

export const searchInternships = async (query) => {
  const { data } = await api.get('/internships', { params: { search: query } })
  return data
}

// ── NPTEL Courses ─────────────────────────────────────────────────────────────

export const getNPTELCourses = async (query) => {
  const { data } = await api.get('/nptel', { params: { query } })
  return data
}

// ── State Schemes ─────────────────────────────────────────────────────────────

export const getStateSchemes = async (params = {}) => {
  const { data } = await api.get('/state-schemes', { params })
  return data
}

export const getStateSchemeLiveUpdate = async (schemeId) => {
  const { data } = await api.get(`/state-schemes/${schemeId}/live-update`)
  return data
}

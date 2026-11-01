import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'
import { sendMessage, sendMessageWithImage } from '../services/api'
import Message, { TypingIndicator } from '../components/Message'
import { Send, Trash2, GraduationCap, BookOpen, Award, FileText, Landmark, Mic, ImageIcon, X } from 'lucide-react'
import { speakText } from '../utils/audio'

const SUGGESTIONS = [
  { icon: BookOpen, text: 'Documents needed for college admission?', color: '#4f8ef7', cat: 'Admissions' },
  { icon: Award, text: 'How to apply for PM scholarship?', color: '#f59e0b', cat: 'Scholarships' },
  { icon: Landmark, text: 'What is PM-USHA scheme?', color: '#10b981', cat: 'Govt Schemes' },
  { icon: FileText, text: 'How to get income certificate?', color: '#8b5cf6', cat: 'Certificates' },
  { icon: BookOpen, text: 'Post-matric scholarship eligibility?', color: '#4f8ef7', cat: 'Scholarships' },
  { icon: FileText, text: 'How to get bonafide certificate?', color: '#8b5cf6', cat: 'Certificates' },
]

function EmptyState({ onSuggest }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(139,92,246,0.15))',
        border: '1px solid rgba(79,142,247,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 8px 32px rgba(79,142,247,0.1)',
      }}>
        <GraduationCap size={32} color="var(--accent-bright)" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #f0f4ff, #8b9fc7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Hello! I'm VidyaSetu
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 420, lineHeight: 1.7, marginBottom: 32 }}>
        Your intelligent guide for college admissions, scholarships, government schemes, and student services. Ask me anything.
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['English'].map(l => (
          <span key={l} style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, background: 'rgba(79,142,247,0.08)', color: 'var(--accent-bright)', border: '1px solid rgba(79,142,247,0.15)' }}>{l}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 560, width: '100%' }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => onSuggest(s.text)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
            background: 'rgba(17,24,39,0.6)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s', color: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,34,53,0.9)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(17,24,39,0.6)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <s.icon size={13} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.cat}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.text}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { messages, isLoading, addMessage, setLoading, sessionId, clearChat, fetchSessions } = useChatStore()
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const isManualStopRef = useRef(false)
  const baseInputRef = useRef("")
  const fileInputRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WEBP images are supported')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target.result)
      // Extract base64 without the data:image/...;base64, prefix
      const base64 = ev.target.result.split(',')[1]
      setSelectedImage(base64)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // Reset file input
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSend = async (text) => {
    const msg = (text || input).trim()
    if ((!msg && !selectedImage) || isLoading) return
    setInput('')
    
    const userMsg = { role: 'user', content: msg || '(image attached)' }
    if (imagePreview) userMsg.image = imagePreview
    addMessage(userMsg)
    
    const currentImage = selectedImage
    removeImage()
    setLoading(true)
    
    window.speechSynthesis.cancel();
    
    try {
      const lang = "en-IN";
      let res
      if (currentImage) {
        res = await sendMessageWithImage(msg || 'Analyze this image', lang, sessionId, currentImage)
      } else {
        res = await sendMessage(msg, lang, sessionId)
      }
      addMessage({ role: 'assistant', content: res.reply, sources: res.sources, category: res.category })
    } catch (err) {
      addMessage({ role: 'assistant', content: '⚠️ Could not connect to the server. Please make sure the backend is running on port 8000.' })
    } finally {
      setLoading(false)
      fetchSessions()
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const toggleListening = () => {
    if (isListening) {
      isManualStopRef.current = true;
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Your browser does not support Speech Recognition."); return; }
    isManualStopRef.current = false;
    baseInputRef.current = input;
    setIsListening(true);
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    let selectedLangCode = "en-IN";
    let finalTranscript = "";
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLangCode;
    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) { finalTranscript += " " + transcript; }
        else { interimTranscript += transcript; }
      }
      const inputElement = document.getElementById("chat-input");
      const newText = (baseInputRef.current + finalTranscript + interimTranscript).trim().replace(/\s+/g, ' ');
      if (inputElement) { inputElement.value = newText; setInput(inputElement.value); }
      else { setInput(newText); }
    };
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isManualStopRef.current = true; setIsListening(false);
      }
    };
    recognition.onend = () => {
      if (!isManualStopRef.current) { try { recognition.start(); } catch (e) { setIsListening(false); } }
      else { setIsListening(false); }
    };
    try { recognition.start(); } catch (e) { console.error("Could not start SpeechRecognition", e); setIsListening(false); }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{
        padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Chat Assistant</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Education & Governance Services</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={clearChat} className="btn btn-ghost btn-sm btn-icon" title="Clear chat">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.length === 0 ? (
          <EmptyState onSuggest={(text) => { setInput(text); handleSend(text) }} />
        ) : (
          messages.map(msg => <Message key={msg.id} msg={msg} />)
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '16px 24px 24px', background: 'rgba(8,11,20,0.9)',
        backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        {/* Image preview */}
        {imagePreview && (
          <div style={{
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', background: 'rgba(17,24,39,0.8)',
            border: '1px solid rgba(79,142,247,0.2)', borderRadius: 'var(--radius-md)',
          }}>
            <img src={imagePreview} alt="Preview" style={{
              height: 48, maxWidth: 80, borderRadius: 8, objectFit: 'cover',
              border: '1px solid var(--border)',
            }} />
            <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>Image attached</div>
            <button onClick={removeImage} style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 6, padding: 4, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} color="var(--red)" />
            </button>
          </div>
        )}

        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'rgba(17,24,39,0.8)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)', padding: '8px 8px 8px 16px',
          transition: 'border-color 0.2s',
          boxShadow: '0 0 0 0 rgba(79,142,247,0)',
        }}>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); baseInputRef.current = e.target.value; }}
            onKeyDown={handleKey}
            placeholder={isListening ? "🎙️ Listening..." : "Ask about admissions, scholarships, government schemes..."}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: 14, lineHeight: 1.6, resize: 'none', maxHeight: 120,
              overflow: 'auto',
            }}
          />
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: imagePreview ? 'rgba(16,185,129,0.15)' : 'rgba(79,142,247,0.1)',
              border: imagePreview ? '1px solid rgba(16,185,129,0.3)' : 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Attach image (JPG/PNG/WEBP, max 5MB)"
          >
            <ImageIcon size={16} color={imagePreview ? '#10b981' : 'var(--text-muted)'} />
          </button>
          {/* Mic button */}
          <button
            onClick={toggleListening}
            className={isListening ? "recording" : ""}
            style={{
              height: 38, borderRadius: 12, flexShrink: 0,
              padding: isListening ? '0 12px' : '0', width: isListening ? 'auto' : 38,
              background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(79,142,247,0.1)',
              border: isListening ? '1px solid rgba(239,68,68,0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
              boxShadow: isListening ? '0 0 15px rgba(239,68,68,0.8)' : 'none',
            }}
            title="Speak clearly"
          >
            {isListening ? (
              <span style={{ fontSize: 14, animation: 'pulse 1.5s infinite' }}>🛑</span>
            ) : (
              <span style={{ fontSize: 16 }}>🎙️</span>
            )}
          </button>
          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || isLoading || isListening}
            style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: (input.trim() || selectedImage) && !isLoading ? 'linear-gradient(135deg, #4f8ef7, #3b82f6)' : 'rgba(79,142,247,0.1)',
              border: 'none', cursor: (input.trim() || selectedImage) && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: (input.trim() || selectedImage) && !isLoading ? '0 4px 12px rgba(79,142,247,0.3)' : 'none',
            }}
          >
            <Send size={15} color={(input.trim() || selectedImage) && !isLoading ? '#fff' : 'var(--text-muted)'} />
          </button>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          Press <kbd style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 10 }}>Enter</kbd> to send · <kbd style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 10 }}>Shift+Enter</kbd> for new line · 📎 Attach image for visual analysis
        </div>
      </div>
    </div>
  )
}

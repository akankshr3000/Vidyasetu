import React from 'react'
import ReactMarkdown from 'react-markdown'
import { GraduationCap, User, BookOpen } from 'lucide-react'
import { speakText } from '../utils/audio'
import RichCard, { parseRichCards } from './RichCard'

const categoryColors = {
  admissions: { color: '#4f8ef7', label: 'Admissions' },
  scholarships: { color: '#f59e0b', label: 'Scholarships' },
  government: { color: '#10b981', label: 'Govt Schemes' },
  certificates: { color: '#8b5cf6', label: 'Certificates' },
  internships: { color: '#f59e0b', label: 'Internships' },
  nptel: { color: '#10b981', label: 'NPTEL' },
  general: { color: '#64748b', label: 'General' },
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', animation: 'fadeUp 0.3s ease' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <GraduationCap size={16} color="#fff" />
      </div>
      <div style={{
        background: 'rgba(26,34,53,0.9)', border: '1px solid var(--border)',
        borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

export default function Message({ msg }) {
  const isUser = msg.role === 'user'
  const cat = categoryColors[msg.category] || categoryColors.general

  const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  if (isUser) {
    return (
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {/* Image thumbnail if attached */}
          {msg.image && (
            <div style={{ marginBottom: 6 }}>
              <img src={msg.image} alt="Attached" style={{
                maxWidth: 200, maxHeight: 150, borderRadius: 12,
                border: '1px solid rgba(79,142,247,0.3)',
                objectFit: 'cover',
              }} />
            </div>
          )}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #4f8ef7 100%)',
            color: '#fff', borderRadius: '18px 18px 4px 18px',
            padding: '12px 18px', fontSize: 14, lineHeight: 1.6,
            boxShadow: '0 4px 16px rgba(79,142,247,0.25)',
          }}>
            {msg.content}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{time}</span>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={16} color="var(--accent-bright)" />
        </div>
      </div>
    )
  }

  // Parse for [CARD] blocks
  const segments = parseRichCards(msg.content)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'fadeUp 0.3s ease' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(79,142,247,0.3)',
      }}>
        <GraduationCap size={16} color="#fff" />
      </div>
      <div style={{ maxWidth: '76%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          background: 'rgba(26,34,53,0.85)', border: '1px solid var(--border)',
          borderRadius: '4px 18px 18px 18px', padding: '14px 18px',
          backdropFilter: 'blur(10px)',
        }}>
          {msg.category && msg.category !== 'general' && (
            <div style={{ marginBottom: 8 }}>
              <span className="badge" style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}30`, fontSize: 10, padding: '2px 8px' }}>
                <BookOpen size={9} />
                {cat.label}
              </span>
            </div>
          )}
          {/* Render segments: text or rich card */}
          <div className="md-content message-content" style={{ fontSize: 14, lineHeight: 1.7 }}>
            {segments.map((seg, idx) => (
              seg.type === 'card'
                ? <RichCard key={idx} data={seg.content} />
                : <ReactMarkdown key={idx}>{seg.content}</ReactMarkdown>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className="read-btn"
              onClick={(e) => {
                const contentDiv = e.currentTarget.parentElement.previousSibling;
                const raw = contentDiv ? contentDiv.innerText : msg.content;
                const lang = document.getElementById("lang-select")?.value || "en-IN";
                speakText(raw, lang);
              }}
              style={{
                background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)',
                color: 'var(--accent-bright)', fontSize: 11, padding: '4px 8px', borderRadius: 6,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              🔊 Read
            </button>
          </div>
          {msg.sources && msg.sources.length > 0 && msg.has_real_sources && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sources</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {msg.sources.map((src, i) => (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" key={i} style={{ fontSize: 11, color: 'var(--accent-bright)', background: 'rgba(79,142,247,0.08)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(79,142,247,0.2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {src.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>{time}</span>
      </div>
    </div>
  )
}

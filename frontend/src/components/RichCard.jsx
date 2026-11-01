import React from 'react'
import { ExternalLink } from 'lucide-react'

const categoryStyles = {
  scholarship: { color: '#4f8ef7', icon: '🎓', label: 'Scholarship' },
  internship: { color: '#f59e0b', icon: '💼', label: 'Internship' },
  'state-scheme': { color: '#10b981', icon: '🏛️', label: 'State Scheme' },
  research: { color: '#8b5cf6', icon: '🔬', label: 'Research' },
  default: { color: '#64748b', icon: '📋', label: 'Info' },
}

/**
 * Parse bot response text for [CARD]...[/CARD] markers.
 * Returns an array of segments: { type: 'text' | 'card', content: string | object }
 */
export function parseRichCards(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', content: text || '' }]

  const segments = []
  const cardRegex = /\[CARD\]\s*([\s\S]*?)\s*\[\/CARD\]/g
  let lastIndex = 0
  let match

  while ((match = cardRegex.exec(text)) !== null) {
    // Text before the card
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim()
      if (before) segments.push({ type: 'text', content: before })
    }

    // Try to parse the JSON
    try {
      const cardData = JSON.parse(match[1].trim())
      segments.push({ type: 'card', content: cardData })
    } catch (e) {
      // If JSON parsing fails, treat as text
      segments.push({ type: 'text', content: match[1].trim() })
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text after last card
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining) segments.push({ type: 'text', content: remaining })
  }

  if (segments.length === 0) {
    return [{ type: 'text', content: text }]
  }

  return segments
}

export default function RichCard({ data }) {
  const cat = categoryStyles[data.category] || categoryStyles.default
  const color = cat.color

  const infoItems = [
    data.amount && { label: 'Amount / Stipend', value: data.amount },
    data.deadline && { label: 'Deadline', value: data.deadline },
    data.states && { label: 'Region', value: data.states },
    data.type && { label: 'Type', value: data.type.charAt(0).toUpperCase() + data.type.slice(1) },
    data.eligibility && { label: 'Eligibility', value: data.eligibility },
  ].filter(Boolean)

  return (
    <div className="rich-card" style={{
      background: 'rgba(17,24,39,0.85)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      marginTop: 8,
      marginBottom: 8,
      animation: 'fadeUp 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        background: `linear-gradient(135deg, ${color}12, transparent)`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{data.icon || cat.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              color: 'var(--text-primary)', lineHeight: 1.3,
            }}>
              {data.title}
            </div>
            {data.provider && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{data.provider}</div>
            )}
          </div>
          <span style={{
            fontSize: 9, padding: '2px 8px', borderRadius: 20,
            background: `${color}18`, color, border: `1px solid ${color}30`,
            fontFamily: 'var(--font-display)', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {cat.label}
          </span>
        </div>
      </div>

      {/* Info Grid */}
      {infoItems.length > 0 && (
        <div style={{
          padding: '12px 16px',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px',
        }}>
          {infoItems.map((item, i) => (
            <div key={i}>
              <div style={{
                fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {data.apply_link && (
        <div style={{ padding: '0 16px 14px' }}>
          <a
            href={data.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              background: `${color}18`, color, border: `1px solid ${color}30`,
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)',
              textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}28` }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}18` }}
          >
            <ExternalLink size={12} /> Apply Now
          </a>
        </div>
      )}
    </div>
  )
}

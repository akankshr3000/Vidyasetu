import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Briefcase, Calendar, ExternalLink, ChevronDown, X, Building2 } from 'lucide-react'

const STATES = ['All India', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'Himachal Pradesh', 'Odisha', 'Uttar Pradesh', 'Bihar', 'Andhra Pradesh', 'Telangana']
const DOMAINS = ['All Domains', 'Engineering', 'Computer Science', 'AI/ML', 'Science', 'Research', 'Policy', 'Defence', 'Agriculture', 'Medical', 'Technology', 'Law']
const TYPES = ['All', 'government', 'private', 'research']

const typeColors = {
  government: '#4f8ef7',
  private: '#f59e0b',
  research: '#8b5cf6',
}

const typeLabels = {
  government: 'Government',
  private: 'Private',
  research: 'Research',
}

function InternshipCard({ i }) {
  const [expanded, setExpanded] = useState(false)
  const color = typeColors[i.type] || '#4f8ef7'

  return (
    <div style={{
      background: 'rgba(17,24,39,0.75)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      transition: 'all 0.2s', cursor: 'pointer',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    onClick={() => setExpanded(!expanded)}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                {typeLabels[i.type] || 'Internship'}
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {i.domain}
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {i.states || 'All India'}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{i.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={11} />
              {i.organization}
            </div>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Key info pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {i.stipend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>💰</span>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{i.stipend?.split('\n')[0]?.substring(0, 50)}</span>
            </div>
          )}
          {i.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>⏱️</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{i.duration}</span>
            </div>
          )}
          {i.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--gold-light)' }}>{i.deadline?.substring(0, 50)}</span>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
            {i.eligibility && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Eligibility</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{i.eligibility}</div>
              </div>
            )}
            {i.apply_link && (
              <a href={i.apply_link} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginTop: 4, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}28` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${color}18` }}
              >
                <ExternalLink size={12} /> Apply Now
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (stateFilter && stateFilter !== 'All India') params.state = stateFilter
      if (domainFilter && domainFilter !== 'All Domains') params.domain = domainFilter
      if (typeFilter && typeFilter !== 'All') params.type = typeFilter
      if (search) params.search = search
      const { data } = await axios.get('/api/internships', { params })
      setInternships(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [stateFilter, domainFilter, typeFilter, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setStateFilter(''); setDomainFilter(''); setTypeFilter(''); setSearch(''); setSearchInput('')
  }

  const hasFilters = stateFilter || domainFilter || typeFilter || search

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Briefcase size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Internships</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{internships.length} opportunities across India</div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div style={{ padding: '12px 24px', background: 'rgba(13,18,32,0.6)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, organization, domain..."
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>
          <select className="input" value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ width: 150, fontSize: 13 }}>
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={{ width: 150, fontSize: 13 }}>
            <option value="">All Domains</option>
            {DOMAINS.filter(d => d !== 'All Domains').map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-sm"><Search size={13} /> Search</button>
        </form>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t === 'All' ? '' : t)} style={{
              padding: '3px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
              fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em',
              background: typeFilter === (t === 'All' ? '' : t) ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.04)',
              color: typeFilter === (t === 'All' ? '' : t) ? 'var(--accent-bright)' : 'var(--text-muted)',
              border: `1px solid ${typeFilter === (t === 'All' ? '' : t) ? 'rgba(79,142,247,0.3)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              {t === 'All' ? 'All Types' : typeLabels[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
          </div>
        ) : internships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Briefcase size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>No internships found</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Try a different search or clear filters</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Showing {internships.length} internship{internships.length !== 1 ? 's' : ''} · Click any card to expand details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {internships.map(i => <InternshipCard key={i.id} i={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

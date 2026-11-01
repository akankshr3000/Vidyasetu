import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter, Award, Calendar, ExternalLink, ChevronDown, X } from 'lucide-react'

const STATES = ['All India', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Odisha', 'Himachal Pradesh', 'North East India']
const LEVELS = ['All Levels', 'Class 9-10', 'Class 11 and above', 'UG', 'PG', 'PhD', 'Diploma', 'ITI']
const CATEGORIES = ['All', 'Central Government', 'State Government', 'Private/Corporate', 'Research', 'Science', 'Minority']

const catColors = {
  'Central Government': '#4f8ef7',
  'State Government': '#10b981',
  'Private/Corporate': '#f59e0b',
  'Research': '#8b5cf6',
  'Science': '#06b6d4',
  'Minority': '#ec4899',
}

function ScholarshipCard({ s }) {
  const [expanded, setExpanded] = useState(false)
  const color = Object.entries(catColors).find(([k]) => s.category?.includes(k.split(' ')[0]))?.[1] || '#4f8ef7'

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
                {s.category?.split(' - ')[0] || 'Scholarship'}
              </span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {s.states || 'All India'}
              </span>
              {s.level && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {s.level}
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.provider}</div>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Key info pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13 }}>💰</span>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{s.amount?.split('\n')[0]?.substring(0, 50)}</span>
          </div>
          {s.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--gold-light)' }}>{s.deadline?.substring(0, 40)}</span>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Eligibility</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.eligibility}</div>
            </div>
            {s.documents && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Required Documents</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.documents}</div>
              </div>
            )}
            {s.apply_link && (
              <a href={s.apply_link} target="_blank" rel="noopener noreferrer"
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

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (stateFilter && stateFilter !== 'All India') params.state = stateFilter
      if (levelFilter && levelFilter !== 'All Levels') params.level = levelFilter
      if (search) params.search = search
      const { data } = await axios.get('/api/scholarships', { params })
      setScholarships(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [stateFilter, levelFilter, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setStateFilter(''); setLevelFilter(''); setCatFilter(''); setSearch(''); setSearchInput('')
  }

  const filtered = catFilter && catFilter !== 'All'
    ? scholarships.filter(s => s.category?.toLowerCase().includes(catFilter.toLowerCase()))
    : scholarships

  const hasFilters = stateFilter || levelFilter || catFilter || search

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Award size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Scholarships</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{scholarships.length} scholarships across India</div>
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
              placeholder="Search by name, category, or keyword..."
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>
          <select className="input" value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{ width: 160, fontSize: 13 }}>
            <option value="">All States</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ width: 150, fontSize: 13 }}>
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-sm"><Search size={13} /> Search</button>
        </form>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c === 'All' ? '' : c)} style={{
              padding: '3px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
              fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em',
              background: catFilter === (c === 'All' ? '' : c) ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.04)',
              color: catFilter === (c === 'All' ? '' : c) ? 'var(--accent-bright)' : 'var(--text-muted)',
              border: `1px solid ${catFilter === (c === 'All' ? '' : c) ? 'rgba(79,142,247,0.3)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Award size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>No scholarships found</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Try a different search or clear filters</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Showing {filtered.length} scholarship{filtered.length !== 1 ? 's' : ''} · Click any card to expand details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {filtered.map(s => <ScholarshipCard key={s.id} s={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

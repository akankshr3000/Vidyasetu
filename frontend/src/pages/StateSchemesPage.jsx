import React, { useState, useEffect } from 'react'
import { getStateSchemes, getStateSchemeLiveUpdate } from '../services/api'
import { Search, Landmark, Calendar, ExternalLink, ChevronDown, X, RefreshCw } from 'lucide-react'

const STATES = [
  'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
  'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Gujarat', 'Punjab',
  'Himachal Pradesh', 'Odisha', 'Uttar Pradesh', 'Bihar'
]

function SchemeCard({ s }) {
  const [expanded, setExpanded] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState(null)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const color = '#10b981'

  const fetchLiveUpdate = async (e) => {
    e.stopPropagation()
    setLoadingUpdate(true)
    try {
      const data = await getStateSchemeLiveUpdate(s.id)
      setLiveUpdates(data.updates || [])
    } catch (err) { console.error(err) }
    setLoadingUpdate(false)
  }

  return (
    <div style={{
      background: 'rgba(17,24,39,0.75)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    onClick={() => setExpanded(!expanded)}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                {s.category || 'Scheme'}
              </span>
              {s.department && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {s.department}
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>📍 {s.state}</div>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Key info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {s.benefit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>💰</span>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{s.benefit?.substring(0, 60)}{s.benefit?.length > 60 ? '...' : ''}</span>
            </div>
          )}
          {s.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} color="var(--gold)" />
              <span style={{ fontSize: 12, color: 'var(--gold-light)' }}>{s.deadline?.substring(0, 50)}</span>
            </div>
          )}
        </div>

        {/* Expanded */}
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
            {s.eligibility && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Eligibility</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.eligibility}</div>
              </div>
            )}
            {s.benefit && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Benefit</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.benefit}</div>
              </div>
            )}
            {s.documents && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Required Documents</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.documents}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {s.apply_link && (
                <a href={s.apply_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}28` }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}18` }}
                ><ExternalLink size={12} /> Apply Now</a>
              )}
              <button onClick={fetchLiveUpdate} disabled={loadingUpdate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(79,142,247,0.12)', color: 'var(--accent-bright)', border: '1px solid rgba(79,142,247,0.25)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              ><RefreshCw size={12} className={loadingUpdate ? 'spin' : ''} /> {loadingUpdate ? 'Checking...' : 'Check latest updates'}</button>
            </div>

            {/* Live updates */}
            {liveUpdates && liveUpdates.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(79,142,247,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79,142,247,0.15)' }}>
                <div style={{ fontSize: 11, color: 'var(--accent-bright)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Latest Updates</div>
                {liveUpdates.map((u, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <a href={u.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      style={{ fontSize: 12, color: 'var(--accent-bright)', textDecoration: 'underline' }}>{u.title}</a>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{u.snippet?.substring(0, 150)}...</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function StateSchemesPage() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    if (!selectedState && !search) { setSchemes([]); return }
    setLoading(true)
    try {
      const params = {}
      if (selectedState) params.state = selectedState
      if (search) params.search = search
      const data = await getStateSchemes(params)
      setSchemes(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedState, search])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Landmark size={18} color="#10b981" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>State Government Schemes</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedState ? `${schemes.length} schemes in ${selectedState}` : 'Select a state to browse schemes'}</div>
        </div>
        {(selectedState || search) && (
          <button onClick={() => { setSelectedState(''); setSearch(''); setSearchInput('') }} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* State selector + search */}
      <div style={{ padding: '16px 24px', background: 'rgba(13,18,32,0.6)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="input" value={selectedState} onChange={e => setSelectedState(e.target.value)}
            style={{ width: 220, fontSize: 13, background: selectedState ? 'rgba(16,185,129,0.08)' : 'rgba(13,18,32,0.8)', borderColor: selectedState ? 'rgba(16,185,129,0.3)' : 'var(--border)' }}>
            <option value="">— Select State —</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
              placeholder="Search schemes by name, category..." style={{ paddingLeft: 34, fontSize: 13 }} />
          </div>
          <button onClick={() => setSearch(searchInput)} className="btn btn-primary btn-sm"><Search size={13} /> Search</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {!selectedState && !search ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={32} color="#10b981" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>State Government Schemes</div>
            <div style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>Select your state from the dropdown above to browse education welfare schemes available in your region.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
              {STATES.map(s => (
                <button key={s} onClick={() => setSelectedState(s)} style={{
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >{s}</button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
          </div>
        ) : schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Landmark size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>No schemes found</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Try selecting a different state</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Showing {schemes.length} scheme{schemes.length !== 1 ? 's' : ''} · Click to expand</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {schemes.map(s => <SchemeCard key={s.id} s={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

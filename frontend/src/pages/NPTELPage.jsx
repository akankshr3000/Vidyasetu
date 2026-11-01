import React, { useState } from 'react'
import { getNPTELCourses } from '../services/api'
import { Search, BookOpen, ExternalLink, Globe } from 'lucide-react'

const DOMAINS = [
  { label: 'Computer Science', query: 'computer science programming' },
  { label: 'Electronics', query: 'electronics communication' },
  { label: 'Mathematics', query: 'mathematics statistics' },
  { label: 'Data Science', query: 'data science machine learning' },
  { label: 'Mechanical', query: 'mechanical engineering' },
  { label: 'Civil', query: 'civil engineering' },
  { label: 'Management', query: 'management MBA' },
  { label: 'Physics', query: 'physics' },
  { label: 'Chemistry', query: 'chemistry' },
  { label: 'Humanities', query: 'humanities social science' },
]

function CourseCard({ course }) {
  return (
    <div style={{
      background: 'rgba(17,24,39,0.75)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 3, background: 'linear-gradient(90deg, #10b981, #10b98144)' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
            {course.source || 'NPTEL'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>{course.title}</div>
        {course.snippet && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.snippet}</div>
        )}
        <a href={course.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.22)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)' }}
        >
          <ExternalLink size={12} /> View Course
        </a>
      </div>
    </div>
  )
}

export default function NPTELPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [error, setError] = useState('')

  const fetchCourses = async (query) => {
    if (!query.trim()) return
    setLoading(true); setError(''); setActiveQuery(query)
    try {
      const data = await getNPTELCourses(query)
      if (data.error) { setError(data.error); setCourses([]) }
      else { setCourses(data.results || []) }
    } catch (e) { setError('Failed to fetch courses.'); setCourses([]) }
    setLoading(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <BookOpen size={18} color="#10b981" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>NPTEL Courses</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Search & discover courses from IITs & IISc</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live search</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 24px', background: 'rgba(13,18,32,0.6)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <form onSubmit={e => { e.preventDefault(); fetchCourses(searchInput) }} style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search courses e.g. Machine Learning, Data Structures..." style={{ paddingLeft: 34, fontSize: 13 }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            <Search size={13} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {DOMAINS.map(d => (
            <button key={d.label} onClick={() => { setSearchInput(d.query); fetchCourses(d.query) }} style={{
              padding: '4px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11,
              fontFamily: 'var(--font-display)', fontWeight: 600,
              background: activeQuery === d.query ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
              color: activeQuery === d.query ? '#10b981' : 'var(--text-muted)',
              border: `1px solid ${activeQuery === d.query ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>{d.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {!activeQuery && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={32} color="#10b981" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Explore NPTEL Courses</div>
            <div style={{ fontSize: 13, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>Search for any subject or click a domain pill above to discover courses from IITs, IISc on NPTEL & SWAYAM.</div>
          </div>
        ) : loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--red)' }}>
            <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Search Error</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</div>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <BookOpen size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>No courses found</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Try a different search term</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Found {courses.length} result{courses.length !== 1 ? 's' : ''} for "{activeQuery}"</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {courses.map((c, idx) => <CourseCard key={idx} course={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

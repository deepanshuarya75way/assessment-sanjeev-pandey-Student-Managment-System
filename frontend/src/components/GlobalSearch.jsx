import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as searchService from '../services/searchService';

const GlobalSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const canViewStudents = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // Flatten items for keyboard navigation
  const allResults = [];
  if (results) {
    if (canViewStudents && results.students?.length) {
      results.students.forEach((s) => allResults.push({ ...s, type: 'student' }));
    }
    if (results.teachers?.length) {
      results.teachers.forEach((t) => allResults.push({ ...t, type: 'teacher' }));
    }
    if (results.courses?.length) {
      results.courses.forEach((c) => allResults.push({ ...c, type: 'course' }));
    }
    if (results.subjects?.length) {
      results.subjects.forEach((sub) => allResults.push({ ...sub, type: 'subject' }));
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchService.globalSearch(query);
        setResults(res.results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (link) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    navigate(link);
  };

  const handleInputKeyDown = (e) => {
    if (!isOpen || allResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        handleSelect(allResults[selectedIndex].link);
      } else if (allResults.length > 0) {
        handleSelect(allResults[0].link);
      }
    }
  };

  const totalResults = allResults.length;

  return (
    <div className="global-search-container" ref={containerRef}>
      <div className="global-search-input-wrapper">
        <span className="global-search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="global-search-input"
          placeholder="Search students, faculty, courses... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
        />
        {query && (
          <button
            type="button"
            className="global-search-clear"
            onClick={() => {
              setQuery('');
              setResults(null);
              setSelectedIndex(-1);
            }}
            title="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <kbd className="global-search-kbd">Ctrl K</kbd>
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="global-search-dropdown">
          {loading && (
            <div className="global-search-loading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Searching across catalog...</span>
            </div>
          )}

          {!loading && totalResults === 0 && (
            <div className="global-search-empty">
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>No records found</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No matches for &ldquo;{query}&rdquo;. Try another name or keyword.
              </p>
            </div>
          )}

          {!loading && totalResults > 0 && results && (
            <div className="global-search-results">
              {/* Students Section */}
              {canViewStudents && results.students?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <span>Students</span>
                    <span className="count-badge">{results.students.length}</span>
                  </div>
                  {results.students.map((item) => {
                    const itemGlobalIdx = allResults.findIndex((r) => r.id === item.id);
                    const isSelected = selectedIndex === itemGlobalIdx;
                    return (
                      <div
                        key={item.id}
                        className={`search-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item.link)}
                        style={isSelected ? { backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--primary)' } : {}}
                      >
                        <div className="search-item-avatar student-avatar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                          </svg>
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-title">{item.title}</div>
                          <div className="search-item-subtitle">{item.subtitle}</div>
                        </div>
                        <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Faculty Section */}
              {results.teachers?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <span>Faculty</span>
                    <span className="count-badge">{results.teachers.length}</span>
                  </div>
                  {results.teachers.map((item) => {
                    const itemGlobalIdx = allResults.findIndex((r) => r.id === item.id);
                    const isSelected = selectedIndex === itemGlobalIdx;
                    return (
                      <div
                        key={item.id}
                        className={`search-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item.link)}
                        style={isSelected ? { backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--purple)' } : {}}
                      >
                        <div className="search-item-avatar teacher-avatar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-title">{item.title}</div>
                          <div className="search-item-subtitle">{item.subtitle}</div>
                        </div>
                        <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Courses Section */}
              {results.courses?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <span>Degree Programs</span>
                    <span className="count-badge">{results.courses.length}</span>
                  </div>
                  {results.courses.map((item) => {
                    const itemGlobalIdx = allResults.findIndex((r) => r.id === item.id);
                    const isSelected = selectedIndex === itemGlobalIdx;
                    return (
                      <div
                        key={item.id}
                        className={`search-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item.link)}
                        style={isSelected ? { backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--success)' } : {}}
                      >
                        <div className="search-item-avatar course-avatar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                            <path d="M6 6h10" />
                            <path d="M6 10h10" />
                          </svg>
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-title">{item.title}</div>
                          <div className="search-item-subtitle">{item.subtitle}</div>
                        </div>
                        <span className="badge badge-info">{item.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subjects Section */}
              {results.subjects?.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">
                    <span>Curriculum Subjects</span>
                    <span className="count-badge">{results.subjects.length}</span>
                  </div>
                  {results.subjects.map((item) => {
                    const itemGlobalIdx = allResults.findIndex((r) => r.id === item.id);
                    const isSelected = selectedIndex === itemGlobalIdx;
                    return (
                      <div
                        key={item.id}
                        className={`search-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item.link)}
                        style={isSelected ? { backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--warning)' } : {}}
                      >
                        <div className="search-item-avatar subject-avatar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-title">{item.title}</div>
                          <div className="search-item-subtitle">{item.subtitle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="search-footer-hint">
                <span>Navigate <kbd style={{ padding: '1px 4px', fontSize: '10px' }}>&uarr;&darr;</kbd></span>
                <span>Select <kbd style={{ padding: '1px 4px', fontSize: '10px' }}>&crarr;</kbd></span>
                <span>Close <kbd style={{ padding: '1px 4px', fontSize: '10px' }}>Esc</kbd></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

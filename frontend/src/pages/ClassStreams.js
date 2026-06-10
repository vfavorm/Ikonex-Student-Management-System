import React, { useState, useEffect } from 'react';
import { createClassStream, getAllClassStreams, deleteClassStream, updateClassStream } from '../services/classStreamService';
import { getAllStudents } from '../services/studentService';
import { getAllSubjects } from '../services/subjectService';

const STREAM_ICONS = ['group', 'science', 'menu_book', 'history_edu', 'calculate', 'biotech', 'language', 'palette'];

function ClassStreams() {
  const [streams, setStreams]               = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [students, setStudents]             = useState([]);
  const [subjects, setSubjects]             = useState([]);
  const [name, setName]                     = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [editName, setEditName]             = useState('');
  const [viewingStream, setViewingStream]   = useState(null);
  const [streamStats, setStreamStats]       = useState({ students: 0, subjects: 0 });
  const [openMenuId, setOpenMenuId]         = useState(null);
  const [menuPosition, setMenuPosition]     = useState({ top: 0, left: 0 });
  const [editingStream, setEditingStream]   = useState(null);
  const [deletingStream, setDeletingStream] = useState(null);

  useEffect(() => {
    fetchStreams();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    try { const r = await getAllStudents(); setStudents(r.data); } catch { /* silent */ }
  };

  const fetchSubjects = async () => {
    try { const r = await getAllSubjects(); setSubjects(r.data); } catch { /* silent */ }
  };

  const getStreamStats = (streamId) => ({
    students: students.filter(s => s.class_stream_id === streamId).length,
    subjects: subjects.length,
  });

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [openMenuId]);

  useEffect(() => {
    setFilteredStreams(streams.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, streams]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const r = await getAllClassStreams();
      setStreams(r.data);
      setFilteredStreams(r.data);
    } catch { setError('Failed to fetch class streams'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      await createClassStream(name);
      setSuccess('Class stream created successfully');
      setName('');
      fetchStreams();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create class stream'); }
  };

  const handleView = (stream) => {
    setViewingStream(stream);
    setStreamStats(getStreamStats(stream.id));
    setOpenMenuId(null);
  };

  const handleOpenEdit = (stream) => { setEditingStream(stream); setEditName(stream.name); setOpenMenuId(null); };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      setError(''); setSuccess('');
      await updateClassStream(editingStream.id, editName);
      setSuccess('Class stream updated successfully');
      setEditingStream(null);
      fetchStreams();
    } catch (err) { setError(err.response?.data?.error || 'Failed to update class stream'); }
  };

  const handleOpenDelete = (stream) => { setDeletingStream(stream); setOpenMenuId(null); };

  const handleConfirmDelete = async () => {
    try {
      await deleteClassStream(deletingStream.id);
      setSuccess('Class stream deleted successfully');
      setDeletingStream(null);
      fetchStreams();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete class stream'); }
  };

  const openMenu = (e, streamId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuH = 130, menuW = 148;
    const margin = 8;

    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate vertical position
    let top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= menuH + margin) {
      // Enough space below
      top = rect.bottom + window.scrollY + 4;
    } else if (spaceAbove >= menuH + margin) {
      // Enough space above
      top = rect.top + window.scrollY - menuH - 4;
    } else {
      // Not enough space either way - position it to be fully visible
      // Calculate where the menu would end if positioned below
      const menuBottomIfBelow = rect.bottom + menuH;
      
      if (menuBottomIfBelow > viewportHeight) {
        // Would go off bottom - anchor to bottom of viewport
        top = viewportHeight - menuH - margin + window.scrollY;
      } else {
        // Position below
        top = rect.bottom + window.scrollY + 4;
      }
    }

    // Calculate horizontal position - right-align with button
    let left = rect.right - menuW;
    
    // Ensure menu stays within horizontal viewport bounds
    if (left < margin) {
      left = margin;
    } else if (left + menuW > viewportWidth - margin) {
      left = viewportWidth - menuW - margin;
    }

    setMenuPosition({ top, left });
    setOpenMenuId(openMenuId === streamId ? null : streamId);
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h2>Class Streams</h2>
          <p>Manage and organize student cohorts</p>
        </div>
      </div>

      {/* ── Card 1: Create Stream ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            add_circle
          </span>
          <h2 style={{ marginBottom: 0 }}>Create Stream</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          Add a new class stream to group students into cohorts.
        </p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
            <label>Stream Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Form 1A"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, height: '48px' }}>
            <span className="material-symbols-outlined">add</span>
            Create Stream
          </button>
        </form>
      </div>

      {/* ── Card 2: Existing Streams ── */}
      <div className="card">
        {/* Header row with count badge + search */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ marginBottom: 0 }}>All Streams</h2>
              {/* Live count badge — mirrors the "Active Now" stat card inline */}
              <span style={{
                background: 'var(--tertiary-container)',
                color: 'var(--on-tertiary-container)',
                fontSize: 'var(--fs-label)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {filteredStreams.length} active
              </span>
            </div>

            {/* Inline search */}
            <div className="search-wrap" style={{ width: 'auto', flex: '1 1 200px', maxWidth: '320px' }}>
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search streams..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stream cards grid — same responsive pattern as Home's stats-grid */}
        {loading ? (
          <div className="loading">Loading streams…</div>
        ) : filteredStreams.length === 0 ? (
          <div className="loading">{searchTerm ? 'No streams match your search.' : 'No streams yet — create one above.'}</div>
        ) : (
          <div className="stream-cards">
            {filteredStreams.map((stream, idx) => {
              const icon = STREAM_ICONS[idx % STREAM_ICONS.length];
              return (
                <div className="stream-card" key={stream.id}>
                  {/* Top */}
                  <div className="stream-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="stream-card-icon">
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <span className="stream-card-name">{stream.name}</span>
                    </div>
                    <button className="btn-menu" onClick={e => openMenu(e, stream.id)} aria-label="Stream actions">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>

                  {/* Bottom */}
                  <div className="stream-card-bottom">
                    <div>
                      <div className="stream-card-meta-label">Created</div>
                      <div className="stream-card-meta-value">
                        {new Date(stream.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="dot-indicators">
                      {[0,1,2].map(i => <div key={i} className={`dot ${i < 2 ? 'dot-active' : 'dot-muted'}`} />)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating action menu ── */}
      {openMenuId && (
        <div
          className="action-menu"
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left }}
          onClick={e => e.stopPropagation()}
        >
          <button className="action-menu-item" onClick={() => handleView(filteredStreams.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>View
          </button>
          <button className="action-menu-item" onClick={() => handleOpenEdit(filteredStreams.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Edit
          </button>
          <button className="action-menu-item danger" onClick={() => handleOpenDelete(filteredStreams.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>Delete
          </button>
        </div>
      )}

      {/* ── View modal ── */}
      {viewingStream && (
        <div className="modal-overlay" onClick={() => setViewingStream(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Class Stream Details</h2>
              <button className="btn-icon" onClick={() => setViewingStream(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 'var(--fs-body-lg)' }}>{viewingStream.name}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Created</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{new Date(viewingStream.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                padding: 16, background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
              }}>
                {[{ label: 'Students', value: streamStats.students }, { label: 'Subjects', value: streamStats.subjects }].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div className="stream-card-meta-label" style={{ marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-fixed-dim)', letterSpacing: '-0.02em' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingStream && (
        <div className="modal-overlay" onClick={() => setEditingStream(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Class Stream</h2>
              <button className="btn-icon" onClick={() => setEditingStream(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="form-group">
              <label>Stream Name</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g., Form 1A" autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingStream(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deletingStream && (
        <div className="modal-overlay" onClick={() => setDeletingStream(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Class Stream</h2>
            </div>
            <p style={{ color: 'var(--on-surface)', marginBottom: 8 }}>
              Are you sure you want to delete <strong>{deletingStream.name}</strong>?
            </p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)' }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingStream(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClassStreams;
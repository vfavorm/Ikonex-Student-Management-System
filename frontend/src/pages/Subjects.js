import React, { useState, useEffect } from 'react';
import { createSubject, getAllSubjects, deleteSubject, assignSubject, removeSubject, updateSubject, getStreamsBySubject } from '../services/subjectService';
import { getAllClassStreams } from '../services/classStreamService';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [assignData, setAssignData] = useState({ classStreamIds: [], subjectId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSubject, setViewingSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editData, setEditData] = useState({});
  const [editStreamIds, setEditStreamIds] = useState([]);
  const [originalStreamIds, setOriginalStreamIds] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchClassStreams();
  }, []);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [openMenuId]);

  useEffect(() => {
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      setSubjects(response.data);
      setFilteredSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStreams = async () => {
    try {
      const response = await getAllClassStreams();
      setClassStreams(response.data);
    } catch (err) {
      console.error('Failed to fetch class streams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      await createSubject(formData.name, formData.code);
      setSuccess('Subject created successfully');
      setFormData({ name: '', code: '' });
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subject');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      
      const assignmentPromises = assignData.classStreamIds.map(classStreamId =>
        assignSubject(classStreamId, assignData.subjectId)
      );
      
      await Promise.all(assignmentPromises);
      
      setSuccess(`Subject assigned to ${assignData.classStreamIds.length} class stream(s) successfully`);
      setAssignData({ classStreamIds: [], subjectId: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign subject');
    }
  };

  const handleView = (subject) => { setViewingSubject(subject); setOpenMenuId(null); };

  const handleOpenEdit = async (subject) => {
    setEditingSubject(subject);
    setEditData({ name: subject.name, code: subject.code });
    setOpenMenuId(null);
    // Fetch current stream assignments
    try {
      setLoadingStreams(true);
      const r = await getStreamsBySubject(subject.id);
      const ids = r.data.map(s => s.class_stream_id.toString());
      setEditStreamIds(ids);
      setOriginalStreamIds(ids);
    } catch {
      setEditStreamIds([]);
      setOriginalStreamIds([]);
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setError(''); setSuccess('');
      // Update subject name/code
      await updateSubject(editingSubject.id, editData.name, editData.code);

      // Sync stream assignments
      const toAssign = editStreamIds.filter(id => !originalStreamIds.includes(id));
      const toRemove = originalStreamIds.filter(id => !editStreamIds.includes(id));

      await Promise.all([
        ...toAssign.map(csId => assignSubject(csId, editingSubject.id)),
        ...toRemove.map(csId => removeSubject(csId, editingSubject.id)),
      ]);

      setSuccess('Subject updated successfully');
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update subject');
    }
  };

  const handleOpenDelete = (subject) => { setDeletingSubject(subject); setOpenMenuId(null); };

  const handleConfirmDelete = async () => {
    try {
      await deleteSubject(deletingSubject.id);
      setSuccess('Subject deleted successfully');
      setDeletingSubject(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subject');
    }
  };

  const openMenu = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuH = 130, menuW = 148;
    const margin = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Vertically align with the row (same level as the button)
    let top = rect.top + window.scrollY;
    // If menu would go off the bottom, shift it up
    if (rect.top + menuH > viewportHeight) {
      top = rect.bottom + window.scrollY - menuH;
    }

    // Position to the right of the button, outside the table
    let left = rect.right + margin;
    // If menu would go off the right edge, flip to the left side
    if (left + menuW > viewportWidth - margin) {
      left = rect.left - menuW - margin;
    }

    setMenuPosition({ top, left });
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h2>Subjects</h2>
          <p>Create, assign, and manage academic subjects</p>
        </div>
      </div>

      {/* ── Shared alerts ── */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Card 1: Create Subject ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            library_books
          </span>
          <h2 style={{ marginBottom: 0 }}>Create Subject</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          Add a new subject to the academic curriculum.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
            <label>Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Subject Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., MATH101"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, height: '48px' }}>
            <span className="material-symbols-outlined">add</span>
            Create Subject
          </button>
        </form>
      </div>

      {/* ── Card 3: All Subjects ── */}
      <div className="card">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ marginBottom: 0 }}>All Subjects</h2>
              <span style={{
                background: 'var(--tertiary-container)',
                color: 'var(--on-tertiary-container)',
                fontSize: 'var(--fs-label)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {filteredSubjects.length} subjects
              </span>
            </div>

            <div className="search-wrap" style={{ width: 'auto', flex: '1 1 200px', maxWidth: '320px' }}>
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading subjects…</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="loading">{searchTerm ? 'No subjects match your search.' : 'No subjects yet — create one above.'}</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Created At</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.name}</td>
                    <td>{subject.code}</td>
                    <td>{new Date(subject.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-menu" onClick={(e) => openMenu(e, subject.id)} aria-label="Subject actions">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* ── Card 2: Assign Subject to Streams ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            link
          </span>
          <h2 style={{ marginBottom: 0 }}>Assign Subject to Class Streams</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          Link a subject to one or more class streams.
        </p>

        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label>Subject</label>
            <select
              value={assignData.subjectId}
              onChange={(e) => setAssignData({...assignData, subjectId: e.target.value})}
              required
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Assign to Class Streams (Select one or more)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)'
            }}>
              {classStreams.map((stream) => (
                <label key={stream.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.15s',
                  backgroundColor: assignData.classStreamIds?.includes(stream.id.toString()) ? 'rgba(0, 224, 186, 0.08)' : 'transparent',
                  border: assignData.classStreamIds?.includes(stream.id.toString()) ? '1px solid var(--primary-fixed-dim)' : '1px solid transparent'
                }}>
                  <input
                    type="checkbox"
                    value={stream.id}
                    checked={assignData.classStreamIds?.includes(stream.id.toString()) || false}
                    onChange={(e) => {
                      const id = e.target.value;
                      setAssignData({
                        ...assignData,
                        classStreamIds: e.target.checked
                          ? [...(assignData.classStreamIds || []), id]
                          : (assignData.classStreamIds || []).filter(cid => cid !== id)
                      });
                    }}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: 'var(--fs-body-md)', fontWeight: '500' }}>{stream.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!assignData.subjectId || !assignData.classStreamIds?.length}
          >
            <span className="material-symbols-outlined">link</span>
            Assign Subject to Selected Streams
          </button>
        </form>
      </div>


      {/* ── Floating action menu ── */}
      {openMenuId && (
        <div
          className="action-menu"
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="action-menu-item" onClick={() => handleView(filteredSubjects.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>View
          </button>
          <button className="action-menu-item" onClick={() => handleOpenEdit(filteredSubjects.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Edit
          </button>
          <button className="action-menu-item danger" onClick={() => handleOpenDelete(filteredSubjects.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>Delete
          </button>
        </div>
      )}

      {/* ── View modal ── */}
      {viewingSubject && (
        <div className="modal-overlay" onClick={() => setViewingSubject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Subject Details</h2>
              <button className="btn-icon" onClick={() => setViewingSubject(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 'var(--fs-body-lg)' }}>{viewingSubject.name}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Code</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{viewingSubject.code}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Created</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{new Date(viewingSubject.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingSubject && (
        <div className="modal-overlay" onClick={() => setEditingSubject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Subject</h2>
              <button className="btn-icon" onClick={() => setEditingSubject(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Subject Code</label>
              <input
                type="text"
                value={editData.code}
                onChange={(e) => setEditData({...editData, code: e.target.value})}
              />
            </div>

            {/* ── Stream assignments ── */}
            <div className="form-group">
              <label>Assigned Class Streams</label>
              {loadingStreams ? (
                <div className="loading" style={{ padding: '12px' }}>Loading streams…</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  padding: '12px',
                  background: 'var(--surface-container)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--outline-variant)',
                }}>
                  {classStreams.map((stream) => (
                    <label key={stream.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.15s',
                      backgroundColor: editStreamIds.includes(stream.id.toString()) ? 'rgba(0, 224, 186, 0.08)' : 'transparent',
                      border: editStreamIds.includes(stream.id.toString()) ? '1px solid var(--primary-fixed-dim)' : '1px solid transparent',
                    }}>
                      <input
                        type="checkbox"
                        checked={editStreamIds.includes(stream.id.toString())}
                        onChange={(e) => {
                          const id = stream.id.toString();
                          setEditStreamIds(
                            e.target.checked
                              ? [...editStreamIds, id]
                              : editStreamIds.filter(sid => sid !== id)
                          );
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: 'var(--fs-body-md)', fontWeight: 500 }}>{stream.name}</span>
                    </label>
                  ))}
                  {classStreams.length === 0 && (
                    <div style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', padding: '4px' }}>No class streams available.</div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingSubject(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deletingSubject && (
        <div className="modal-overlay" onClick={() => setDeletingSubject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Subject</h2>
            </div>
            <p style={{ color: 'var(--on-surface)', marginBottom: 8 }}>
              Are you sure you want to delete <strong>{deletingSubject.name}</strong> ({deletingSubject.code})?
            </p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)' }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingSubject(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Subjects;

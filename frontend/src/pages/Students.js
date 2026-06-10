import React, { useState, useEffect } from 'react';
import { registerStudent, getAllStudents, deleteStudent, updateStudent } from '../services/studentService';
import { getAllClassStreams } from '../services/classStreamService';

function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classStreams, setClassStreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: '',
    classStreamId: '',
    dateOfBirth: ''
  });
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editData, setEditData] = useState({});
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClassStreams();
  }, []);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [openMenuId]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
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
      await registerStudent(
        formData.name,
        formData.admissionNumber,
        formData.classStreamId,
        formData.dateOfBirth
      );
      setSuccess('Student registered successfully');
      setFormData({ name: '', admissionNumber: '', classStreamId: '', dateOfBirth: '' });
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register student');
    }
  };

  const handleView = (student) => { setViewingStudent(student); setOpenMenuId(null); };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditData({
      name: student.name,
      admissionNumber: student.admission_number,
      classStreamId: student.class_stream_id,
      dateOfBirth: student.date_of_birth ? student.date_of_birth.split('T')[0] : ''
    });
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    try {
      setError(''); setSuccess('');
      await updateStudent(editingStudent.id, editData.name, editData.admissionNumber, editData.classStreamId, editData.dateOfBirth);
      setSuccess('Student updated successfully');
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update student');
    }
  };

  const handleOpenDelete = (student) => { setDeletingStudent(student); setOpenMenuId(null); };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent(deletingStudent.id);
      setSuccess('Student deleted successfully');
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete student');
    }
  };

  const getStreamName = (streamId) => {
    const stream = classStreams.find(s => s.id === streamId);
    return stream ? stream.name : streamId;
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
          <h2>Students</h2>
          <p>Register and manage student records</p>
        </div>
      </div>

      {/* ── Card 1: Register Student ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            person_add
          </span>
          <h2 style={{ marginBottom: 0 }}>Register Student</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          Add a new student to the school system with class assignment.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
            <label>Student Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., John Doe"
              required
            />
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Admission Number</label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
              placeholder="e.g., ADM001"
              required
            />
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Class Stream</label>
            <select
              value={formData.classStreamId}
              onChange={(e) => setFormData({...formData, classStreamId: e.target.value})}
              required
            >
              <option value="">Select class stream</option>
              {classStreams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
            <label>Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, height: '48px' }}>
            <span className="material-symbols-outlined">person_add</span>
            Register Student
          </button>
        </form>
      </div>

      {/* ── Card 2: All Students ── */}
      <div className="card">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ marginBottom: 0 }}>All Students</h2>
              <span style={{
                background: 'var(--tertiary-container)',
                color: 'var(--on-tertiary-container)',
                fontSize: 'var(--fs-label)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {filteredStudents.length} students
              </span>
            </div>

            <div className="search-wrap" style={{ width: 'auto', flex: '1 1 200px', maxWidth: '320px' }}>
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading students…</div>
        ) : filteredStudents.length === 0 ? (
          <div className="loading">{searchTerm ? 'No students match your search.' : 'No students yet — register one above.'}</div>
        ) : (
          <div className="table-wrapper" style={{ position: 'relative' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Admission No.</th>
                  <th>Class Stream</th>
                  <th>Date of Birth</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.admission_number}</td>
                    <td>{getStreamName(student.class_stream_id)}</td>
                    <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-menu" onClick={(e) => openMenu(e, student.id)} aria-label="Student actions">
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

      {/* ── Floating action menu ── */}
      {openMenuId && (
        <div
          className="action-menu"
          style={{ position: 'absolute', top: menuPosition.top, left: menuPosition.left, zIndex: 1000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="action-menu-item" onClick={() => handleView(filteredStudents.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>View
          </button>
          <button className="action-menu-item" onClick={() => handleOpenEdit(filteredStudents.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Edit
          </button>
          <button className="action-menu-item danger" onClick={() => handleOpenDelete(filteredStudents.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>Delete
          </button>
        </div>
      )}

      {/* ── View modal ── */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="btn-icon" onClick={() => setViewingStudent(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Name</div>
                <div style={{ fontSize: 'var(--fs-body-lg)' }}>{viewingStudent.name}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Admission Number</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{viewingStudent.admission_number}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Class Stream</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{getStreamName(viewingStudent.class_stream_id)}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Date of Birth</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>
                  {viewingStudent.date_of_birth ? new Date(viewingStudent.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Registered</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{new Date(viewingStudent.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="btn-icon" onClick={() => setEditingStudent(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Admission Number</label>
              <input
                type="text"
                value={editData.admissionNumber}
                onChange={(e) => setEditData({...editData, admissionNumber: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Class Stream</label>
              <select
                value={editData.classStreamId}
                onChange={(e) => setEditData({...editData, classStreamId: e.target.value})}
              >
                {classStreams.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={editData.dateOfBirth}
                onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deletingStudent && (
        <div className="modal-overlay" onClick={() => setDeletingStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Student</h2>
            </div>
            <p style={{ color: 'var(--on-surface)', marginBottom: 8 }}>
              Are you sure you want to delete <strong>{deletingStudent.name}</strong> ({deletingStudent.admission_number})?
            </p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)' }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingStudent(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Students;

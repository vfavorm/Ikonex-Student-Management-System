import React, { useState, useEffect } from 'react';
import { recordScore, getAllScores, updateScore, deleteScore } from '../services/scoreService';
import { getAllStudents } from '../services/studentService';
import { getAllSubjects } from '../services/subjectService';

function Scores() {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    examScore: ''
  });
  const [caEntries, setCaEntries] = useState([{ label: 'CAT 1', score: '' }]);
  const [viewingScore, setViewingScore] = useState(null);
  const [editingScore, setEditingScore] = useState(null);
  const [editData, setEditData] = useState({});
  const [editCaEntries, setEditCaEntries] = useState([]);
  const [deletingScore, setDeletingScore] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchScores();
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [openMenuId]);

  useEffect(() => {
    const filtered = scores.filter(score => {
      const student = students.find(s => s.id === score.student_id);
      const subject = subjects.find(sub => sub.id === score.subject_id);
      const studentName = student ? student.name.toLowerCase() : '';
      const subjectName = subject ? subject.name.toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      return studentName.includes(search) || subjectName.includes(search);
    });
    setFilteredScores(filtered);
  }, [searchTerm, scores, students, subjects]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await getAllScores();
      setScores(response.data);
      setFilteredScores(response.data);
    } catch (err) {
      setError('Failed to fetch scores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try { const r = await getAllStudents(); setStudents(r.data); } catch { /* silent */ }
  };

  const fetchSubjects = async () => {
    try { const r = await getAllSubjects(); setSubjects(r.data); } catch { /* silent */ }
  };

  /* ── CA entry helpers ── */
  const getCaTotal = (entries) => entries.reduce((sum, e) => sum + (parseFloat(e.score) || 0), 0);

  const addCaEntry = () => {
    const nextNum = caEntries.length + 1;
    setCaEntries([...caEntries, { label: `CAT ${nextNum}`, score: '' }]);
  };

  const removeCaEntry = (idx) => {
    if (caEntries.length <= 1) return;
    setCaEntries(caEntries.filter((_, i) => i !== idx));
  };

  const updateCaEntry = (idx, field, value) => {
    setCaEntries(caEntries.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  /* ── Edit CA entry helpers ── */
  const addEditCaEntry = () => {
    const nextNum = editCaEntries.length + 1;
    setEditCaEntries([...editCaEntries, { label: `CAT ${nextNum}`, score: '' }]);
  };

  const removeEditCaEntry = (idx) => {
    if (editCaEntries.length <= 1) return;
    setEditCaEntries(editCaEntries.filter((_, i) => i !== idx));
  };

  const updateEditCaEntry = (idx, field, value) => {
    setEditCaEntries(editCaEntries.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const caTotal = getCaTotal(caEntries);
    if (caTotal > 100) {
      setError('Total Continuous Assessment cannot exceed 100');
      return;
    }
    try {
      setError(''); setSuccess('');
      await recordScore(
        formData.studentId,
        formData.subjectId,
        parseFloat(formData.examScore),
        caTotal
      );
      setSuccess('Score recorded successfully');
      setFormData({ studentId: '', subjectId: '', examScore: '' });
      setCaEntries([{ label: 'CAT 1', score: '' }]);
      fetchScores();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record score');
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : studentId;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  const handleView = (score) => { setViewingScore(score); setOpenMenuId(null); };

  const handleOpenEdit = (score) => {
    setEditingScore(score);
    setEditData({ examScore: score.exam_score });
    setEditCaEntries([{ label: 'Total CA', score: score.continuous_assessment }]);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    const caTotal = getCaTotal(editCaEntries);
    if (caTotal > 100) {
      setError('Total Continuous Assessment cannot exceed 100');
      return;
    }
    try {
      setError(''); setSuccess('');
      await updateScore(editingScore.id, parseFloat(editData.examScore), caTotal);
      setSuccess('Score updated successfully');
      setEditingScore(null);
      fetchScores();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update score');
    }
  };

  const handleOpenDelete = (score) => { setDeletingScore(score); setOpenMenuId(null); };

  const handleConfirmDelete = async () => {
    try {
      await deleteScore(deletingScore.id);
      setSuccess('Score deleted successfully');
      setDeletingScore(null);
      fetchScores();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete score');
    }
  };

  const openMenu = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuH = 130, menuW = 148;
    const margin = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= menuH + margin) {
      top = rect.bottom + window.scrollY + 4;
    } else if (spaceAbove >= menuH + margin) {
      top = rect.top + window.scrollY - menuH - 4;
    } else {
      top = viewportHeight - menuH - margin + window.scrollY;
    }

    let left = rect.right - menuW;
    if (left < margin) left = margin;
    else if (left + menuW > viewportWidth - margin) left = viewportWidth - menuW - margin;

    setMenuPosition({ top, left });
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const caTotal = getCaTotal(caEntries);
  const editCaTotal = getCaTotal(editCaEntries);

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h2>Scores</h2>
          <p>Record and manage student examination scores</p>
        </div>
      </div>

      {/* ── Card 1: Record Score ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            grading
          </span>
          <h2 style={{ marginBottom: 0 }}>Record Score</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '4px' }}>
          Enter student exam and continuous assessment scores.
        </p>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-label)', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
          Weighting: Final Exam 70% · Continuous Assessment 30%
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
              <label>Student</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.admission_number})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
              <label>Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                required
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
              <label>Final Exam Score (0–100)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.examScore}
                onChange={(e) => setFormData({...formData, examScore: e.target.value})}
                placeholder="0 – 100"
                required
              />
            </div>
          </div>

          {/* ── CA entries ── */}
          <div style={{
            background: 'var(--surface-container)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Continuous Assessment Entries
                </div>
                <div style={{ fontSize: 'var(--fs-label)', color: caTotal > 100 ? 'var(--error)' : 'var(--on-surface-variant)', marginTop: 4 }}>
                  Total: <strong style={{ color: caTotal > 100 ? 'var(--error)' : 'var(--primary-fixed-dim)' }}>{caTotal}</strong> / 100
                </div>
              </div>
              <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 'var(--fs-label)' }} onClick={addCaEntry}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add Entry
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {caEntries.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={entry.label}
                    onChange={(e) => updateCaEntry(idx, 'label', e.target.value)}
                    placeholder="Label"
                    style={{
                      flex: '1 1 140px',
                      background: 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      fontFamily: 'var(--font)',
                      fontSize: 'var(--fs-body-md)',
                      color: 'var(--on-surface)',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={entry.score}
                    onChange={(e) => updateCaEntry(idx, 'score', e.target.value)}
                    placeholder="Score"
                    required
                    style={{
                      flex: '0 0 100px',
                      background: 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      fontFamily: 'var(--font)',
                      fontSize: 'var(--fs-body-md)',
                      color: 'var(--on-surface)',
                      outline: 'none',
                    }}
                  />
                  {caEntries.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeCaEntry(idx)}
                      style={{ color: 'var(--error)', flexShrink: 0 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
            <span className="material-symbols-outlined">save</span>
            Record Score
          </button>
        </form>
      </div>

      {/* ── Card 2: All Scores ── */}
      <div className="card">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ marginBottom: 0 }}>All Scores</h2>
              <span style={{
                background: 'var(--tertiary-container)',
                color: 'var(--on-tertiary-container)',
                fontSize: 'var(--fs-label)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                {filteredScores.length} records
              </span>
            </div>

            <div className="search-wrap" style={{ width: 'auto', flex: '1 1 200px', maxWidth: '320px' }}>
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search by student or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading scores…</div>
        ) : filteredScores.length === 0 ? (
          <div className="loading">{searchTerm ? 'No scores match your search.' : 'No scores recorded yet.'}</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam (70%)</th>
                  <th>C.A. (30%)</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score) => (
                  <tr key={score.id}>
                    <td>{getStudentName(score.student_id)}</td>
                    <td>{getSubjectName(score.subject_id)}</td>
                    <td>{score.exam_score}</td>
                    <td>{score.continuous_assessment}</td>
                    <td><strong>{score.total_score}</strong></td>
                    <td><strong>{score.grade}</strong></td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-menu" onClick={(e) => openMenu(e, score.id)} aria-label="Score actions">
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
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="action-menu-item" onClick={() => handleView(filteredScores.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>View
          </button>
          <button className="action-menu-item" onClick={() => handleOpenEdit(filteredScores.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>Edit
          </button>
          <button className="action-menu-item danger" onClick={() => handleOpenDelete(filteredScores.find(s => s.id === openMenuId))}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>Delete
          </button>
        </div>
      )}

      {/* ── View modal ── */}
      {viewingScore && (
        <div className="modal-overlay" onClick={() => setViewingScore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Score Details</h2>
              <button className="btn-icon" onClick={() => setViewingScore(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Student</div>
                <div style={{ fontSize: 'var(--fs-body-lg)' }}>{getStudentName(viewingScore.student_id)}</div>
              </div>
              <div>
                <div className="stream-card-meta-label" style={{ marginBottom: 4 }}>Subject</div>
                <div style={{ fontSize: 'var(--fs-body-md)' }}>{getSubjectName(viewingScore.subject_id)}</div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                padding: 16, background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
              }}>
                {[
                  { label: 'Exam Score', value: viewingScore.exam_score },
                  { label: 'C.A. Score', value: viewingScore.continuous_assessment },
                  { label: 'Total Score', value: viewingScore.total_score },
                  { label: 'Grade', value: viewingScore.grade },
                ].map(({ label, value }) => (
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
      {editingScore && (
        <div className="modal-overlay" onClick={() => setEditingScore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Score</h2>
              <button className="btn-icon" onClick={() => setEditingScore(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--fs-label)', color: 'var(--on-surface-variant)' }}>Student: <strong style={{ color: 'var(--on-surface)' }}>{getStudentName(editingScore.student_id)}</strong></div>
              <div style={{ fontSize: 'var(--fs-label)', color: 'var(--on-surface-variant)', marginTop: '4px' }}>Subject: <strong style={{ color: 'var(--on-surface)' }}>{getSubjectName(editingScore.subject_id)}</strong></div>
            </div>

            <div className="form-group">
              <label>Final Exam Score (0–100)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editData.examScore}
                onChange={(e) => setEditData({...editData, examScore: e.target.value})}
                autoFocus
              />
            </div>

            {/* ── Edit CA entries ── */}
            <div style={{
              background: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: 'var(--fs-label)', fontWeight: 600, color: 'var(--on-surface-variant)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Continuous Assessment Entries
                  </div>
                  <div style={{ fontSize: 'var(--fs-label)', color: editCaTotal > 100 ? 'var(--error)' : 'var(--on-surface-variant)', marginTop: 4 }}>
                    Total: <strong style={{ color: editCaTotal > 100 ? 'var(--error)' : 'var(--primary-fixed-dim)' }}>{editCaTotal}</strong> / 100
                  </div>
                </div>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 'var(--fs-label)' }} onClick={addEditCaEntry}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Add Entry
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {editCaEntries.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(e) => updateEditCaEntry(idx, 'label', e.target.value)}
                      placeholder="Label"
                      style={{
                        flex: '1 1 140px',
                        background: 'var(--surface)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontFamily: 'var(--font)',
                        fontSize: 'var(--fs-body-md)',
                        color: 'var(--on-surface)',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={entry.score}
                      onChange={(e) => updateEditCaEntry(idx, 'score', e.target.value)}
                      placeholder="Score"
                      style={{
                        flex: '0 0 100px',
                        background: 'var(--surface)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontFamily: 'var(--font)',
                        fontSize: 'var(--fs-body-md)',
                        color: 'var(--on-surface)',
                        outline: 'none',
                      }}
                    />
                    {editCaEntries.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => removeEditCaEntry(idx)}
                        style={{ color: 'var(--error)', flexShrink: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingScore(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deletingScore && (
        <div className="modal-overlay" onClick={() => setDeletingScore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Score</h2>
            </div>
            <p style={{ color: 'var(--on-surface)', marginBottom: 8 }}>
              Are you sure you want to delete the score for <strong>{getStudentName(deletingScore.student_id)}</strong> in <strong>{getSubjectName(deletingScore.subject_id)}</strong>?
            </p>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)' }}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingScore(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Scores;

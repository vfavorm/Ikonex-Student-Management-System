import React, { useState, useEffect } from 'react';
import { getClassRanking, getStudentSummary, downloadStudentReport, downloadClassReport } from '../services/resultService';
import { getAllClassStreams } from '../services/classStreamService';
import { getAllStudents } from '../services/studentService';

function Results() {
  const [classStreams, setClassStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [ranking, setRanking] = useState([]);
  const [studentSummary, setStudentSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassStreams();
    fetchStudents();
  }, []);

  const fetchClassStreams = async () => {
    try { const r = await getAllClassStreams(); setClassStreams(r.data); } catch { /* silent */ }
  };

  const fetchStudents = async () => {
    try { const r = await getAllStudents(); setStudents(r.data); } catch { /* silent */ }
  };

  const handleViewRanking = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true); setError('');
      const response = await getClassRanking(selectedClass);
      setRanking(response.data);
    } catch (err) {
      setError('Failed to fetch class ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentSummary = async () => {
    if (!selectedStudent) return;
    try {
      setLoadingSummary(true); setError('');
      const response = await getStudentSummary(selectedStudent);
      setStudentSummary(response.data);
    } catch (err) {
      setError('Failed to fetch student summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownloadStudentReport = async () => {
    if (!selectedStudent) return;
    try { await downloadStudentReport(selectedStudent); } catch { setError('Failed to download student report'); }
  };

  const handleDownloadClassReport = async () => {
    if (!selectedClass) return;
    try { await downloadClassReport(selectedClass); } catch { setError('Failed to download class report'); }
  };

  const getStreamName = (streamId) => {
    const stream = classStreams.find(s => s.id === streamId);
    return stream ? stream.name : 'Unknown';
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h2>Results</h2>
          <p>View class rankings and student performance summaries</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Card 1: Class Ranking ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            leaderboard
          </span>
          <h2 style={{ marginBottom: 0 }}>Class Ranking</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          View student rankings within a class stream.
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
            <label>Select Class Stream</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select class</option>
              {classStreams.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button onClick={handleViewRanking} className="btn btn-primary" disabled={!selectedClass} style={{ height: '48px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
              View Ranking
            </button>
            <button
              onClick={handleDownloadClassReport}
              className="btn btn-secondary"
              disabled={!selectedClass || ranking.length === 0}
              style={{ height: '48px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading ranking…</div>
        ) : ranking.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Position</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th style={{ textAlign: 'right' }}>Total Marks</th>
                  <th style={{ textAlign: 'right' }}>Average</th>
                  <th style={{ textAlign: 'center' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((student) => (
                  <tr key={student.id}>
                    <td style={{ textAlign: 'center' }}>
                      <strong style={{ 
                        fontSize: '16px',
                        color: student.position === 1 ? '#fbbf24' : 
                               student.position === 2 ? '#94a3b8' : 
                               student.position === 3 ? '#fb923c' : 'inherit'
                      }}>
                        {student.position === 1 ? '🥇' : 
                         student.position === 2 ? '🥈' : 
                         student.position === 3 ? '🥉' : 
                         student.position}
                      </strong>
                    </td>
                    <td>{student.name}</td>
                    <td>{student.admission_number}</td>
                    <td style={{ textAlign: 'right' }}><strong>{student.total_marks || 'N/A'}</strong></td>
                    <td style={{ textAlign: 'right' }}>{student.average_score ? parseFloat(student.average_score).toFixed(2) : 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}><strong>{student.grade || 'N/A'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedClass ? (
          <div className="loading">No ranking data available for this class.</div>
        ) : null}
      </div>

      {/* ── Card 2: Student Performance Summary ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}>
            person_search
          </span>
          <h2 style={{ marginBottom: 0 }}>Student Performance Summary</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)', marginBottom: '20px' }}>
          View detailed performance breakdown for an individual student.
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 280px', marginBottom: 0 }}>
            <label>Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.admission_number})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button onClick={handleViewStudentSummary} className="btn btn-primary" disabled={!selectedStudent} style={{ height: '48px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
              View Summary
            </button>
            <button
              onClick={handleDownloadStudentReport}
              className="btn btn-secondary"
              disabled={!selectedStudent || !studentSummary}
              style={{ height: '48px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Report Card
            </button>
          </div>
        </div>

        {loadingSummary ? (
          <div className="loading">Loading summary…</div>
        ) : studentSummary ? (
          <div style={{ 
            background: 'var(--surface-container)', 
            borderRadius: 'var(--radius-xl)', 
            padding: '24px',
            border: '1px solid var(--outline-variant)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 'var(--fs-headline-md)', fontWeight: 600 }}>{studentSummary.name}</h3>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div className="stream-card-meta-label">Admission Number</div>
                  <div style={{ fontSize: 'var(--fs-body-md)', marginTop: 2 }}>{studentSummary.admission_number}</div>
                </div>
                <div>
                  <div className="stream-card-meta-label">Class Stream</div>
                  <div style={{ fontSize: 'var(--fs-body-md)', marginTop: 2 }}>{studentSummary.stream || getStreamName(studentSummary.class_stream_id)}</div>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '16px',
              padding: '16px',
              background: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '20px',
            }}>
              {[
                { label: 'Subjects Sat', value: studentSummary.subjects_sat || 0, color: 'var(--on-surface)' },
                { label: 'Total Marks', value: studentSummary.total_marks || 'N/A', color: 'var(--primary-fixed-dim)' },
                { label: 'Average Score', value: studentSummary.average_score ? parseFloat(studentSummary.average_score).toFixed(2) : 'N/A', color: 'var(--primary-fixed-dim)' },
                { label: 'Overall Grade', value: studentSummary.grade || 'N/A', color: 'var(--primary-fixed-dim)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div className="stream-card-meta-label" style={{ marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
                </div>
              ))}
            </div>

            {studentSummary.subjects && studentSummary.subjects.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>Subject Performance</h4>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th style={{ textAlign: 'right' }}>Exam</th>
                        <th style={{ textAlign: 'right' }}>C.A.</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentSummary.subjects.map((subject, idx) => (
                        <tr key={idx}>
                          <td>{subject.subject_name}</td>
                          <td style={{ textAlign: 'right' }}>{subject.exam_score}</td>
                          <td style={{ textAlign: 'right' }}>{subject.continuous_assessment}</td>
                          <td style={{ textAlign: 'right' }}><strong>{subject.total_score}</strong></td>
                          <td style={{ textAlign: 'center' }}><strong>{subject.grade}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : selectedStudent ? (
          <div className="loading">No performance data available for this student.</div>
        ) : null}
      </div>
    </>
  );
}

export default Results;

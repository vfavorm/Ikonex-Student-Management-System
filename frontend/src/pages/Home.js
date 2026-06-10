import React, { useState, useEffect } from 'react';
import { getAllStudents } from '../services/studentService';
import { getAllClassStreams } from '../services/classStreamService';
import { getAllSubjects } from '../services/subjectService';
import { getAllScores } from '../services/scoreService';
import { Link } from 'react-router-dom';

const STAT_TILES = [
  { key: 'students',    label: 'Students',        icon: 'group',      color: 'var(--primary-fixed-dim)' },
  { key: 'classStreams', label: 'Class Streams',   icon: 'school',     color: 'var(--secondary)'         },
  { key: 'subjects',    label: 'Subjects',         icon: 'menu_book',  color: 'var(--tertiary-fixed-dim)'},
  { key: 'scores',      label: 'Scores Recorded',  icon: 'assessment', color: '#86efac'                  },
];

const QUICK_ACTIONS = [
  {
    to:    '/class-streams',
    icon:  'school',
    color: 'var(--primary-fixed-dim)',
    title: 'Manage Class Streams',
    desc:  'Create and organize class streams',
  },
  {
    to:    '/students',
    icon:  'group',
    color: 'var(--secondary)',
    title: 'Manage Students',
    desc:  'Register and manage student records',
  },
  {
    to:    '/subjects',
    icon:  'menu_book',
    color: 'var(--tertiary-fixed-dim)',
    title: 'Manage Subjects',
    desc:  'Create and assign subjects',
  },
  {
    to:    '/scores',
    icon:  'edit_note',
    color: '#86efac',
    title: 'Record Scores',
    desc:  'Input exam and assessment scores',
  },
  {
    to:    '/results',
    icon:  'analytics',
    color: 'var(--primary-fixed-dim)',
    title: 'View Results',
    desc:  'Rankings and report generation',
  },
];

function Home() {
  const [stats, setStats] = useState({ students: 0, classStreams: 0, subjects: 0, scores: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [studentsRes, streamsRes, subjectsRes, scoresRes] = await Promise.all([
        getAllStudents(),
        getAllClassStreams(),
        getAllSubjects(),
        getAllScores(),
      ]);
      setStats({
        students:     studentsRes.data.length,
        classStreams: streamsRes.data.length,
        subjects:     subjectsRes.data.length,
        scores:       scoresRes.data.length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Welcome card ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 32, color: 'var(--primary-fixed-dim)' }}
          >
            school
          </span>
          <h2 style={{ marginBottom: 0 }}>Student Results Management</h2>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-body-md)' }}>
          Manage students, class streams, subjects, scores, and generate comprehensive reports.
        </p>
      </div>

      {/* ── System Overview ── */}
      <div className="card">
        <h2>System Overview</h2>

        {loading ? (
          <div className="loading">Loading statistics…</div>
        ) : (
          <div className="stats-grid">
            {STAT_TILES.map(({ key, label, icon, color }) => (
              <div className="stat-tile" key={key}>
                <span
                  className="material-symbols-outlined stat-tile-icon"
                  style={{ color }}
                >
                  {icon}
                </span>
                <div>
                  <div className="stat-tile-number">{stats[key]}</div>
                  <div className="stat-tile-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="card">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          {QUICK_ACTIONS.map(({ to, icon, color, title, desc }) => (
            <Link className="quick-action-link" to={to} key={to}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color, flexShrink: 0 }}
              >
                {icon}
              </span>
              <div>
                <div className="quick-action-title">{title}</div>
                <div className="quick-action-desc">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
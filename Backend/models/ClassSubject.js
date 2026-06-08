const pool = require('../config/database');

class ClassSubject {
  static async assign(classStreamId, subjectId) {
    const [result] = await pool.execute(
      'INSERT INTO class_subjects (class_stream_id, subject_id) VALUES (?, ?)',
      [classStreamId, subjectId]
    );
    return result.insertId;
  }

  static async getByClassStream(classStreamId) {
    const [rows] = await pool.execute(
      'SELECT cs.id, s.id as subject_id, s.name, s.code FROM class_subjects cs JOIN subjects s ON cs.subject_id = s.id WHERE cs.class_stream_id = ?',
      [classStreamId]
    );
    return rows;
  }

  static async remove(classStreamId, subjectId) {
    await pool.execute(
      'DELETE FROM class_subjects WHERE class_stream_id = ? AND subject_id = ?',
      [classStreamId, subjectId]
    );
  }
}

module.exports = ClassSubject;

const pool = require('../config/database');

class Score {
  static async create(studentId, subjectId, examScore, continuousAssessment) {
    const totalScore = examScore + continuousAssessment;
    const [gradeRows] = await pool.execute(
      'SELECT grade FROM grading_scales WHERE min_score <= ? AND max_score >= ? LIMIT 1',
      [totalScore, totalScore]
    );
    const grade = gradeRows[0]?.grade || 'N/A';
    
    const [result] = await pool.execute(
      'INSERT INTO scores (student_id, subject_id, exam_score, continuous_assessment, total_score, grade) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, subjectId, examScore, continuousAssessment, totalScore, grade]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM scores');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM scores WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByStudent(studentId) {
    const [rows] = await pool.execute(
      'SELECT s.*, sub.name as subject_name FROM scores s JOIN subjects sub ON s.subject_id = sub.id WHERE s.student_id = ?',
      [studentId]
    );
    return rows;
  }

  static async getBySubjectAndClassStream(subjectId, classStreamId) {
    const [rows] = await pool.execute(
      `SELECT s.*, st.name as student_name FROM scores s 
       JOIN students st ON s.student_id = st.id 
       WHERE s.subject_id = ? AND st.class_stream_id = ?`,
      [subjectId, classStreamId]
    );
    return rows;
  }

  static async update(id, examScore, continuousAssessment) {
    const totalScore = examScore + continuousAssessment;
    const [gradeRows] = await pool.execute(
      'SELECT grade FROM grading_scales WHERE min_score <= ? AND max_score >= ? LIMIT 1',
      [totalScore, totalScore]
    );
    const grade = gradeRows[0]?.grade || 'N/A';
    
    await pool.execute(
      'UPDATE scores SET exam_score = ?, continuous_assessment = ?, total_score = ?, grade = ? WHERE id = ?',
      [examScore, continuousAssessment, totalScore, grade, id]
    );
  }

  static async updateGrade(id, grade) {
    await pool.execute(
      'UPDATE scores SET grade = ? WHERE id = ?',
      [grade, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM scores WHERE id = ?', [id]);
  }

  static async checkDuplicate(studentId, subjectId) {
    const [rows] = await pool.execute(
      'SELECT id FROM scores WHERE student_id = ? AND subject_id = ?',
      [studentId, subjectId]
    );
    return rows.length > 0;
  }
}

module.exports = Score;

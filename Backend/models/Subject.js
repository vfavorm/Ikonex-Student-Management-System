const pool = require('./config/database');

class Subject {
  static async create(name, code) {
    const [result] = await pool.execute(
      'INSERT INTO subjects (name, code) VALUES (?, ?)',
      [name, code]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM subjects');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM subjects WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, name, code) {
    await pool.execute(
      'UPDATE subjects SET name = ?, code = ? WHERE id = ?',
      [name, code, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id]);
  }

  static async getByClassStream(classStreamId) {
    const [rows] = await pool.execute(
      'SELECT s.* FROM subjects s JOIN class_subjects cs ON s.id = cs.subject_id WHERE cs.class_stream_id = ?',
      [classStreamId]
    );
    return rows;
  }
}

module.exports = Subject;

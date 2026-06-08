const pool = require('./config/database');

class Student {
  static async create(name, admissionNumber, classStreamId, dateOfBirth) {
    const [result] = await pool.execute(
      'INSERT INTO students (name, admission_number, class_stream_id, date_of_birth) VALUES (?, ?, ?, ?)',
      [name, admissionNumber, classStreamId, dateOfBirth]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM students');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByClassStream(classStreamId) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE class_stream_id = ?',
      [classStreamId]
    );
    return rows;
  }

  static async update(id, name, admissionNumber, classStreamId, dateOfBirth) {
    await pool.execute(
      'UPDATE students SET name = ?, admission_number = ?, class_stream_id = ?, date_of_birth = ? WHERE id = ?',
      [name, admissionNumber, classStreamId, dateOfBirth, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM students WHERE id = ?', [id]);
  }
}

module.exports = Student;

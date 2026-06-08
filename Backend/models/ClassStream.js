const pool = require('../config/database');

class ClassStream {
  static async create(name) {
    const [result] = await pool.execute(
      'INSERT INTO class_streams (name) VALUES (?)',
      [name]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM class_streams');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM class_streams WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, name) {
    await pool.execute(
      'UPDATE class_streams SET name = ? WHERE id = ?',
      [name, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM class_streams WHERE id = ?', [id]);
  }
}

module.exports = ClassStream;

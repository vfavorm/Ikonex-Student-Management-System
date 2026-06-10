const pool = require('../config/database');
const bcryptjs = require('bcryptjs');

class User {
  static async create(name, email, password) {
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return result.insertId;
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async update(id, name, email) {
    await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcryptjs.compare(password, hashedPassword);
  }
}

module.exports = User;

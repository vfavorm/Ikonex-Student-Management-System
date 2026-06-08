const pool = require('../config/database');

class Result {
  static async getStudentSummary(studentId) {
    const [rows] = await pool.execute(
      `SELECT 
        st.id,
        st.name, 
        st.admission_number, 
        cs.name as stream,
        COUNT(sc.id) as subjects_sat,
        SUM(sc.total_score) as total_marks,
        ROUND(AVG(sc.total_score), 2) as average_score
      FROM students st
      JOIN class_streams cs ON st.class_stream_id = cs.id
      LEFT JOIN scores sc ON sc.student_id = st.id
      WHERE st.id = ?
      GROUP BY st.id`,
      [studentId]
    );
    return rows[0];
  }

  static async getClassRanking(classStreamId) {
    const [rows] = await pool.execute(
      `SELECT 
        st.id, 
        st.name, 
        st.admission_number,
        SUM(sc.total_score) as total_marks,
        ROUND(AVG(sc.total_score), 2) as average_score
      FROM students st
      LEFT JOIN scores sc ON sc.student_id = st.id
      WHERE st.class_stream_id = ?
      GROUP BY st.id
      ORDER BY total_marks DESC`,
      [classStreamId]
    );
    
    let position = 1;
    return rows.map((row, i) => {
      if (i > 0 && row.total_marks < rows[i - 1].total_marks) position = i + 1;
      return { ...row, position };
    });
  }

  static async getSubjectPositions(subjectId, classStreamId) {
    const [rows] = await pool.execute(
      `SELECT 
        st.id,
        st.name,
        st.admission_number,
        sc.total_score,
        sc.grade
      FROM students st
      LEFT JOIN scores sc ON sc.student_id = st.id AND sc.subject_id = ?
      WHERE st.class_stream_id = ?
      ORDER BY sc.total_score DESC`,
      [subjectId, classStreamId]
    );

    let position = 1;
    return rows.map((row, i) => {
      if (i > 0 && row.total_score < rows[i - 1].total_score) position = i + 1;
      return { ...row, position };
    });
  }

  static async getClassPerformanceBySubject(subjectId, classStreamId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(st.id) as total_students,
        COUNT(sc.id) as sat_exam,
        ROUND(AVG(sc.total_score), 2) as class_average,
        MAX(sc.total_score) as highest_score,
        MIN(sc.total_score) as lowest_score
      FROM students st
      LEFT JOIN scores sc ON sc.student_id = st.id AND sc.subject_id = ?
      WHERE st.class_stream_id = ?`,
      [subjectId, classStreamId]
    );
    return rows[0];
  }
}

module.exports = Result;

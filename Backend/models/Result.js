const pool = require('../config/database');

class Result {
  static async getStudentSummary(studentId) {
    // Get student basic info and aggregated scores
    const [rows] = await pool.execute(
      `SELECT 
        st.id,
        st.name, 
        st.admission_number, 
        st.class_stream_id,
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
    
    if (!rows[0]) return null;
    
    const summary = rows[0];
    
    // Calculate grade based on average score
    if (summary.average_score) {
      const [gradeRows] = await pool.execute(
        `SELECT grade FROM grading_scales 
        WHERE ? BETWEEN min_score AND max_score 
        LIMIT 1`,
        [summary.average_score]
      );
      summary.grade = gradeRows[0]?.grade || 'N/A';
    }
    
    // Get individual subject scores
    const [subjectScores] = await pool.execute(
      `SELECT 
        subj.name as subject_name,
        sc.exam_score,
        sc.continuous_assessment,
        sc.total_score,
        sc.grade
      FROM scores sc
      JOIN subjects subj ON sc.subject_id = subj.id
      WHERE sc.student_id = ?
      ORDER BY subj.name`,
      [studentId]
    );
    
    summary.subjects = subjectScores;
    
    return summary;
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
    
    // Add position and grade to each student
    let position = 1;
    const rankedStudents = await Promise.all(rows.map(async (row, i) => {
      if (i > 0 && row.total_marks < rows[i - 1].total_marks) position = i + 1;
      
      // Get grade based on average score
      let grade = 'N/A';
      if (row.average_score) {
        const [gradeRows] = await pool.execute(
          `SELECT grade FROM grading_scales 
          WHERE ? BETWEEN min_score AND max_score 
          LIMIT 1`,
          [row.average_score]
        );
        grade = gradeRows[0]?.grade || 'N/A';
      }
      
      return { ...row, position, grade };
    }));
    
    return rankedStudents;
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

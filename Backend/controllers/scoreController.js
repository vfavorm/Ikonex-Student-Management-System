const Score = require('../models/Score');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

exports.recordScore = async (req, res) => {
  try {
    const { studentId, subjectId, examScore, continuousAssessment } = req.body;
    
    if (!studentId || !subjectId || examScore === undefined || continuousAssessment === undefined) {
      return res.status(400).json({ error: 'Student, subject, exam score, and continuous assessment are required' });
    }
    
    const student = await Student.getById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const subject = await Subject.getById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const isDuplicate = await Score.checkDuplicate(studentId, subjectId);
    if (isDuplicate) return res.status(400).json({ error: 'Score already exists for this student and subject' });
    
    if (examScore < 0 || continuousAssessment < 0) {
      return res.status(400).json({ error: 'Scores cannot be negative' });
    }
    
    const id = await Score.create(studentId, subjectId, examScore, continuousAssessment);
    const score = await Score.getById(id);
    res.status(201).json({ ...score, message: 'Score recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllScores = async (req, res) => {
  try {
    const scores = await Score.getAll();
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const score = await Score.getById(id);
    if (!score) return res.status(404).json({ error: 'Score not found' });
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentScores = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.getById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const scores = await Score.getByStudent(studentId);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectClassScores = async (req, res) => {
  try {
    const { subjectId, classStreamId } = req.params;
    const scores = await Score.getBySubjectAndClassStream(subjectId, classStreamId);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { examScore, continuousAssessment } = req.body;
    
    const score = await Score.getById(id);
    if (!score) return res.status(404).json({ error: 'Score not found' });
    
    if (examScore < 0 || continuousAssessment < 0) {
      return res.status(400).json({ error: 'Scores cannot be negative' });
    }
    
    await Score.update(id, examScore, continuousAssessment);
    const updatedScore = await Score.getById(id);
    res.json({ ...updatedScore, message: 'Score updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;
    const score = await Score.getById(id);
    if (!score) return res.status(404).json({ error: 'Score not found' });
    
    await Score.delete(id);
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

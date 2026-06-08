const Result = require('../models/Result');
const Student = require('../models/Student');
const ClassStream = require('../models/ClassStream');
const Subject = require('../models/Subject');

exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.getById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const summary = await Result.getStudentSummary(studentId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassRanking = async (req, res) => {
  try {
    const { classStreamId } = req.params;
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const ranking = await Result.getClassRanking(classStreamId);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectPositions = async (req, res) => {
  try {
    const { subjectId, classStreamId } = req.params;
    const subject = await Subject.getById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const positions = await Result.getSubjectPositions(subjectId, classStreamId);
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassPerformanceBySubject = async (req, res) => {
  try {
    const { subjectId, classStreamId } = req.params;
    const subject = await Subject.getById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const performance = await Result.getClassPerformanceBySubject(subjectId, classStreamId);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Subject = require('../models/Subject');
const ClassSubject = require('../models/ClassSubject');
const ClassStream = require('../models/ClassStream');

exports.createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    
    const id = await Subject.create(name, code);
    res.status(201).json({ id, name, code, message: 'Subject created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject or code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.getAll();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.getById(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectsByClassStream = async (req, res) => {
  try {
    const { classStreamId } = req.params;
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const subjects = await Subject.getByClassStream(classStreamId);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    
    const subject = await Subject.getById(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    await Subject.update(id, name || subject.name, code || subject.code);
    res.json({ id, message: 'Subject updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.getById(id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    await Subject.delete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignSubjectToClassStream = async (req, res) => {
  try {
    const { classStreamId, subjectId } = req.body;
    if (!classStreamId || !subjectId) return res.status(400).json({ error: 'Class stream and subject are required' });
    
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const subject = await Subject.getById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const id = await ClassSubject.assign(classStreamId, subjectId);
    res.status(201).json({ id, classStreamId, subjectId, message: 'Subject assigned to class stream successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Subject already assigned to this class stream' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.removeSubjectFromClassStream = async (req, res) => {
  try {
    const { classStreamId, subjectId } = req.body;
    if (!classStreamId || !subjectId) return res.status(400).json({ error: 'Class stream and subject are required' });
    
    await ClassSubject.remove(classStreamId, subjectId);
    res.json({ message: 'Subject removed from class stream successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

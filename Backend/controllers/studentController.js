const Student = require('../models/Student');
const ClassStream = require('../models/ClassStream');

exports.registerStudent = async (req, res) => {
  try {
    const { name, admissionNumber, classStreamId, dateOfBirth } = req.body;
    
    if (!name || !admissionNumber || !classStreamId) {
      return res.status(400).json({ error: 'Name, admission number, and class stream are required' });
    }
    
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const id = await Student.create(name, admissionNumber, classStreamId, dateOfBirth);
    res.status(201).json({ id, name, admissionNumber, classStreamId, dateOfBirth, message: 'Student registered successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Admission number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.getById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentsByClassStream = async (req, res) => {
  try {
    const { classStreamId } = req.params;
    const stream = await ClassStream.getById(classStreamId);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    const students = await Student.getByClassStream(classStreamId);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, admissionNumber, classStreamId, dateOfBirth } = req.body;
    
    const student = await Student.getById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    if (classStreamId) {
      const stream = await ClassStream.getById(classStreamId);
      if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    }
    
    await Student.update(id, name || student.name, admissionNumber || student.admission_number, classStreamId || student.class_stream_id, dateOfBirth || student.date_of_birth);
    res.json({ id, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.getById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    await Student.delete(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

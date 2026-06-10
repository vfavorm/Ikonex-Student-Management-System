const Result = require('../models/Result');
const Score = require('../models/Score');
const Student = require('../models/Student');
const ClassStream = require('../models/ClassStream');
const { generateReportCard, generateClassReport } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

exports.generateStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.getById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const studentData = await Result.getStudentSummary(studentId);
    
    // Use the subjects array from getStudentSummary which includes subject names
    const scores = studentData.subjects || [];
    
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    
    const fileName = `report_${student.admission_number}_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    
    await generateReportCard(studentData, scores, filePath);
    
    res.download(filePath, `${student.admission_number}_report_card.pdf`, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, (err) => { if (err) console.error(err); });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateClassReport = async (req, res) => {
  try {
    const { classStreamId } = req.params;
    
    const classStream = await ClassStream.getById(classStreamId);
    if (!classStream) return res.status(404).json({ error: 'Class stream not found' });
    
    const students = await Result.getClassRanking(classStreamId);
    
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    
    const fileName = `class_report_${classStream.name}_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    
    await generateClassReport(classStream, students, filePath);
    
    res.download(filePath, `${classStream.name}_class_report.pdf`, (err) => {
      if (err) console.error(err);
      fs.unlink(filePath, (err) => { if (err) console.error(err); });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
